# Публичный стенд с HTTPS

Конфигурация подготовлена для Linux VPS с Docker Compose. Нужны два DNS-имени,
которые указывают на VPS: приложение и авторизация, например
`scout.example.org` и `auth.example.org`. Для временного стенда можно использовать
два имени вида `scout.<IP>.sslip.io` и `auth.<IP>.sslip.io`.
Порты 80/TCP, 443/TCP должны быть доступны; сертификаты получает Caddy.

1. Создайте `infra/.env` из примера и замените все три секретных значения.
   Пароль PostgreSQL должен быть длинным случайным буквенно-цифровым значением:
   в этом шаблоне он используется внутри URL без дополнительного кодирования.
2. Добавьте в `infra/.env`:

   ```dotenv
   APP_DOMAIN=scout.example.org
   AUTH_DOMAIN=auth.example.org
   ```

3. Подготовьте импорт realm для публичного адреса:

   ```sh
   node scripts/prepare-public.mjs https://scout.example.org
   ```

4. Проверьте конфигурацию и запустите:

   ```sh
   docker compose --env-file infra/.env -f infra/compose.yaml -f infra/compose.public.yaml config --quiet
   docker compose --env-file infra/.env -f infra/compose.yaml -f infra/compose.public.yaml up --build -d
   docker compose --env-file infra/.env -f infra/compose.yaml -f infra/compose.public.yaml ps
   ```

Миграции выполняются перед API. Frontend собирается с реальным API и публичным
OIDC issuer. Keycloak работает в `start` с TLS на reverse proxy; административный
путь закрыт на публичном Caddy. Для административного доступа используйте SSH
туннель к loopback-порту 8080 на VPS. PostgreSQL, Redis, Mailpit и API также
слушают только loopback; наружу открыт Caddy.

Realm импортируется при первом создании. Импорт не обновляет существующий realm:
для прежней установки вручную измените redirect URI, web origins и logout URI
клиента `scout-frontend`, прежде чем переходить на публичный адрес.
Не удаляйте рабочие тома ради повторного импорта.

## Приёмка

- Откройте `https://APP_DOMAIN/api/v1/ready`: ожидается успешный ответ.
- Откройте `https://AUTH_DOMAIN/realms/scout/.well-known/openid-configuration`:
  issuer должен точно совпадать с публичным URL realm.
- Пройдите вход кандидата и работодателя, проверьте callback и выход.
- Создайте работодателя и свяжите его с компанией по инструкции локального запуска.
- Настройте SMTP для реальной регистрации. Mailpit оставлен для демонстрационных
  учётных записей и не доставляет письма реальным адресатам.
- Настройте и проверьте банк, политику подтверждения и Piston перед демонстрацией
  полноценного теста; HTTPS сам по себе не устраняет ограничения банка.

## Проверено на VPS 11.10.2026

Стенд `https://scout.141.133.201.48.sslip.io`: Ubuntu 24.04, 2 vCPU, 4 ГБ RAM, своп 4 ГБ.
Для такой машины добавьте третий файл с ограничениями памяти Keycloak и PostgreSQL:

```sh
docker compose --env-file infra/.env -f infra/compose.yaml -f infra/compose.public.yaml -f infra/compose.vps.yaml up --build -d
```

Проверено: сертификат Let's Encrypt для обоих имён, `/api/v1/ready`, issuer Keycloak,
закрытая снаружи административная консоль, вход кандидата и работодателя через ФСП ID
(Keycloak, PKCE), согласия, опрос, экспресс-тест до результата, разбор потребности,
подборка с объяснением, отправка инвайта, выполнение кода в Piston (Python, JavaScript).
Память под нагрузкой одного проверяющего: около 1,5 ГБ из 3,8 ГБ, своп не используется.

Учётки жюри `jury1…5` создаются импортом realm. Чтобы вернуть им чистое состояние,
остановите стек и удалите тома `scout_postgres` и `scout_redis`: при старте миграции,
сид и импорт realm выполнятся заново, сертификаты Caddy сохранятся.
