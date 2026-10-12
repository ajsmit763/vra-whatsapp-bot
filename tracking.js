const { randomUUID } = require('node:crypto');
const { transaction } = require('./storage');
const { buildSummary } = require('./summaries');

function initialSession() {
  return { languageCode: null, languageName: null, state: 'language', clientInfo: {
    fullName: '', passportNumber: '', vraReferenceNumber: '' }, clientInfoComplete: false, conversationHistory: [] };
}
function passportKey(value) {
  const key = String(value || '').trim().toUpperCase().replace(/[ -]/g, '');
  // Conservative matching, not passport verification. Never change the customer's answer.
  if (!/^[A-Z0-9]{6,20}$/.test(key) || !/\d/.test(key) || /^(.)\1+$/.test(key) ||
      /^(0+|1+|NOTPROVIDED|UNKNOWN\d*|PASSPORT\d*|TEST\d*|DUMMY\d*|SAMPLE\d*|NONE|SKIP|NA|NULL)$/i.test(key) ||
      (/^\d+$/.test(key) && ('01234567890123456789'.includes(key) || '98765432109876543210'.includes(key)))) return null;
  return key;
}
function nameKey(value) {
  return String(value || '').normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}
class Tracker {
  constructor({ pool, handleInput, sendReply, sendEmail }) {
    this.pool = pool; this.handleInput = handleInput; this.sendReply = sendReply; this.sendEmail = sendEmail;
  }
  async ingest(events) {
    return transaction(this.pool, async db => {
      const ids = new Set();
      for (const e of events) {
        if (!e.eventId || !e.address) throw new Error('Webhook message identity missing');
        const client = (await db.query(`INSERT INTO vra_clients(id,platform,address) VALUES($1,$2,$3)
          ON CONFLICT(platform,address) DO UPDATE SET address=EXCLUDED.address RETURNING id`,
          [randomUUID(), e.platform, e.address])).rows[0];
        await db.query(`INSERT INTO vra_inbox(platform,event_id,client_id,body,kind,source_at)
          VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(platform,event_id) DO NOTHING`,
          [e.platform, e.eventId, client.id, e.body, e.kind || 'text', e.sourceAt || null]);
        ids.add(client.id);
      }
      return [...ids];
    });
  }
  async processClient(clientId, limit = 100) {
    let count = 0;
    for (; count < limit; count++) {
      const processed = await transaction(this.pool, async db => {
        // Shared lock order with inactivity closer; serializes all activity for this number/chat.
        const client = (await db.query('SELECT * FROM vra_clients WHERE id=$1 FOR NO KEY UPDATE', [clientId])).rows[0];
        const event = (await db.query(`SELECT * FROM vra_inbox WHERE client_id=$1 AND processed_at IS NULL
          ORDER BY seq LIMIT 1 FOR UPDATE`, [clientId])).rows[0];
        if (!event) return false;
        let conversation = (await db.query(`SELECT * FROM vra_conversations WHERE client_id=$1 AND closed_at IS NULL FOR UPDATE`, [clientId])).rows[0];
        // A delayed scheduler must not extend an expired session simply because it has not run yet.
        if (conversation && new Date(event.received_at) - new Date(conversation.last_activity_at) >= 30 * 60000) {
          await this.close(db, conversation, 'inactivity'); conversation = null;
        }
        if (!conversation) {
          const prior = (await db.query(`SELECT * FROM vra_conversations WHERE client_id=$1 ORDER BY seq DESC LIMIT 1`, [clientId])).rows[0];
          const late = prior?.close_reason === 'inactivity' && prior.session.state === 'review' &&
            event.kind === 'text' && /^[1-5]$/.test(event.body.trim()) &&
            new Date(event.received_at) - new Date(prior.last_activity_at) <= 24 * 3600000;
          const session = late ? { ...prior.session, conversationHistory: [], rating: null } : initialSession();
          conversation = (await db.query(`INSERT INTO vra_conversations(id,client_id,started_at,last_activity_at,session,last_step,previous_id,late_rating_for)
            VALUES($1,$2,$3,$3,$4,$5,$6,$7) RETURNING *`, [randomUUID(), clientId, event.received_at, session, session.state, prior?.id || null, late ? prior.id : null])).rows[0];
        }
        const session = conversation.session;
        await db.query(`INSERT INTO vra_messages(conversation_id,inbox_seq,sender,body,at,source_at,step)
          VALUES($1,$2,'Client',$3,$4,$5,$6)`, [conversation.id,event.seq,event.body,event.received_at,event.source_at,session.state]);
        if (event.kind === 'text' && event.body.trim()) {
          // No network effects inside the transaction; replies and the new state commit atomically.
          await this.handleInput(event.body.trim(), session, async body => {
            const message = (await db.query(`INSERT INTO vra_messages(conversation_id,inbox_seq,sender,body,step,delivery)
              VALUES($1,$2,'Bot',$3,$4,'queued') RETURNING seq`, [conversation.id,event.seq,body,session.state])).rows[0];
            await db.query(`INSERT INTO vra_jobs(id,kind,conversation_id,message_seq,payload) VALUES($1,'reply',$2,$3,$4)`,
              [randomUUID(),conversation.id,message.seq,{ platform: client.platform, address: client.address, body }]);
          }, client.platform, client.address);
        }
        // Transcript lives in rows, independent of the legacy handler's greeting/reset behavior.
        session.conversationHistory = [];
        conversation = (await db.query(`UPDATE vra_conversations SET session=$2,last_step=$3,rating=$4,
          last_activity_at=GREATEST(last_activity_at,$5,now()) WHERE id=$1 RETURNING *`,
          [conversation.id,session,session.state,session.rating || null,event.received_at])).rows[0];
        await this.linkPassport(db, clientId, conversation);
        if (session.rating) await this.close(db, conversation, 'rating');
        await db.query('UPDATE vra_inbox SET processed_at=now(),conversation_id=$2,session_after=$3 WHERE seq=$1', [event.seq,conversation.id,session]);
        return true;
      });
      if (!processed) break;
    }
    return count;
  }
  async linkPassport(db, clientId, conversation) {
    const info = conversation.session.clientInfo || {};
    const passport = passportKey(info.passportNumber), name = nameKey(info.fullName);
    if (!passport || name.replace(/[^\p{L}]/gu, '').length < 3 || /^(unknown|test|not provided|none)$/i.test(name)) return;
    // Transaction advisory lock prevents two new claimants racing during passport matching.
    await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`passport:${passport}`]);
    await db.query(`INSERT INTO vra_passport_claims(client_id,passport,name_key,conversation_id)
      VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`, [clientId,passport,name,conversation.id]);
    const claims = (await db.query('SELECT * FROM vra_passport_claims WHERE passport=$1', [passport])).rows;
    const people = [...new Set(claims.map(c => c.client_id))];
    const names = new Set(claims.map(c => c.name_key));
    // Exactly two records with consistent names may be linked, never destructively merged.
    const status = people.length === 2 && names.size === 1 ? 'matched' : 'ambiguous';
    for (let i=0; i<people.length; i++) for(let j=i+1; j<people.length; j++) {
      const [a,b] = [people[i],people[j]].sort();
      await db.query(`INSERT INTO vra_client_links(client_a,client_b,passport,status,reason) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(client_a,client_b,passport) DO UPDATE SET status=EXCLUDED.status,reason=EXCLUDED.reason,updated_at=now()`,
        [a,b,passport,status,status==='matched'?'Same plausible passport and normalized name; unverified':'Multiple candidates or conflicting names; manual review required']);
    }
  }
  async close(db, conversation, reason) {
    const closed = (await db.query(`UPDATE vra_conversations SET closed_at=now(),close_reason=$2
      WHERE id=$1 AND closed_at IS NULL RETURNING id`, [conversation.id,reason])).rows[0];
    if (closed) await db.query(`INSERT INTO vra_jobs(id,kind,conversation_id,payload) VALUES($1,'summary',$2,'{}')
      ON CONFLICT DO NOTHING`, [randomUUID(),conversation.id]);
  }
  async closeInactive(limit = 500) {
    const candidates = (await this.pool.query(`SELECT client_id FROM vra_conversations WHERE closed_at IS NULL
      AND last_activity_at <= now()-interval '30 minutes' ORDER BY last_activity_at LIMIT $1`, [limit])).rows;
    for (const { client_id } of candidates) await transaction(this.pool, async db => {
      await db.query('SELECT id FROM vra_clients WHERE id=$1 FOR NO KEY UPDATE', [client_id]);
      // If a message arrived before the scheduler, let the handler apply it first (including ratings).
      const pending = (await db.query('SELECT 1 FROM vra_inbox WHERE client_id=$1 AND processed_at IS NULL LIMIT 1', [client_id])).rowCount;
      if (pending) return;
      const c = (await db.query(`SELECT * FROM vra_conversations WHERE client_id=$1 AND closed_at IS NULL
        AND last_activity_at <= now()-interval '30 minutes' FOR UPDATE`, [client_id])).rows[0];
      if (c) await this.close(db,c,'inactivity');
    });
  }
  async summary(db, conversationId) {
    const conversation = (await db.query('SELECT * FROM vra_conversations WHERE id=$1', [conversationId])).rows[0];
    const client = (await db.query('SELECT * FROM vra_clients WHERE id=$1', [conversation.client_id])).rows[0];
    const messages = (await db.query('SELECT * FROM vra_messages WHERE conversation_id=$1 ORDER BY seq', [conversationId])).rows;
    const links = (await db.query(`SELECT status,CASE WHEN client_a=$1 THEN client_b ELSE client_a END AS other_id
      FROM vra_client_links WHERE client_a=$1 OR client_b=$1`, [client.id])).rows;
    return buildSummary(conversation,client,messages,links);
  }
  async claimJob() {
    return transaction(this.pool, async db => {
      // Recover interrupted attempts conservatively. Never blindly resend an old uncertain email.
      await db.query(`UPDATE vra_delivery_attempts a SET finished_at=now(),outcome='interrupted',error='Worker interrupted; acceptance unknown'
        FROM vra_jobs j WHERE a.job_id=j.id AND a.attempt=j.attempts AND a.finished_at IS NULL
        AND j.state='sending' AND j.lease_until < now()`);
      await db.query(`UPDATE vra_jobs SET state=CASE WHEN kind='reply' OR
        COALESCE(uncertain_since,first_attempt_at) < now()-interval '10 minutes' THEN 'needs_review' ELSE 'pending' END,
        uncertain_since=COALESCE(uncertain_since,first_attempt_at),last_error='Worker interrupted; acceptance unknown',due_at=now()
        WHERE state='sending' AND lease_until < now()`);
      await db.query(`UPDATE vra_jobs SET state='needs_review',last_error='Unknown acceptance outside safe retry window; check provider logs'
        WHERE state='pending' AND uncertain_since < now()-interval '10 minutes'`);
      await db.query(`UPDATE vra_messages m SET delivery='needs_review' FROM vra_jobs j
        WHERE j.message_seq=m.seq AND j.kind='reply' AND j.state='needs_review' AND m.delivery<>'needs_review'`);
      const job = (await db.query(`SELECT j.* FROM vra_jobs j WHERE j.state='pending' AND j.due_at <= now()
        AND (j.kind <> 'summary' OR NOT EXISTS(SELECT 1 FROM vra_jobs r WHERE r.conversation_id=j.conversation_id
          AND r.kind='reply' AND r.state IN ('pending','sending')))
        AND (j.kind <> 'reply' OR NOT EXISTS(SELECT 1 FROM vra_jobs r JOIN vra_conversations rc ON rc.id=r.conversation_id
          JOIN vra_conversations jc ON jc.id=j.conversation_id WHERE rc.client_id=jc.client_id AND r.kind='reply'
          AND r.message_seq < j.message_seq AND r.state IN ('pending','sending')))
        ORDER BY CASE WHEN j.kind='reply' THEN 0 ELSE 1 END,j.due_at,j.id LIMIT 1 FOR UPDATE OF j SKIP LOCKED`)).rows[0];
      if (!job) return null;
      if (job.kind==='summary' && job.attempts===0) job.payload=await this.summary(db,job.conversation_id);
      job.lock_token=randomUUID();
      await db.query(`UPDATE vra_jobs SET state='sending',attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,now()),
        lease_until=now()+interval '2 minutes',lock_token=$2,payload=$3 WHERE id=$1`, [job.id,job.lock_token,job.payload]);
      job.attempts++;
      await db.query('INSERT INTO vra_delivery_attempts(job_id,attempt) VALUES($1,$2)', [job.id,job.attempts]);
      return job;
    });
  }
  async deliver(limit=100) {
    let count=0;
    for(;count<limit;count++) {
      const job=await this.claimJob(); if(!job) break;
      let result, error;
      try { result=job.kind==='summary' ? await this.sendEmail(job.payload,job.id) : await this.sendReply(job.payload); }
      catch(e) { error=e; }
      await transaction(this.pool, async db => {
        const held=(await db.query(`SELECT id FROM vra_jobs WHERE id=$1 AND lock_token=$2 AND state='sending' FOR UPDATE`,[job.id,job.lock_token])).rowCount;
        if(!held) return;
        if(!error) {
          await db.query(`UPDATE vra_jobs SET state='sent',accepted_at=now(),provider_id=$2,last_error=NULL WHERE id=$1`,[job.id,result?.providerId||null]);
          if(job.message_seq) await db.query(`UPDATE vra_messages SET delivery='accepted',provider_id=$2 WHERE seq=$1`,[job.message_seq,result?.providerId||null]);
          await db.query(`UPDATE vra_delivery_attempts SET finished_at=now(),outcome='accepted',provider_id=$3 WHERE job_id=$1 AND attempt=$2`,[job.id,job.attempts,result?.providerId||null]);
        } else {
          const uncertain=error.uncertain !== false;
          const review=(uncertain && job.kind==='reply') || job.attempts>=8;
          const delay=Math.min(3600,30*2**(job.attempts-1));
          // Only sanitized errors from our adapters are retained, never API keys or payloads.
          const message=String(error.safeMessage || (error.message?.startsWith('Brevo')?error.message:'Delivery failed; check configuration/provider')).slice(0,200);
          await db.query(`UPDATE vra_jobs SET state=$2,due_at=now()+$3*interval '1 second',last_error=$4,
            uncertain_since=CASE WHEN $5 THEN COALESCE(uncertain_since,first_attempt_at) ELSE uncertain_since END WHERE id=$1`,
            [job.id,review?'needs_review':'pending',delay,message,uncertain]);
          if(job.message_seq) await db.query(`UPDATE vra_messages SET delivery=$2 WHERE seq=$1`,[job.message_seq,review?'needs_review':'retry_pending']);
          await db.query(`UPDATE vra_delivery_attempts SET finished_at=now(),outcome=$3,error=$4 WHERE job_id=$1 AND attempt=$2`,
            [job.id,job.attempts,uncertain?'unknown':'rejected',message]);
        }
      });
    }
    return count;
  }
  async runScheduled() {
    const runId=randomUUID(); await this.pool.query('INSERT INTO vra_job_runs(id) VALUES($1)',[runId]);
    try {
      const pending=(await this.pool.query('SELECT DISTINCT client_id FROM vra_inbox WHERE processed_at IS NULL LIMIT 500')).rows;
      for(const {client_id} of pending) await this.processClient(client_id);
      await this.deliver(500); await this.closeInactive(); await this.deliver(500);
      await this.pool.query('UPDATE vra_job_runs SET finished_at=now() WHERE id=$1',[runId]);
      const attention=(await this.pool.query(`SELECT count(*)::int AS count FROM vra_jobs WHERE state='needs_review'`)).rows[0].count;
      return { attention };
    } catch(error) {
      await this.pool.query("UPDATE vra_job_runs SET finished_at=now(),error='Scheduled processing failed' WHERE id=$1",[runId]);
      throw error;
    }
  }
}
module.exports={Tracker,initialSession,passportKey,nameKey};
