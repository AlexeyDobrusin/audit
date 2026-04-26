/* ============================================
   Traffic source — save UTM params & referrer on first load
   ============================================ */
(function() {
    // Save only on first visit (don't overwrite if user navigates within site)
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

/* ============================================
   Hero Card — Tilt effect on mouse move
   ============================================ */
(function() {
    const card = document.querySelector('.hero-card');
    if (!card) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', function() {
        card.style.transform = 'rotate(-2deg)';
    });
})();

/* ============================================
   Counter animation — count up with formatting
   ============================================ */
(function() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.counter').forEach(function(el) {
        var target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;

        if (prefersReduced) {
            el.textContent = target;
            return;
        }

        el.textContent = '0';
        var pause = 2000;
        var stepDelay = 1000;

        function pulse() {
            el.style.transform = 'scale(1.3)';
            el.style.color = '#1a1a2e';
            setTimeout(function() {
                el.style.transform = 'scale(1)';
                el.style.color = '';
            }, 300);
        }

        function runCycle() {
            var current = 0;
            el.textContent = '0';

            function tick() {
                current++;
                el.textContent = current;
                pulse();
                if (current < target) {
                    setTimeout(tick, stepDelay);
                } else {
                    setTimeout(function() {
                        el.textContent = '0';
                        el.style.color = '';
                        runCycle();
                    }, pause);
                }
            }

            setTimeout(tick, stepDelay);
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    runCycle();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(el);
    });
})();

/* ============================================
   Scanner — drag & reveal logic
   ============================================ */
(function() {
    var scanLine = document.querySelector('.scan-line');
    var grid = document.querySelector('.scanner-wrap .grid');
    if (!scanLine || !grid) return;

    var cells = grid.querySelectorAll('.cell');
    var isDragging = false;

    function getVisibleMaxY() {
        var gridRect = grid.getBoundingClientRect();
        var maxBottom = 0;
        cells.forEach(function(cell) {
            if (cell.offsetParent === null) return; // hidden via display:none
            var r = cell.getBoundingClientRect();
            var bottom = r.bottom - gridRect.top;
            if (bottom > maxBottom) maxBottom = bottom;
        });
        return maxBottom || gridRect.height;
    }

    function updateCells() {
        var lineRect = scanLine.getBoundingClientRect();
        var lineY = lineRect.top + lineRect.height / 2;

        cells.forEach(function(cell) {
            if (cell.offsetParent === null) return;
            var cellRect = cell.getBoundingClientRect();
            var whiteLayer = cell.querySelector('.cell-white');
            var cellTop = cellRect.top;
            var cellBottom = cellRect.bottom;
            var cellHeight = cellRect.height;

            if (lineY <= cellTop) {
                whiteLayer.style.clipPath = 'inset(0 0 100% 0)';
            } else if (lineY >= cellBottom) {
                whiteLayer.style.clipPath = 'inset(0 0 0 0)';
            } else {
                var pct = ((lineY - cellTop) / cellHeight) * 100;
                whiteLayer.style.clipPath = 'inset(0 0 ' + (100 - pct) + '% 0)';
            }

            if (cell.hasAttribute('data-sick')) {
                if (lineY >= cellBottom) {
                    cell.classList.add('sick-active');
                } else {
                    cell.classList.remove('sick-active');
                }
            }
        });
    }

    var animObserver = setInterval(function() { updateCells(); }, 30);
    setTimeout(function() { clearInterval(animObserver); }, 7000);

    scanLine.addEventListener('mousedown', function(e) {
        e.preventDefault();
        var currentTop = scanLine.getBoundingClientRect().top - grid.getBoundingClientRect().top;
        scanLine.style.animation = 'none';
        scanLine.style.top = currentTop + 'px';
        isDragging = true;
        scanLine.classList.add('dragging');
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var rect = grid.getBoundingClientRect();
        var y = e.clientY - rect.top;
        var maxY = getVisibleMaxY();
        y = Math.max(0, Math.min(y, maxY));
        scanLine.style.top = y + 'px';
        updateCells();
    });

    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        scanLine.classList.remove('dragging');
    });

    scanLine.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var currentTop = scanLine.getBoundingClientRect().top - grid.getBoundingClientRect().top;
        scanLine.style.animation = 'none';
        scanLine.style.top = currentTop + 'px';
        isDragging = true;
        scanLine.classList.add('dragging');
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        var touch = e.touches[0];
        var rect = grid.getBoundingClientRect();
        var y = touch.clientY - rect.top;
        var maxY = getVisibleMaxY();
        y = Math.max(0, Math.min(y, maxY));
        scanLine.style.top = y + 'px';
        updateCells();
    }, { passive: false });

    document.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        scanLine.classList.remove('dragging');
    });
})();

/* ============================================
   Typography — prevent orphan prepositions
   Заменяет пробел после коротких слов на неразрывный
   ============================================ */
(function() {
    // Союзы, предлоги, частицы (1-3 буквы)
    var shortWords = [
        'и', 'а', 'но', 'да', 'или', 'ли', 'же', 'бы', 'ни', 'не', 'то',
        'в', 'на', 'к', 'с', 'у', 'о', 'по', 'за', 'из', 'от', 'до', 'со', 'об', 'ко', 'во', 'при', 'без', 'над', 'под', 'про', 'для',
        'я', 'мы', 'вы', 'он', 'её', 'его', 'их', 'как', 'что', 'все', 'это', 'при', 'уже', 'ещё', 'чем', 'кто'
    ];

    // Регулярка: слово из списка + пробел (с учётом регистра)
    var pattern = new RegExp('(^|[\\s>«"\\(])(' + shortWords.join('|') + ')(\\s)', 'gi');

    function fixOrphans(text) {
        // Неразрывный пробел после коротких слов
        text = text.replace(pattern, function(match, before, word, space) {
            return before + word + '\u00A0';
        });
        // Неразрывный пробел перед ₽ (валютой)
        text = text.replace(/(\d)\s*(₽)/g, '$1\u00A0$2');
        // Неразрывный пробел в числах с пробелами (1 000, 3 000)
        text = text.replace(/(\d)\s+(\d{3})/g, '$1\u00A0$2');
        // Неразрывный пробел после цифр перед словом (4 вопроса → 4 вопроса)
        text = text.replace(/(\d)\s+([а-яёА-ЯЁ])/g, '$1\u00A0$2');
        return text;
    }

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            var fixed = fixOrphans(node.textContent);
            if (fixed !== node.textContent) {
                node.textContent = fixed;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Пропускаем script, style, textarea, input
            var tag = node.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'input' || tag === 'code' || tag === 'pre') {
                return;
            }
            node.childNodes.forEach(processNode);
        }
    }

    // Применяем к основному контенту
    function applyTypography() {
        var selectors = [
            '.hero-left',
            '.section-header',
            '.card',
            '.quote-text',
            '.quote-text-content',
            '.author-quote-heading',
            '.author-quote-text',
            '.author-bio',
            '.offer-card',
            '.footer'
        ];

        selectors.forEach(function(sel) {
            document.querySelectorAll(sel).forEach(processNode);
        });

        // Также обрабатываем все p, h1-h6, span, li
        document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, a').forEach(processNode);
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTypography);
    } else {
        applyTypography();
    }
})();

/* ============================================
   Video Modal — open/close logic
   ============================================ */
(function() {
    function initVideoModal() {
        var modal = document.getElementById('videoModal');
        var closeBtn = document.getElementById('videoModalClose');
        var overlay = modal ? modal.querySelector('.video-modal-overlay') : null;
        var heroPlayBtn = document.getElementById('heroPlayButton');

        var kinescopeIframe = document.getElementById('kinescope-player');
        var videoPlayBtn = document.getElementById('videoPlayBtn');
        var videoPreview = document.getElementById('videoPreview');
        var videoSpinner = document.getElementById('videoSpinner');
        var videoSrc = 'https://kinescope.io/embed/0CuvqRQWNbK1cZsKZHz8dW';
        var hideTimer = null;

        if (!modal || !heroPlayBtn) return;

        function startVideo() {
            if (videoPlayBtn) videoPlayBtn.style.display = 'none';
            if (videoSpinner) videoSpinner.style.display = 'block';
            if (kinescopeIframe) {
                kinescopeIframe.onload = function() {
                    hideTimer = setTimeout(function() {
                        if (videoPreview) videoPreview.classList.add('hidden');
                        if (videoSpinner) videoSpinner.style.display = 'none';
                    }, 600);
                };
                kinescopeIframe.src = videoSrc + '?autoplay=1';
            }
        }

        function resetVideo() {
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
            if (kinescopeIframe) {
                kinescopeIframe.onload = null;
                kinescopeIframe.src = '';
            }
            if (videoPreview) videoPreview.classList.remove('hidden');
            if (videoPlayBtn) videoPlayBtn.style.display = '';
            if (videoSpinner) videoSpinner.style.display = 'none';
        }

        function openModal(e) {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            resetVideo();
        }

        if (videoPlayBtn) {
            videoPlayBtn.addEventListener('click', startVideo);
            videoPlayBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                startVideo();
            });
        }

        heroPlayBtn.addEventListener('click', openModal);

        // Для мобильных устройств
        heroPlayBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            openModal(e);
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
            closeBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                closeModal();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', closeModal);
            overlay.addEventListener('touchend', function(e) {
                e.preventDefault();
                closeModal();
            });
        }

        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoModal);
    } else {
        initVideoModal();
    }
})();

/* ============================================
   Popup Form — open/close/submit logic
   ============================================ */
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
            // Instant scroll to restore position (bypass CSS smooth-scroll)
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, scrollY);
            // Restore smooth scroll after a tick
            requestAnimationFrame(function() {
                document.documentElement.style.scrollBehavior = '';
            });
        }

        // Label focus states
        var fields = modal.querySelectorAll('.popup-field');
        fields.forEach(function(field) {
            var input = field.querySelector('.popup-input');
            if (!input) return;
            input.addEventListener('focus', function() {
                field.classList.add('focused');
            });
            input.addEventListener('blur', function() {
                field.classList.remove('focused');
            });
        });

        function isAlreadySubmitted() {
            try { return sessionStorage.getItem('auditFormSubmitted') === '1'; } catch(e) { return false; }
        }

        function markSubmitted() {
            try { sessionStorage.setItem('auditFormSubmitted', '1'); } catch(e) {}
        }

        function openModal(e) {
            e.preventDefault();
            if (isAlreadySubmitted()) {
                // Already submitted in this session — show success directly
                formView.style.display = 'none';
                successView.style.display = '';
                modal.classList.add('success-mode');
            } else {
                formView.style.display = '';
                successView.style.display = 'none';
                modal.classList.remove('success-mode');
            }
            modal.classList.add('active');
            lockBody();
            // Auto-focus first field (only if form is visible)
            if (!isAlreadySubmitted()) {
                var firstInput = modal.querySelector('.popup-input');
                if (firstInput) {
                    setTimeout(function() { firstInput.focus(); }, 300);
                }
            }
        }

        function closeModal() {
            modal.classList.remove('active');
            unlockBody();
        }

        function resetForm() {
            if (form) form.reset();
            formView.style.display = '';
            successView.style.display = 'none';
            modal.classList.remove('success-mode');
        }

        // Open button
        if (openBtn) {
            openBtn.addEventListener('click', openModal);
        }

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Click outside popup window
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Form submit — send to Telegram, then show success
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Yandex.Metrika goal: audit form submitted
                if (typeof ym === 'function') {
                    ym(103707469, 'reachGoal', 'ostavili-kontakty');
                }

                var submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Отправка...';
                }

                var promoCode = form.querySelector('#fieldPromo').value;
                var priceEl = document.getElementById('priceMain');
                var currentPrice = priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : '5000';

                // Get traffic source from sessionStorage
                var trafficSource = {};
                try {
                    trafficSource = JSON.parse(sessionStorage.getItem('traffic_source') || '{}');
                } catch(e) {}

                var formData = {
                    name: form.querySelector('#fieldName').value,
                    phone: form.querySelector('#fieldPhone').value,
                    revenue: form.querySelector('#fieldRevenue').value,
                    business: form.querySelector('#fieldBusiness').value,
                    telegram: form.querySelector('#fieldTelegram').value,
                    result: form.querySelector('#fieldResult').value,
                    promo: promoCode,
                    price: currentPrice,
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
                .then(function(response) {
                    if (!response.ok) throw new Error('Send failed');
                    return response.json();
                })
                .then(function() {
                    markSubmitted();
                    formView.style.display = 'none';
                    successView.style.display = '';
                    modal.classList.add('success-mode');
                })
                .catch(function() {
                    // Даже при ошибке показываем успех (заявку не теряем визуально)
                    markSubmitted();
                    formView.style.display = 'none';
                    successView.style.display = '';
                    modal.classList.add('success-mode');
                    console.error('Failed to send form data to Telegram');
                })
                .finally(function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Записаться на аудит';
                    }
                });
            });
        }

        // Success close
        if (successCloseBtn) {
            successCloseBtn.addEventListener('click', function() {
                resetForm();
                closeModal();
            });
        }

        // Focus trap
        modal.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            var focusable = modal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopup);
    } else {
        initPopup();
    }
})();

/* ============================================
   Phone input mask — +7 (___) ___-__-__
   ============================================ */
(function() {
    function initPhoneMask() {
        var input = document.getElementById('fieldPhone');
        if (!input) return;

        function formatPhone(digits) {
            var d = digits.replace(/\D/g, '');
            // Remove leading 7 or 8 (country code)
            if (d.length > 0 && (d[0] === '7' || d[0] === '8')) {
                d = d.substring(1);
            }
            // Limit to 10 digits
            d = d.substring(0, 10);

            var formatted = '+7';
            if (d.length > 0) formatted += ' (' + d.substring(0, 3);
            if (d.length >= 3) formatted += ') ';
            else if (d.length > 0) return formatted;
            if (d.length > 3) formatted += d.substring(3, 6);
            if (d.length >= 6) formatted += '-';
            if (d.length > 6) formatted += d.substring(6, 8);
            if (d.length >= 8) formatted += '-';
            if (d.length > 8) formatted += d.substring(8, 10);

            return formatted;
        }

        input.addEventListener('input', function() {
            var raw = input.value.replace(/\D/g, '');
            if (raw.length === 0) {
                input.value = '';
                return;
            }
            input.value = formatPhone(raw);
        });

        input.addEventListener('focus', function() {
            if (!input.value) {
                input.value = '+7 (';
            }
        });

        input.addEventListener('blur', function() {
            if (input.value === '+7 (' || input.value === '+7') {
                input.value = '';
            }
        });

        // Prevent non-digit input (except backspace, arrows, etc.)
        input.addEventListener('keydown', function(e) {
            // Allow control keys
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' ||
                e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End' ||
                e.ctrlKey || e.metaKey) {
                return;
            }
            // Allow digits only
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhoneMask);
    } else {
        initPhoneMask();
    }
})();

/* ============================================
   Smooth scroll — CTA buttons → final section
   ============================================ */
(function() {
    function initSmoothScroll() {
        document.querySelectorAll('.scroll-to-final').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.getElementById('finalSection');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSmoothScroll);
    } else {
        initSmoothScroll();
    }
})();

/* ============================================
   Promo codes — auto-apply from URL + manual input
   ============================================ */
(function() {
    function initPromo() {
        var PROMOKODES = {
            'DOBRUSIN': { newPrice: 2000 },
            '5132':     { newPrice: 2000 },
            'REKLAMA':  { newPrice: 0 },
            'ZMS':      { newPrice: 499 }
        };

        var BASE_PRICE = 5000;
        var ORIGINAL_PRICE = 15000;

        var priceMain = document.getElementById('priceMain');
        var priceOld = document.getElementById('priceOld');
        var promoBadge = document.getElementById('promoBadge');
        var promoBadgeText = document.getElementById('promoBadgeText');
        var priceDescription = document.getElementById('priceDescription');
        var promoInput = document.getElementById('fieldPromo');
        var promoApplyBtn = document.getElementById('promoApplyBtn');
        var promoStatus = document.getElementById('promoStatus');
        var promoText = document.getElementById('promoText');
        var popupSubtitle = document.getElementById('popupSubtitle');

        if (!priceMain || !promoInput) return;

        function formatPrice(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') + '\u00A0\u20BD';
        }

        function applyPromo(code) {
            var normalized = code.trim().toUpperCase();
            var promoData = PROMOKODES[normalized];

            if (!promoData) {
                if (promoStatus) {
                    promoStatus.textContent = '\u041F\u0440\u043E\u043C\u043E\u043A\u043E\u0434 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D';
                    promoStatus.className = 'promo-status error';
                }
                return false;
            }

            var newPrice = promoData.newPrice;

            // Update pricing card
            priceMain.innerHTML = formatPrice(newPrice);

            // Show badge
            if (promoBadge && promoBadgeText) {
                promoBadgeText.textContent = '\u041F\u0440\u043E\u043C\u043E\u043A\u043E\u0434 ' + normalized + ' \u043F\u0440\u0438\u043C\u0435\u043D\u0451\u043D';
                promoBadge.classList.add('visible');
            }

            // Update description
            if (priceDescription) {
                priceDescription.innerHTML = '\u0411\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u0438\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u043E\u043C\u0443 \u043F\u043E\u0434\u0445\u043E\u0434\u0443 \u043C\u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0430\u0443\u0434\u0438\u0442 \u0442\u0430\u043A, \u0447\u0442\u043E \u0437\u0430\u00A01\u00A0\u0447\u0430\u0441 \u0432\u044B\u00A0\u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B, \u0441\u0440\u0430\u0432\u043D\u0438\u043C\u044B\u0435 \u043F\u043E\u00A0\u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u0441\u00A03-\u0447\u0430\u0441\u043E\u0432\u043E\u0439 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0435\u0439. \u0422\u0430\u043A\u0430\u044F \u0441\u0435\u0441\u0441\u0438\u044F \u0443\u00A0\u043C\u0435\u043D\u044F \u0441\u0442\u043E\u0438\u0442 15\u00A0000\u00A0\u20BD. \u041D\u043E\u00A0\u044F\u00A0\u043D\u0430\u043C\u0435\u0440\u0435\u043D\u043D\u043E \u0441\u0442\u0430\u0432\u043B\u044E \u0446\u0435\u043D\u0443 \u043D\u0438\u0436\u0435 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0441\u0432\u043E\u0435\u0433\u043E \u0447\u0430\u0441\u0430. \u0425\u043E\u0447\u0443, \u0447\u0442\u043E\u0431\u044B \u0446\u0435\u043D\u0430 \u043D\u0435\u00A0\u0441\u0442\u0430\u043B\u0430 \u0431\u0430\u0440\u044C\u0435\u0440\u043E\u043C. \u0427\u0442\u043E\u0431\u044B \u0432\u044B\u00A0\u043B\u0435\u0433\u043A\u043E \u0441\u043A\u0430\u0437\u0430\u043B\u0438 \u00AB\u0434\u0430\u00BB \u0438\u00A0\u043F\u043E\u0437\u043D\u0430\u043A\u043E\u043C\u0438\u043B\u0438\u0441\u044C \u0441\u00A0\u043F\u043E\u0434\u0445\u043E\u0434\u043E\u043C. <span style="font-weight: 600; color: #1a1a2e;">\u041F\u043E\u00A0\u0432\u0430\u0448\u0435\u043C\u0443 \u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434\u0443 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0430\u0443\u0434\u0438\u0442\u0430\u00A0\u2014 ' + formatPrice(newPrice) + ' \u0432\u043C\u0435\u0441\u0442\u043E\u00A015\u00A0000\u00A0\u20BD.</span>';
            }

            // Update promo block text in form
            if (promoText) {
                promoText.innerHTML = '<span style="color: #1a8917; font-weight: 600;">\u041F\u0440\u043E\u043C\u043E\u043A\u043E\u0434 ' + normalized + ' \u043F\u0440\u0438\u043C\u0435\u043D\u0451\u043D!</span> \u0426\u0435\u043D\u0430 \u0430\u0443\u0434\u0438\u0442\u0430\u00A0\u2014 <span class="popup-promo-new-price">' + formatPrice(newPrice) + '</span> \u0432\u043C\u0435\u0441\u0442\u043E\u00A0<span class="popup-promo-old-price">15\u00A0000\u00A0\u20BD</span>';
            }

            // Update form subtitle
            if (popupSubtitle) {
                popupSubtitle.innerHTML = '\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0444\u043E\u0440\u043C\u0443\u00A0\u2014 \u0438\u00A0\u043C\u043E\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u0430 \u0441\u0432\u044F\u0436\u0435\u0442\u0441\u044F \u0441\u00A0\u0432\u0430\u043C\u0438 \u0432\u00A0\u0422\u0435\u043B\u0435\u0433\u0440\u0430\u043C\u0435 \u0432\u00A0\u0442\u0435\u0447\u0435\u043D\u0438\u0435 24\u00A0\u0447\u0430\u0441\u043E\u0432, \u0447\u0442\u043E\u0431\u044B \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u0442\u0443 \u0438\u00A0\u0432\u0440\u0435\u043C\u044F \u0430\u0443\u0434\u0438\u0442\u0430.';
            }

            // Status in form
            if (promoStatus) {
                promoStatus.textContent = '\u041F\u0440\u043E\u043C\u043E\u043A\u043E\u0434 ' + normalized + ' \u043F\u0440\u0438\u043C\u0435\u043D\u0451\u043D \u2014 \u0441\u043A\u0438\u0434\u043A\u0430 ' + formatPrice(ORIGINAL_PRICE - newPrice);
                promoStatus.className = 'promo-status success';
            }

            // Lock promo input
            promoInput.value = normalized;
            promoInput.readOnly = true;
            if (promoApplyBtn) {
                promoApplyBtn.textContent = '\u041F\u0440\u0438\u043C\u0435\u043D\u0451\u043D';
                promoApplyBtn.disabled = true;
                promoApplyBtn.style.background = '#1a8917';
            }

            return true;
        }

        // Apply button click
        if (promoApplyBtn) {
            promoApplyBtn.addEventListener('click', function() {
                var code = promoInput.value;
                if (code.trim()) applyPromo(code);
            });
        }

        // Enter key in promo field
        promoInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var code = promoInput.value;
                if (code.trim()) applyPromo(code);
            }
        });

        // Auto-apply from URL
        var urlParams = new URLSearchParams(window.location.search);
        var urlPromo = urlParams.get('promo');
        if (urlPromo) applyPromo(urlPromo);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPromo);
    } else {
        initPromo();
    }
})();
