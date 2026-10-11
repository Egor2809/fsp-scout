# Практика через Piston

В Compose добавлены `piston` и одноразовый `piston-init`. Профиль `sandbox` включён в `.env.example` через `COMPOSE_PROFILES`. Образ Piston не публикует порт на хосте; API управления пакетами доступен внутри сети Compose. API приложения и worker не зависят от запуска песочницы или успешного завершения init.

Init ждёт API, устанавливает Python 3.10.0 и пакет `node` 18.15.0 для JavaScript, затем запускает программу с вводом `42` на каждом языке. Установленные версии хранятся в томе `piston_packages`; повторный init пропускает установку, но повторяет проверку выполнения. Другие версии можно задать переменными `PISTON_PYTHON_VERSION` и `PISTON_JAVASCRIPT_VERSION`; версия должна существовать в каталоге Piston.

Настройки `privileged`, том пакетов и исполняемый `/tmp` соответствуют [Compose самого Piston](https://github.com/engineer-man/piston/blob/master/docker-compose.yaml). Нужны Linux-контейнеры и cgroup v2, как указано в [официальной инструкции](https://github.com/engineer-man/piston/blob/master/readme.md#getting-started). Установка использует [API управления пакетами](https://github.com/engineer-man/piston/blob/master/api/src/api/v2.js), имя пакета JavaScript — `node`.

## Запуск из корня репозитория

В PowerShell, после запуска Docker Desktop:

```powershell
if (-not (Test-Path infra/.env)) { Copy-Item infra/.env.example infra/.env }
$env:COMPOSE_PROFILES = 'sandbox'
$env:ASSESSMENT_EXPRESS = 'false'
docker compose --env-file infra/.env -f infra/compose.yaml up --build -d
docker compose --env-file infra/.env -f infra/compose.yaml logs -f piston-init
```

Дождитесь двух строк `Готов:` и завершения `piston-init` с кодом 0. Установка требует доступа контейнера Piston к каталогу пакетов. Для повторной проверки:

```powershell
docker compose --env-file infra/.env -f infra/compose.yaml up --force-recreate piston-init
```

Публичная конфигурация использует те же сервисы при объединении `-f infra/compose.yaml -f infra/compose.public.yaml`; доступ к Piston через Caddy не добавляется. Публикация стенда в рамках этой задачи не выполнялась.

## Недоступность песочницы

Перед началом полной сессии сервер проверяет `/api/v2/runtimes`: нужен точный язык и версия, время ожидания ограничено 1500 мс. Сбой сети, неправильный ответ, отсутствие рантайма или неверные настройки отключают практику и уточняющий вопрос в новой сессии. Экспресс-режим всегда идёт без практики. Уже начатая сессия сохраняет свою политику; сбой проверки кода обрабатывается существующими повторными попытками worker и не превращается в неправильный ответ.

Если недоступен сам образ Piston, основной стек можно запустить без профиля:

```powershell
$env:COMPOSE_PROFILES = ''
docker compose --env-file infra/.env -f infra/compose.yaml up --build -d web worker
```

Явный список `web worker` запускает их зависимости без песочницы. Уже работающий Piston при этом не останавливается; его можно остановить командой `docker compose --env-file infra/.env -f infra/compose.yaml stop piston`.

## Проверка на стенде

После успешного init откройте `http://localhost:8081`, войдите кандидатом, примите согласия и заполните опрос. Начните новый полный тест backend или frontend. Ответьте на адаптивные вопросы, решите практическую задачу, проверьте открытые тесты и отправьте решение. Дождитесь оценки worker, ответьте на уточнение и завершите тест. При достаточном результате и допуске к смене категории профиль должен получить подтверждённую категорию. Затем остановите Piston и начните другую допустимую полную попытку: в ответе создания сессии `progress.practice_total` должен быть 0, практического задания и уточнения быть не должно.

## Выполненные проверки

- `cd backend; npm test` — 105/105. Покрыты установка, повторный init, проверка выполнения, недоступность API, отсутствие версии и ограничение ответа; существующие тесты оценки практики и повторных попыток также проходят.
- `docker compose --env-file infra/.env.example -f infra/compose.yaml config --quiet` — успешно. Объединённая публичная конфигурация проверена с тестовыми `APP_DOMAIN` и `AUTH_DOMAIN`, без запуска.
- На публичном стенде полный тест проходит целиком: код кандидата выполняется в Piston, worker оценивает скрытые тесты, после уточняющего вопроса присваивается категория.
