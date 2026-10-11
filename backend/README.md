# Скаут backend

NestJS + TypeScript + Prisma/PostgreSQL. Общее описание: `../docs/technical-guide.md`.
Локальный Compose с API, worker и миграциями: `../docs/local-deployment.md`.

Отдельный запуск без Docker:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run prisma:generate
npm run build
npm test
```

Запуск читает окружение процесса. Для локального `.env`:

```powershell
node --env-file=.env --import tsx src/main.ts
```

Перед запуском примените `npm run migrate`: миграции лежат в `prisma/migrations`,
`prisma db push` не используется.

API использует `/api/v1` и порт 8000. Настройки frontend:
`VITE_API_MOCK=false`, `VITE_AUTH_MODE=oidc`.

Математические тесты запускаются без npm-зависимостей:

```powershell
node --experimental-strip-types --test --test-isolation=none test/irt.test.ts
```
