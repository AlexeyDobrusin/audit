/* ============================================
   Diagnostic Toggles — interactive section
   ============================================ */
(function () {
    'use strict';

    /* --- Data --- */
    var questions = [
        { id: 0, icon: 'activity.svg', text: 'Нет стабильности в продажах — то густо, то пусто' },
        { id: 1, icon: 'trending-down.svg', text: 'Выручка не растёт, а то и падает' },
        { id: 2, icon: 'banknote.svg', text: 'Реклама сливает деньги, а где брать заявки — непонятно' },
        { id: 3, icon: 'user.svg', text: 'Весь маркетинг тяну на себе' },
        { id: 4, icon: 'tree-pine.svg', text: 'Маркетинг — тёмный лес, не хватает времени разобраться' },
        { id: 5, icon: 'shuffle.svg', text: 'Действия хаотичны, всё делается урывками' },
        { id: 6, icon: 'target.svg', text: 'Много действий, но результата нет' },
        { id: 7, icon: 'user-x.svg', text: 'Подрядчики не дают результат' },
        { id: 8, icon: 'arrow-down-circle.svg', text: 'Работало — а потом раз, и продажи упали' }
    ];

    /* --- Status texts (PLACEHOLDER) --- */
    var statusTexts = [
        'Пока ничего не выбрано',  // 0
        'Есть над чем поработать', // 1-3
        'Серьёзные пробелы',       // 4-6
        'Критическая ситуация'     // 7-9
    ];

    function getStatusText(count) {
        if (count === 0) return statusTexts[0];
        if (count <= 3) return statusTexts[1];
        if (count <= 6) return statusTexts[2];
        return statusTexts[3];
    }

    /* --- State --- */
    var states = new Array(questions.length).fill(false);

    /* --- DOM refs --- */
    var colLeft = document.getElementById('diagColLeft');
    var colRight = document.getElementById('diagColRight');

    if (!colLeft || !colRight) return;

    /* --- Build cards --- */
    function createCard(item) {
        var card = document.createElement('div');
        card.className = 'diag-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');
        card.dataset.id = item.id;

        card.innerHTML =
            '<div class="diag-card-icon"><img src="assets/icons/' + item.icon + '" alt="" width="20" height="20"></div>' +
            '<p class="diag-card-text">' + item.text + '</p>' +
            '<div class="diag-card-bottom">' +
                '<span class="diag-card-label">Не про меня</span>' +
                '<input type="checkbox" class="diag-toggle" role="switch" aria-checked="false" aria-label="' + item.text + '">' +
            '</div>';

        // Click on entire card
        card.addEventListener('click', function (e) {
            // Don't double-fire if clicking the checkbox itself
            if (e.target.classList.contains('diag-toggle')) return;
            toggleCard(item.id);
        });

        // Keyboard: Enter or Space
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard(item.id);
            }
        });

        // Checkbox change
        var checkbox = card.querySelector('.diag-toggle');
        checkbox.addEventListener('change', function () {
            toggleCard(item.id);
        });

        return card;
    }

    // Distribute cards: odd → left, even → right
    questions.forEach(function (item, i) {
        var card = createCard(item);
        if (i % 2 === 0) {
            colLeft.appendChild(card);
        } else {
            colRight.appendChild(card);
        }
    });

    /* --- Build dots for counters --- */
    function buildDots(container) {
        for (var i = 0; i < questions.length; i++) {
            var dot = document.createElement('div');
            dot.className = 'diag-dot';
            container.appendChild(dot);
        }
    }

    var dotsDesktop = document.getElementById('diagDotsDesktop');
    var dotsMobile = document.getElementById('diagDotsMobile');
    if (dotsDesktop) buildDots(dotsDesktop);
    if (dotsMobile) buildDots(dotsMobile);

    /* --- Toggle logic --- */
    function toggleCard(id) {
        states[id] = !states[id];
        updateUI();
    }

    function updateUI() {
        var count = states.filter(Boolean).length;

        // Update cards
        var allCards = document.querySelectorAll('.diag-card');
        allCards.forEach(function (card) {
            var id = parseInt(card.dataset.id, 10);
            var isActive = states[id];
            var checkbox = card.querySelector('.diag-toggle');
            var label = card.querySelector('.diag-card-label');

            if (isActive) {
                card.classList.add('active');
                card.setAttribute('aria-pressed', 'true');
            } else {
                card.classList.remove('active');
                card.setAttribute('aria-pressed', 'false');
            }

            checkbox.checked = isActive;
            checkbox.setAttribute('aria-checked', isActive ? 'true' : 'false');
            label.textContent = isActive ? 'Про меня' : 'Не про меня';
        });

        // Update dots
        updateCounter('diagDotsDesktop', 'diagCountNumDesktop', 'diagStatusDesktop', count);
        updateCounter('diagDotsMobile', 'diagCountNumMobile', 'diagStatusMobile', count);
    }

    function updateCounter(dotsId, numId, statusId, count) {
        var dotsContainer = document.getElementById(dotsId);
        var numEl = document.getElementById(numId);
        var statusEl = document.getElementById(statusId);

        if (!dotsContainer) return;

        // Update dots
        var dots = dotsContainer.querySelectorAll('.diag-dot');
        dots.forEach(function (dot, i) {
            if (states[i]) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update number
        if (numEl) numEl.textContent = count;

        // Update status text
        if (statusEl) statusEl.textContent = getStatusText(count);
    }

    // Initial render
    updateUI();

})();
