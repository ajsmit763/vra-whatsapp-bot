// Operator-only CLI. No public endpoint can reset a sent/uncertain email.
const { createPool, transaction }=require('./storage');
async function main() {
  const [id,action,...noteParts]=process.argv.slice(2);
  const note=noteParts.join(' ');
  if(!/^[0-9a-f-]{36}$/i.test(id||'') || !['accepted','retry-confirmed-unsent'].includes(action) || note.length<10) {
    throw new Error('Usage: npm run summaries:resolve -- JOB_UUID accepted|retry-confirmed-unsent "Provider-log evidence, no personal details"');
  }
  const pool=createPool();
  try { await transaction(pool,async db=>{
    const job=(await db.query("SELECT * FROM vra_jobs WHERE id=$1 AND kind='summary' AND state='needs_review' FOR UPDATE",[id])).rows[0];
    if(!job) throw new Error('Only a summary requiring review can be resolved.');
    if(action==='accepted') await db.query("UPDATE vra_jobs SET state='sent',accepted_at=now(),last_error=$2 WHERE id=$1",[id,`Operator verified acceptance: ${note}`]);
    else {
      // Preserve the job ID (and attempt audit). The provider must have confirmed non-acceptance.
      await db.query("UPDATE vra_jobs SET state='pending',due_at=now(),uncertain_since=NULL,first_attempt_at=NULL,last_error=$2 WHERE id=$1",[id,`Operator verified not sent: ${note}`]);
    }
    await db.query(`INSERT INTO vra_delivery_attempts(job_id,attempt,finished_at,outcome,error)
      VALUES($1,$2,now(),$3,$4)`,[id,job.attempts+1,`operator_${action}`,note]);
    await db.query('UPDATE vra_jobs SET attempts=attempts+1 WHERE id=$1',[id]);
  }); console.log('Summary resolution saved. The next scheduled run handles confirmed retries.'); }
  finally { await pool.end(); }
}
main().catch(e=>{console.error(e.message?.startsWith('Usage:')?e.message:'Resolution failed. Verify job state and database access.');process.exitCode=1;});
