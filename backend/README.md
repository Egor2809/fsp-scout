# Скаут backend

NestJS + TypeScript + Prisma/PostgreSQL. Реализация находится в разработке.
Текущий статус: `../docs/implementation-status.md`.
Локальный Compose с API, worker и миграциями: `../docs/local-deployment.md`.
Конфигурация проверена; сборка образов и запуск пока не подтверждены.

После восстановления доступа к npm:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run build
npm test
```

Запуск читает окружение процесса. Для локального `.env`:

```powershell
node --env-file=.env --import tsx src/main.ts
```

Перед запуском примените `npm run migrate`. Начальная SQL-миграция создана,
но её выполнение на PostgreSQL пока не проверено. `prisma db push`
не заменяет воспроизводимые миграции при сдаче.

API использует `/api/v1` и порт 8000. Настройки frontend:
`VITE_API_MOCK=false`, `VITE_AUTH_MODE=oidc`.

Математические тесты запускаются без npm-зависимостей:

```powershell
node --experimental-strip-types --test --test-isolation=none test/irt.test.ts
```
