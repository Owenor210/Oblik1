# Облік роботи та оренди (PWA)

Особистий облік робочих днів, заробітку та оплати оренди. Дані зберігаються лише на пристрої (localStorage). Без серверів і трекерів.

## Структура
```
oblik-pwa/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── css/style.css
├── js/app.js
└── icons/ (icon-192.png, icon-512.png, icon-maskable-512.png)
```

## Запуск на ПК
Service worker працює лише через `http://localhost` або HTTPS:
```
cd oblik-pwa
python -m http.server 8080
```
Відкрийте http://localhost:8080

## Публікація (HTTPS)
**GitHub Pages:** створіть репозиторій → завантажте вміст папки `oblik-pwa` у корінь → Settings → Pages → Branch `main`, папка `/ (root)` → Save. Адреса: `https://ВАШ-НІК.github.io/НАЗВА/`.

**Cloudflare Pages:** Workers & Pages → Create → Pages → Upload assets → перетягніть папку `oblik-pwa` → Deploy.

## Встановлення на Android
Відкрийте посилання в Chrome → меню ⋮ → «Установити застосунок» / «Додати на головний екран».

## Оновлення
Після змін у файлах збільште версію `V` у `service-worker.js` (наприклад, `oblik-v2`).

## Резервні копії
Дані прив'язані до браузера й адреси сайту. Регулярно робіть «Експорт JSON» у налаштуваннях (⚙).
