const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function localTime(value) {
  return new Intl.DateTimeFormat('en-ZA', { timeZone: 'Africa/Johannesburg', year: 'numeric',
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(value));
}
const stepNames = { language: 'Language selection', client_name: 'Full name', client_passport: 'Passport number',
  client_vra_reference: 'VRA reference', main: 'Main menu', documentation: 'Documentation', videos: 'Videos and Important Info',
  video_item: 'Information post', faq: 'Frequently Asked Questions', feedback: 'Feedback', review: 'Review / rating', complete: 'Completed review' };
function buildSummary(conversation, client, messages, links = []) {
  const info = conversation.session.clientInfo || {};
  const clientRef = `VRA-${client.id}`;
  const reference = `CONV-${conversation.id}`;
  const rows = [ ['Client ID', clientRef], ['Conversation reference', reference],
    ['Platform', client.platform], ['Contact', client.platform === 'WhatsApp' ? `+${client.address}` : client.address],
    ['Name', info.fullName || 'Not provided'], ['Passport', info.passportNumber || 'Not provided'],
    ['VRA reference', info.vraReferenceNumber || 'Not provided'],
    ['Language', conversation.session.languageName || 'Not selected'],
    ['Started (Africa/Johannesburg)', localTime(conversation.started_at)],
    ['Last activity (Africa/Johannesburg)', localTime(conversation.last_activity_at)],
    ['Rating', conversation.rating ? `${conversation.rating.number}/5 — ${conversation.rating.label}` : 'No review submitted'],
    ['Last step reached', stepNames[conversation.last_step] || conversation.last_step],
    ['Closed because', conversation.close_reason === 'rating' ? 'Rating submitted' : '30 minutes without activity'] ];
  if (conversation.previous_id) rows.push(['Previous conversation', `CONV-${conversation.previous_id}`]);
  if (conversation.late_rating_for) rows.push(['Late rating relates to', `CONV-${conversation.late_rating_for}`]);
  for (const link of links) rows.push(['Identity link', `${link.status === 'ambiguous' ? 'REVIEW REQUIRED' : 'Matching passport and name (unverified)'}: VRA-${link.other_id}`]);
  const transcript = messages.map(m => `[${localTime(m.at)}] ${m.sender}${m.sender === 'Bot' ? ` (${m.delivery})` : ''}\n${m.body}`).join('\n\n');
  const textContent = `VRA Support\n\n${rows.map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nFull conversation transcript\n\n${transcript}`;
  const htmlContent = `<!doctype html><html><body style="margin:0;background:#f2f5f8;font-family:Arial,sans-serif;color:#203047">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff">
<tr><td style="padding:24px;background:#12334b;color:#ffffff"><h1 style="margin:0;font-size:26px">VRA Support</h1><p style="margin:8px 0 0">Conversation summary</p></td></tr>
<tr><td style="padding:24px"><table role="presentation" width="100%" cellpadding="8" cellspacing="0">${rows.map(([k,v])=>`<tr><td width="36%" valign="top" style="border-bottom:1px solid #e4e9ef;font-weight:bold">${escapeHtml(k)}</td><td valign="top" style="border-bottom:1px solid #e4e9ef;word-break:break-word">${escapeHtml(v)}</td></tr>`).join('')}</table>
<h2 style="font-size:19px;margin:28px 0 16px">Full conversation transcript</h2>
${messages.map(m=>`<table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="margin-bottom:12px;background:${m.sender==='Bot'?'#eef5fa':'#f5f5f5'}"><tr><td><p style="margin:0 0 8px;font-size:12px;color:#526579">${escapeHtml(m.sender)} · ${escapeHtml(localTime(m.at))}${m.sender==='Bot'?` · ${escapeHtml(m.delivery)}`:''}</p><div style="font-size:14px;line-height:1.6;word-break:break-word">${escapeHtml(m.body).replace(/\r?\n/g,'<br>')}</div></td></tr></table>`).join('')}
<p style="font-size:11px;color:#65758a">Times shown in Africa/Johannesburg. Bot replies show their recorded sending status at the time this summary was prepared. Identity matches are based on client-supplied details.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject: `[${client.platform}] VRA Support | ${clientRef} | ${reference}`, textContent, htmlContent };
}

// Only explicit API rejections are safe to retry indefinitely. A timeout/5xx may follow acceptance.
async function sendBrevo(summary, idempotencyKey, fetchImpl = fetch) {
  if (!process.env.BREVO_API_KEY) { const e = new Error('BREVO_API_KEY missing'); e.uncertain = false; throw e; }
  const payload = { sender: { name: 'VRA Support Bot', email: 'aj@amaxsa.co.za' },
    to: [{ email: process.env.ALERT_TO || 'VRASupportbot@amaxsa.co.za' }],
    ...summary, headers: { idempotencyKey } };
  let response;
  try { response = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', headers: { accept: 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) }); }
  catch { const e = new Error('Brevo request outcome unknown'); e.uncertain = true; throw e; }
  let data = {}; try { data = await response.json(); } catch { /* response may be empty */ }
  if (response.ok) return { providerId: data.messageId || null };
  if (data.code === 'duplicate_parameter' && /idempoten/i.test(String(data.message || ''))) return { providerId: null, deduplicated: true };
  const error = new Error(`Brevo HTTP ${response.status}${data.code ? ` (${String(data.code).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,60)})` : ''}`);
  error.uncertain = response.status >= 500 || response.status === 408;
  throw error;
}
module.exports = { buildSummary, sendBrevo, escapeHtml, localTime };
