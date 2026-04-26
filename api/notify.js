export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Telegram credentials not configured' });
  }

  try {
    const data = req.body;

    console.log('Audit form payload:', JSON.stringify(data, null, 2));

    // Escape HTML special chars for Telegram
    function esc(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const name = data.name || 'не указано';
    const phone = data.phone || 'не указан';
    const revenue = data.revenue || 'не указан';
    const business = data.business || 'не указана';
    const telegram = data.telegram || 'не указан';
    const result = data.result || 'не указан';
    const promo = data.promo || '—';
    const rawPrice = data.price || '5000';
    const price = Number(rawPrice).toLocaleString('ru-RU') + ' ₽';
    const date = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    // Traffic source
    const utmSource = data.utm_source || '';
    const utmMedium = data.utm_medium || '';
    const utmCampaign = data.utm_campaign || '';
    const referrer = data.referrer || '';

    // Build source string
    const sourceParts = [];
    if (utmSource) sourceParts.push(utmSource);
    if (utmMedium) sourceParts.push(utmMedium);
    if (utmCampaign) sourceParts.push(utmCampaign);
    const sourceStr = sourceParts.length > 0 ? sourceParts.join(' / ') : 'прямой заход';

    // Build referrer string
    let referrerStr = '—';
    if (referrer) {
      try {
        referrerStr = new URL(referrer).hostname;
      } catch (e) {
        referrerStr = referrer;
      }
    }

    const message = [
      '📋 <b>Новая заявка на аудит!</b>',
      '',
      `👤 <b>Имя:</b> ${esc(name)}`,
      `📱 <b>Телефон:</b> ${esc(phone)}`,
      `💰 <b>Оборот:</b> ${esc(revenue)}`,
      `🏢 <b>Ниша:</b> ${esc(business)}`,
      `✈️ <b>Телеграм:</b> ${esc(telegram)}`,
      `🎯 <b>Ожидаемый результат:</b> ${esc(result)}`,
      `🏷️ <b>Промокод:</b> ${esc(promo)}`,
      `💵 <b>Сумма к оплате:</b> ${esc(price)}`,
      '',
      `📊 <b>Источник:</b> ${esc(sourceStr)}`,
      `🔗 <b>Реферер:</b> ${esc(referrerStr)}`,
      '',
      `⏰ ${date}`,
      '🌐 <i>audit.metodzms.ru</i>'
    ].join('\n');

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API error:', response.status, errorText);
      return res.status(500).json({ error: 'Telegram send failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notify error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
