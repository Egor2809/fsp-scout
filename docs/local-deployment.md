# Локальный запуск всего стека

Быстрый путь для проверки: `cd infra && cp .env.example .env && docker compose up --build`,
затем http://localhost:8081. Сервис `seed` наполняет базу демо-данными, сервис `web` собирает
фронтенд в режиме реального API и проксирует /api на api:8000. Демо-учётки (пароль `demo12345`)
импортируются вместе с realm, их список в корневом README.md. Клиент `scout-e2e` с password grant
нужен только для локальных сквозных проверок API.

В infra/compose.yaml добавлены migrate, api и worker. Dockerfile backend содержит
отдельные стадии сборки, миграций и запуска. В runtime входят Python и pypdf
для резюме; приложение работает пользователем node. API/worker имеют read-only
файловую систему, временный /tmp, лимиты памяти/PID и сброшенные capabilities.
Это локальная конфигурация: Keycloak работает в start-dev, TLS пока не настроен.

Из корня проекта:

```powershell
if (-not (Test-Path infra/.env)) { Copy-Item infra/.env.example infra/.env }
# Заполните пароли и случайный FSP_WEBHOOK_SECRET длиной минимум 32 символа.
docker compose --env-file infra/.env -f infra/compose.yaml config --quiet
docker compose --env-file infra/.env -f infra/compose.yaml up --build -d
docker compose --env-file infra/.env -f infra/compose.yaml ps
docker compose --env-file infra/.env -f infra/compose.yaml logs --tail 100 migrate api worker
```

В текущем шаблоне пароль PostgreSQL подставляется в URL подключения. Для этого
локального шаблона используйте длинный случайный буквенно-цифровой пароль;
пароли с URL-разделителями требуют отдельного URL-кодирования конфигурации.
Не публикуйте .env или вывод конфигурации, содержащий секреты.

API: http://localhost:8000/api/v1, Keycloak: http://localhost:8080,
Mailpit: http://localhost:8025. Frontend включён в Compose на http://localhost:8081,
с VITE_API_MOCK=false и VITE_AUTH_MODE=oidc. Issuer токенов остаётся публичным
localhost:8080, а серверный JWKS запрашивается через внутренний хост keycloak.
Запуск контейнера Keycloak ещё не означает готовность его HTTP API: в первые
секунды проверка JWT может не пройти, пока Keycloak не завершит запуск.

Миграции запускаются отдельным одноразовым сервисом; API/worker ждут его
успешного завершения. Prisma db push не используется. /ready проверяет
подключение к PostgreSQL и Redis, но не удостоверяет готовность Keycloak.
Worker выполняет обслуживание, назначение регулярных заданий, скрытую оценку
кода через настроенный Piston и удаление аккаунтов. LLM-проверка ещё не реализована.

Стек собирается и запускается по этой инструкции; та же конфигурация развёрнута
на публичном стенде ([public-deployment.md](public-deployment.md)). Dockerfile и CI
ставят зависимости через npm ci по lock-файлам.

После сборки запустите `powershell -ExecutionPolicy Bypass -File ./scripts/check-runtime.ps1`.
Скрипт проверяет работающие контейнеры, успешное завершение migrate, /ready и discovery realm scout.

## Фронтенд и аккаунты

Для разработки frontend можно запускать отдельно вместо контейнера.
Сначала остановите сервис `frontend`, чтобы освободить порт 5173:

```powershell
docker compose --env-file infra/.env -f infra/compose.yaml stop frontend
cd frontend
npm ci
npm run dev:real
```

Откройте http://localhost:5173. Команда dev:real работает на Windows и включает реальный API и OIDC.
Регистрация создаёт кандидата; письмо подтверждения доступно в Mailpit на http://localhost:8025.
Учётки из моков автоматически в Keycloak не создаются. Администратор Keycloak — admin,
пароль находится в локальном infra/.env (KEYCLOAK_ADMIN_PASSWORD).

Для работодателя создайте пользователя в realm scout, подтвердите его email и назначьте realm role employer
через административную консоль Keycloak. Свяжите его UUID с компанией операторской командой
`backend/scripts/provision-employer.ts` (параметры --subject, --email, --company; DATABASE_URL и OIDC_ISSUER нужны в окружении).
Скрипт запускается через tsx после установки backend-зависимостей и prisma:generate.
Роль employer сама по себе компанию не создаёт; её отсутствие даёт 403 на корпоративных методах.

Запуск интерфейса пока не доказывает прохождение тестирования: требуется расширение банка,
настройка ASSESSMENT_GRADE_POLICY и Piston; первые нормативные профили требуют отдельной проверки.
