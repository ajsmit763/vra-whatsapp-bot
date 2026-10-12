function sourceTime(seconds) {
  const value = Number(seconds);
  return Number.isFinite(value) && value > 0 && value < 100000000000 ? new Date(value * 1000) : null;
}
function whatsAppEvents(body, phoneNumberId) {
  const events=[];
  for(const entry of body.entry || []) for(const change of entry.changes || []) {
    const value=change.value || {};
    if(value.metadata?.phone_number_id && phoneNumberId && value.metadata.phone_number_id !== phoneNumberId) continue;
    for(const message of value.messages || []) {
      if(!message.id || !message.from) throw new Error('WhatsApp message missing ID or sender');
      const kind=message.type || 'unknown';
      const caption=message[kind]?.caption;
      events.push({ platform:'WhatsApp',eventId:message.id,address:String(message.from).replace(/\D/g,''),
        kind,body:kind==='text'?String(message.text?.body || ''):`[${kind} message]${caption?` ${caption}`:''}`,
        sourceAt:sourceTime(message.timestamp) });
    }
  }
  return events;
}
function telegramEvents(body) {
  const message=body.message;
  if(!message?.chat?.id) return [];
  if(body.update_id === undefined) throw new Error('Telegram update ID missing');
  const kind=typeof message.text==='string'?'text':message.photo?'photo':message.document?'document':message.voice?'voice':'other';
  return [{platform:'Telegram',eventId:String(body.update_id),address:String(message.chat.id),kind,
    body:kind==='text'?message.text:`[${kind} message]${message.caption?` ${message.caption}`:''}`,sourceAt:sourceTime(message.date)}];
}
module.exports={whatsAppEvents,telegramEvents};
