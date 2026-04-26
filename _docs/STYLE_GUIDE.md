# СТИЛЬ ПРОЕКТА

> Единый источник правды для всех стилевых решений.
> Источник: `_reference/` (TestZMS) → DESIGN_SOURCE.md

---

## СТАТУС

- [x] Стиль зафиксирован
- Дата фиксации: 2026-02-03
- Источник: `_reference/DESIGN_SOURCE.md`

---

## ЦВЕТА

### CSS-переменные

```css
:root {
  /* Фоны */
  --color-bg: #f5f5f7;              /* Фон страницы — светло-серый */
  --color-bg-card: #ffffff;          /* Фон карточек — белый */
  --color-bg-dark: #1a1a2e;          /* Тёмный фон (кнопки, ячейки) */
  --color-bg-neutral: #fafafa;       /* Нейтральный фон */

  /* Текст */
  --color-text: #1a1a2e;             /* Основной текст — тёмный */
  --color-text-secondary: #7a7f8a;   /* Вторичный текст — серый */
  --color-text-white: #ffffff;       /* Белый текст */

  /* Акценты */
  --color-accent: #c8f542;           /* ЛАЙМ — главный акцент */
  --color-accent-hover: #c8f542;     /* Hover акцент */

  /* Системные */
  --color-error: #ec5353;            /* Красная индикация */
  --color-success: #22c55e;          /* Зелёный (успех) */

  /* Границы */
  --color-border: #d1d5db;           /* Граница карточек */
  --color-border-light: #e5e5e5;     /* Светлая граница */

  /* Подложки */
  --color-highlight: rgba(0,0,0,0.07); /* Серый хайлайт */
}
```

### Палитра (визуально)

| Название | HEX | Использование |
|----------|-----|---------------|
| Фон страницы | `#f5f5f7` | Основной фон |
| Белый | `#ffffff` | Карточки |
| Тёмный | `#1a1a2e` | Кнопки, тексты заголовков |
| Серый текст | `#7a7f8a` | Вторичный текст |
| **ЛАЙМ** | `#c8f542` | Акцент, hover кнопок |
| Красный | `#ec5353` | Ошибки, индикация |
| Граница | `#d1d5db` | Границы карточек |

### Правила цветов:
- Текст на лаймовом фоне → `#1a1a2e` (тёмный) ВСЕГДА
- Текст на белом/сером фоне → `#1a1a2e` (заголовки), `#7a7f8a` (body)
- НЕ изобретать новые цвета без согласования

---

## ТИПОГРАФИКА

### Шрифты

```css
:root {
  --font-primary: 'Manrope', sans-serif;      /* Основной текст, кнопки */
  --font-heading: 'Unbounded', sans-serif;    /* Заголовки H1, H2 */
  --font-label: 'Chakra Petch', sans-serif;   /* Лейблы (англ.), навигация */
  --font-logo: 'ClashDisplay', sans-serif;    /* Только логотип (локальный) */
}
```

### Размеры — Десктоп

| Элемент | Шрифт | Размер | Weight | Line-height | Letter-spacing |
|---------|-------|--------|--------|-------------|----------------|
| H1 (Hero) | Unbounded | 55px | 600 | 1.1 | -2px |
| H2 (секции) | Unbounded | 20px | 500 | 1.3 | -1px |
| Надзаголовок | Manrope | 22px | 600 | 1.4 | normal |
| Подзаголовок | Manrope | 20px | 400 | 1.4 | normal |
| Body | Manrope | 16px | 400 | 1.5 | normal |
| Буллиты | Manrope | 15px | 400 | normal | normal |
| CTA-кнопка | Manrope | 17px | 600 | normal | normal |

### Размеры — Мобайл (768px)

| Элемент | Размер | Weight |
|---------|--------|--------|
| H1 | 28px | 600 |
| H2 | 17px | 500 |
| Надзаголовок | 16px | 600 |
| Body | 14px | 400 |
| CTA-кнопка | 16px | 600 |

### ЗАПРЕТЫ:
- ❌ НЕ использовать font-weight 700 на заголовки (только 600)
- ❌ НЕ использовать italic на описательные тексты
- ❌ НЕ использовать шрифты, которых нет в таблице

---

## ГЕОМЕТРИЯ

### Скругления (ЖЕЛЕЗНЫЕ ПРАВИЛА)

```css
:root {
  --radius-button: 16px;         /* Кнопки */
  --radius-card: 16px;           /* Карточки */
  --radius-inner: 12px;          /* Контент внутри карточек */
  --radius-highlight: 4px;       /* Хайлайт-подложки */
}
```

### Тени

```css
:root {
  /* Карточки */
  --shadow-card: 0 25px 60px rgba(0,0,0,0.10), 0 6px 20px rgba(0,0,0,0.05);
  --shadow-card-hover: 0 30px 70px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.08);

  /* Кнопки hover */
  --shadow-button-hover: 0 10px 40px rgba(200,245,66,0.35);
}
```

### Границы

```css
/* Dashed для карточек */
border: 1px dashed #d1d5db;

/* Тонкие */
border: 1px solid #d1d5db;
border: 1px solid #e5e5e5;
```

### Отступы

```css
:root {
  /* Контейнер */
  --container-max: 1320px;
  --container-padding-desktop: 60px;
  --container-padding-mobile: 20px;

  /* Межсекционные */
  --section-gap-desktop: 150px;
  --section-gap-mobile: 80px;

  /* Базовая единица — ВСЕ ОТСТУПЫ КРАТНЫ 8px */
  --spacing-unit: 8px;
}
```

### Правило отступов (КРИТИЧНО)
> Верхняя секция даёт gap через `padding-bottom`.
> Нижняя секция ставит `padding-top: 0`.
> Последний элемент контента НЕ имеет `margin-bottom`.

---

## КОМПОНЕНТЫ

### Кнопки

**Primary (десктоп):**
```css
.btn-primary {
  background: #1a1a2e;
  color: #ffffff;
  font-family: 'Manrope', sans-serif;
  font-size: 17px;
  font-weight: 600;
  padding: 24px 36px;
  border-radius: 16px;
}
```

**Primary Hover:**
```css
.btn-primary:hover {
  background: #c8f542;
  color: #1a1a2e;
  box-shadow: 0 10px 40px rgba(200,245,66,0.35);
  transform: scale(1.04);
  transition: 0.25s ease;
}
```

**Primary (мобайл):**
```css
.btn-primary-mobile {
  background: #c8f542;
  color: #1a1a2e;
  padding: 18px 33px;
  min-height: 65px;
  font-size: 16px;
}
```

### Карточки

```css
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.10), 0 6px 20px rgba(0,0,0,0.05);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 30px 70px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.08);
  transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Контент внутри карточки */
.card-content {
  border-radius: 12px;
}
```

---

## ИКОНКИ

| Параметр | Значение |
|----------|----------|
| Библиотека | **Lucide** (v0.563.0) |
| Стиль | Линейные (outline), rounded stroke |
| Толщина | stroke-width 2 (стандарт), 1.5 (крупные) |
| Подключение | `<img src="...">`, НЕ inline SVG |
| Хранение | `/assets/icons/` или `/public/icons/` |

---

## АНИМАЦИИ

### Transitions

```css
:root {
  --transition-fast: 0.25s ease;
  --transition-base: 0.5s ease;
  --transition-slow: 0.8s ease;
}
```

### Принципы
- **Сдержанные, плавные, живые** — не агрессивные
- Easing: ease, ease-out, ease-in-out
- Без bounce, shake, flash

### Основные
- Hover кнопок: `scale(1.04)` + shadow, 0.25s ease
- Hover карточек: `translateY(-6px)` + усиление тени, 0.5s cubic-bezier
- `will-change: transform` на анимируемых элементах
- `@media (prefers-reduced-motion: reduce)` — обязательно

---

## BREAKPOINTS

```css
/* Основные */
@media (max-width: 1100px) { /* колонки → стэк */ }
@media (max-width: 768px)  { /* мобильные шрифты и layout */ }
@media (max-width: 560px)  { /* мобильная адаптация */ }
```

### Правила адаптивности
- Mobile-first подход
- На мобайле: text-align: center для заголовков
- На мобайле: текст сверху, визуал снизу

---

## ❌ ПАТТЕРНЫ ОШИБОК (НЕ ПОВТОРЯТЬ)

1. ❌ Inline SVG вместо библиотеки → Все иконки из Lucide через `<img>`
2. ❌ font-weight 700 на заголовки → Только 600
3. ❌ italic на описательные тексты → font-style: normal
4. ❌ Двойной отступ между секциями → padding-bottom у верхней, padding-top: 0 у нижней
5. ❌ Разные border-radius для карточек → 16px/12px ВСЕГДА
6. ❌ margin-bottom на последнем элементе → margin-bottom: 0
7. ❌ Мобильный заголовок без text-align: center → Всегда center
8. ❌ min-height: 100vh → Явный padding вместо этого

---

## ПРИМЕЧАНИЯ

- Лендинг (`public/landing/`) = первоисточник дизайна для ВСЕГО проекта
- При любых доработках — сверяться с этим документом
- Дизайн-решения принимает только заказчик

