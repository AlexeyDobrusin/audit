# Референс: Форма заявки на аудит с отправкой в Telegram

> Этот документ содержит полную реализацию popup-формы заявки с отправкой данных в Telegram через serverless-функцию (Vercel). Используй как образец для реализации аналогичной формы в другом проекте.

---

## Архитектура

```
Пользователь нажимает CTA → открывается popup-форма → заполняет поля → нажимает «Отправить»
                                                                           ↓
                                                              fetch('/api/notify', { POST })
                                                                           ↓
                                                              Vercel serverless function (api/notify.js)
                                                                           ↓
                                                              Telegram Bot API → sendMessage → чат
```

**Стек:** HTML + CSS + vanilla JS (без фреймворков), Vercel serverless functions.

---

## 1. HTML — Popup-форма

Вставляется перед `</body>`:

```html
<!-- Modal: Форма записи -->
<div class="popup-overlay" id="formModal" role="dialog" aria-modal="true">
    <div class="popup-window">
        <!-- Форма -->
        <div class="popup-form-view" id="popupFormView">
            <div class="popup-header">
                <button class="popup-close" id="formModalClose" aria-label="Закрыть">&times;</button>
                <div class="popup-badge">Заявка на&nbsp;аудит</div>
                <h2 class="popup-title">Оставьте заявку</h2>
                <p class="popup-subtitle" id="popupSubtitle">Заполните форму&nbsp;— и&nbsp;моя команда свяжется с&nbsp;вами в&nbsp;Телеграме в&nbsp;течение 24&nbsp;часов, чтобы согласовать дату и&nbsp;время аудита.</p>
            </div>
            <form class="popup-fields" id="auditForm">
                <div class="popup-field">
                    <label class="popup-label" for="fieldName">Имя</label>
                    <input class="popup-input" type="text" id="fieldName" name="name" placeholder="Как к вам обращаться" required>
                </div>
                <div class="popup-field">
                    <label class="popup-label" for="fieldPhone">Телефон</label>
                    <input class="popup-input" type="tel" id="fieldPhone" name="phone" placeholder="+7 (___) ___-__-__" required>
                </div>
                <div class="popup-field">
                    <label class="popup-label" for="fieldRevenue">Месячный оборот</label>
                    <input class="popup-input" type="text" id="fieldRevenue" name="revenue" placeholder="Например: 3 млн ₽" required>
                </div>
                <div class="popup-field">
                    <label class="popup-label" for="fieldBusiness">Ниша / тип бизнеса</label>
                    <input class="popup-input" type="text" id="fieldBusiness" name="business" placeholder="Например: стоматология, онлайн-школа" required>
                </div>
                <div class="popup-field">
                    <label class="popup-label" for="fieldTelegram">Телеграм</label>
                    <input class="popup-input" type="text" id="fieldTelegram" name="telegram" placeholder="@username" required>
                </div>
                <div class="popup-field">
                    <label class="popup-label" for="fieldResult">Идеальный результат после аудита</label>
                    <textarea class="popup-input popup-textarea" id="fieldResult" name="result" rows="3" placeholder="Что хотите получить в итоге?" required></textarea>
                </div>

                <!-- Промокод (опционально — можно убрать) -->
                <div class="popup-promo-block" id="promoBlock">
                    <p class="popup-promo-text" id="promoText">Если у&nbsp;вас есть промокод, введите его ниже.</p>
                    <div class="popup-field popup-field-promo">
                        <label class="popup-label" for="fieldPromo">Промокод</label>
                        <div class="promo-apply-row">
                            <input class="popup-input popup-input-promo" type="text" id="fieldPromo" name="promo" placeholder="Введите промокод" autocomplete="off">
                            <button type="button" class="promo-apply-btn" id="promoApplyBtn">Применить</button>
                        </div>
                        <div class="promo-status" id="promoStatus"></div>
                    </div>
                </div>

                <div class="popup-footer">
                    <button type="submit" class="popup-submit">Отправить заявку</button>
                    <p class="popup-disclaimer">Нажимая кнопку, вы&nbsp;соглашаетесь с&nbsp;политикой конфиденциальности</p>
                </div>
            </form>
        </div>

        <!-- Экран успеха -->
        <div class="popup-success-view" id="popupSuccessView" style="display: none;">
            <button class="popup-close popup-success-x" id="popupSuccessClose" aria-label="Закрыть">&times;</button>
            <div class="popup-success-inner">
                <div class="popup-success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 class="popup-success-title">Заявка отправлена</h3>
                <p class="popup-success-text">Мы свяжемся с вами в течение 24 часов.</p>
            </div>
        </div>
    </div>
</div>
```

**Кнопка открытия формы** (размещается в любом месте страницы):
```html
<a href="#" class="btn-primary" id="openFormBtn">Записаться на аудит</a>
```

---

## 2. CSS — Стили popup-формы

```css
/* ============ POPUP FORM ============ */

@keyframes popupFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes popupSlideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.popup-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(26, 26, 46, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease, visibility 0.25s ease;
}

.popup-overlay.active {
    opacity: 1;
    visibility: visible;
    animation: popupFadeIn 250ms ease;
}

.popup-window {
    background: #ffffff;
    border-radius: 16px;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 24px 80px rgba(26, 26, 46, 0.18), 0 0 0 1px rgba(26, 26, 46, 0.04);
    scrollbar-width: none;
}

.popup-window::-webkit-scrollbar { display: none; }

.popup-overlay.active .popup-window {
    animation: popupSlideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Header */
.popup-header { padding: 32px 32px 0; position: relative; }

.popup-close {
    position: absolute; top: 20px; right: 20px;
    width: 36px; height: 36px; border-radius: 50%;
    border: none; background: #f5f5f7;
    color: rgba(26, 26, 46, 0.45);
    font-size: 20px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, color 0.2s;
}

@media (hover: hover) {
    .popup-close:hover { background: #1a1a2e; color: #ffffff; }
}

.popup-badge {
    display: inline-block; padding: 6px 12px; border-radius: 8px;
    background: #1a1a2e; font-size: 11px; font-weight: 600;
    color: #c8f542; letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 16px;
}

.popup-title {
    font-size: 22px; font-weight: 600; color: #1a1a2e;
    margin: 0 0 8px; line-height: 1.3;
}

.popup-subtitle {
    font-size: 14px; color: rgba(26, 26, 46, 0.45);
    margin: 0 0 28px; line-height: 1.5;
}

/* Fields */
.popup-fields {
    padding: 0 32px; display: flex; flex-direction: column; gap: 20px;
}

.popup-field { display: flex; flex-direction: column; gap: 6px; }

.popup-label {
    font-size: 12px; font-weight: 600;
    color: rgba(26, 26, 46, 0.45); letter-spacing: 0.02em;
    transition: color 0.2s;
}

.popup-field.focused .popup-label { color: #1a1a2e; }

.popup-input {
    width: 100%; box-sizing: border-box;
    font-size: 15px; color: #1a1a2e;
    background: #f5f5f7;
    border: 1.5px solid rgba(26, 26, 46, 0.08);
    border-radius: 12px; padding: 14px 16px; height: 48px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}

.popup-textarea { height: auto; min-height: 80px; resize: vertical; }
.popup-input::placeholder { color: rgba(26, 26, 46, 0.25); }
.popup-input:focus {
    border-color: rgba(26, 26, 46, 0.25);
    box-shadow: 0 0 0 3px rgba(200, 245, 66, 0.15);
}

/* Promo code block */
.popup-promo-block {
    background: rgba(200, 245, 66, 0.08);
    border: 1.5px dashed rgba(200, 245, 66, 0.5);
    border-radius: 12px; padding: 16px;
}

.popup-promo-text {
    font-size: 13px; color: rgba(26, 26, 46, 0.55);
    line-height: 1.5; margin: 0 0 12px;
}

.promo-apply-row { display: flex; gap: 8px; align-items: stretch; }
.promo-apply-row .popup-input-promo { flex: 1; }

.promo-apply-btn {
    padding: 12px 20px; border: none; border-radius: 12px;
    background: #1a1a2e; color: #ffffff;
    font-size: 14px; font-weight: 600; cursor: pointer;
    white-space: nowrap; transition: background 0.2s;
}

.promo-status {
    font-size: 13px; margin-top: 6px; display: none;
}
.promo-status.success { display: block; color: #1a8917; }
.promo-status.error { display: block; color: #d32f2f; }

/* Footer */
.popup-footer { padding: 28px 32px 32px; }

.popup-submit {
    width: 100%; padding: 16px 24px;
    border: none; border-radius: 12px;
    background: #1a1a2e; color: #ffffff;
    font-size: 15px; font-weight: 600; cursor: pointer;
    transition: background 0.2s;
}

@media (hover: hover) {
    .popup-submit:hover { background: #2a2a4e; }
}

.popup-disclaimer {
    font-size: 11px; color: rgba(26, 26, 46, 0.25);
    text-align: center; margin: 14px 0 0;
}

/* Success view */
.popup-success-inner {
    padding: 48px 32px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
}

.popup-success-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: #c8f542;
    display: flex; align-items: center; justify-content: center;
}

.popup-success-title {
    font-size: 20px; font-weight: 600; color: #1a1a2e; margin: 0;
}

.popup-success-view { position: relative; }
.popup-success-x { position: absolute; top: 20px; right: 20px; }

/* Mobile */
@media (max-width: 768px) {
    .popup-overlay { padding: 0; align-items: flex-end; }
    .popup-window { max-width: 100%; max-height: 95vh; border-radius: 16px 16px 0 0; }
    .popup-header, .popup-footer, .popup-fields { padding-left: 20px; padding-right: 20px; }
    .popup-title { font-size: 19px; }
    .popup-input { font-size: 16px; }
    .popup-success-inner { padding: 36px 20px; }
}
```

---

## 3. JavaScript — Логика формы

### 3a. UTM-трекинг (сохранение источника трафика)

```javascript
/* Сохраняет UTM-метки и реферер при загрузке страницы */
(function() {
    if (!sessionStorage.getItem('traffic_source')) {
        var params = new URLSearchParams(window.location.search);
        var source = {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            referrer: document.referrer || ''
        };
        sessionStorage.setItem('traffic_source', JSON.stringify(source));
    }
})();
```

### 3b. Popup — открытие/закрытие/отправка

```javascript
(function() {
    function initPopup() {
        var modal = document.getElementById('formModal');
        var closeBtn = document.getElementById('formModalClose');
        var openBtn = document.getElementById('openFormBtn');
        var form = document.getElementById('auditForm');
        var formView = document.getElementById('popupFormView');
        var successView = document.getElementById('popupSuccessView');
        var successCloseBtn = document.getElementById('popupSuccessClose');
        if (!modal) return;

        var scrollY = 0;

        function lockBody() {
            scrollY = window.pageYOffset;
            document.body.style.position = 'fixed';
            document.body.style.top = '-' + scrollY + 'px';
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
        }

        function unlockBody() {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, scrollY);
            requestAnimationFrame(function() {
                document.documentElement.style.scrollBehavior = '';
            });
        }

        // Подсветка лейблов при фокусе
        modal.querySelectorAll('.popup-field').forEach(function(field) {
            var input = field.querySelector('.popup-input');
            if (!input) return;
            input.addEventListener('focus', function() { field.classList.add('focused'); });
            input.addEventListener('blur', function() { field.classList.remove('focused'); });
        });

        function openModal(e) {
            e.preventDefault();
            formView.style.display = '';
            successView.style.display = 'none';
            modal.classList.add('active');
            lockBody();
        }

        function closeModal() {
            modal.classList.remove('active');
            unlockBody();
        }

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });

        // Отправка формы
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                var submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Отправка...'; }

                // Собираем UTM из sessionStorage
                var trafficSource = {};
                try { trafficSource = JSON.parse(sessionStorage.getItem('traffic_source') || '{}'); } catch(e) {}

                var formData = {
                    name: form.querySelector('#fieldName').value,
                    phone: form.querySelector('#fieldPhone').value,
                    revenue: form.querySelector('#fieldRevenue').value,
                    business: form.querySelector('#fieldBusiness').value,
                    telegram: form.querySelector('#fieldTelegram').value,
                    result: form.querySelector('#fieldResult').value,
                    promo: form.querySelector('#fieldPromo') ? form.querySelector('#fieldPromo').value : '',
                    utm_source: trafficSource.utm_source || '',
                    utm_medium: trafficSource.utm_medium || '',
                    utm_campaign: trafficSource.utm_campaign || '',
                    referrer: trafficSource.referrer || ''
                };

                fetch('/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                .then(function() {
                    formView.style.display = 'none';
                    successView.style.display = '';
                })
                .catch(function() {
                    // Показываем успех даже при ошибке (чтобы не терять UX)
                    formView.style.display = 'none';
                    successView.style.display = '';
                })
                .finally(function() {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Отправить заявку'; }
                });
            });
        }

        if (successCloseBtn) {
            successCloseBtn.addEventListener('click', function() {
                if (form) form.reset();
                formView.style.display = '';
                successView.style.display = 'none';
                closeModal();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopup);
    } else {
        initPopup();
    }
})();
```

### 3c. Маска телефона +7 (___) ___-__-__

```javascript
(function() {
    function initPhoneMask() {
        var input = document.getElementById('fieldPhone');
        if (!input) return;

        function formatPhone(digits) {
            var d = digits.replace(/\D/g, '');
            if (d.length > 0 && (d[0] === '7' || d[0] === '8')) d = d.substring(1);
            d = d.substring(0, 10);

            var f = '+7';
            if (d.length > 0) f += ' (' + d.substring(0, 3);
            if (d.length >= 3) f += ') ';
            else return f;
            if (d.length > 3) f += d.substring(3, 6);
            if (d.length >= 6) f += '-';
            if (d.length > 6) f += d.substring(6, 8);
            if (d.length >= 8) f += '-';
            if (d.length > 8) f += d.substring(8, 10);
            return f;
        }

        input.addEventListener('input', function() {
            var raw = input.value.replace(/\D/g, '');
            input.value = raw.length === 0 ? '' : formatPhone(raw);
        });

        input.addEventListener('focus', function() {
            if (!input.value) input.value = '+7 (';
        });

        input.addEventListener('blur', function() {
            if (input.value === '+7 (' || input.value === '+7') input.value = '';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhoneMask);
    } else {
        initPhoneMask();
    }
})();
```

---

## 4. API — Vercel serverless function (api/notify.js)

Файл `api/notify.js` в корне проекта (Vercel автоматически подхватывает как endpoint `/api/notify`):

```javascript
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

    // ВАЖНО: экранируем HTML-спецсимволы для Telegram
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
    const date = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    // Источник трафика
    const utmSource = data.utm_source || '';
    const utmMedium = data.utm_medium || '';
    const utmCampaign = data.utm_campaign || '';
    const referrer = data.referrer || '';

    const sourceParts = [];
    if (utmSource) sourceParts.push(utmSource);
    if (utmMedium) sourceParts.push(utmMedium);
    if (utmCampaign) sourceParts.push(utmCampaign);
    const sourceStr = sourceParts.length > 0 ? sourceParts.join(' / ') : 'прямой заход';

    let referrerStr = '—';
    if (referrer) {
      try { referrerStr = new URL(referrer).hostname; }
      catch (e) { referrerStr = referrer; }
    }

    // ВАЖНО: используем parse_mode: 'HTML', НЕ 'Markdown'!
    // Markdown v1 ломается от подчёркиваний в UTM-метках
    const message = [
      '📋 <b>Новая заявка!</b>',
      '',
      `👤 <b>Имя:</b> ${esc(name)}`,
      `📱 <b>Телефон:</b> ${esc(phone)}`,
      `💰 <b>Оборот:</b> ${esc(revenue)}`,
      `🏢 <b>Ниша:</b> ${esc(business)}`,
      `✈️ <b>Телеграм:</b> ${esc(telegram)}`,
      `🎯 <b>Результат:</b> ${esc(result)}`,
      `🏷️ <b>Промокод:</b> ${esc(promo)}`,
      '',
      `📊 <b>Источник:</b> ${esc(sourceStr)}`,
      `🔗 <b>Реферер:</b> ${esc(referrerStr)}`,
      '',
      `⏰ ${date}`
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
```

---

## 5. Настройка окружения

### Vercel env-переменные:
```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=-1001234567890
```

### Как получить:
1. Создать бота через @BotFather в Telegram → получить token
2. Добавить бота в чат/группу
3. Узнать chat_id через `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Добавить переменные в Vercel: Settings → Environment Variables

---

## 6. Критичные уроки

1. **Telegram API — ВСЕГДА `parse_mode: 'HTML'`**, не `'Markdown'`. Markdown v1 ломается от символа `_` (подчёркивание), который часто встречается в UTM-метках.

2. **Экранирование** — функция `esc()` обязательна для ВСЕХ пользовательских данных. Экранируем только `&`, `<`, `>`.

3. **Body lock** — при открытии модалки нужно фиксировать body (`position: fixed`), иначе на мобилках фон будет скроллиться.

4. **Мобилка** — форма выезжает снизу (`align-items: flex-end`), скругление только сверху (`border-radius: 16px 16px 0 0`).

5. **font-size: 16px** на инпутах для мобилки — предотвращает автозум в Safari.
