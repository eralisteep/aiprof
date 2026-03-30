# aiprof

## Быстрый запуск локально

1. Установить зависимости:
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Запустить бэкенд:
   - `cd backend && npm run dev`
3. Запустить фронтенд:
   - `cd frontend && npm run dev`
4. Убедиться, что переменная `API_BASE` указывает на бэкенд (в `.env.local` или на сервере).

## Подготовка к хостингу

1. В корне проекта создать `.env` на основе `.env.example`.
2. Указать в `.env`:
   - `PORT=3000` (или порт хостинга)
   - `ALLOWED_ORIGINS=https://your-domain.com`
   - `API_BASE=https://your-domain.com` (или URL API)
3. Запустить бэкенд: `cd backend && npm run start`.
4. Запустить фронтенд: `cd frontend && npm run build && npm run start`.

## Что изменено в коде

- В `backend/src/server.js` CORS теперь через `ALLOWED_ORIGINS`.
- В `frontend/src/context/authContext.js`, `frontend/src/components/Test.js`, `frontend/app/admin/page.js`, `frontend/src/admin/page.js`, `frontend/src/services/api.js` URL API теперь через `process.env.API_BASE`.


