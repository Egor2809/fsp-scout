# Библиотеки и компоненты

Версии ниже совпадают с `backend/package.json`, `frontend/package-lock.json`, `backend/requirements.txt`,
Dockerfile и `infra/compose.yaml`. Зависимости ставятся через `npm ci` по lock-файлам, поэтому сборка
воспроизводима.

## Инфраструктура

| Компонент | Версия | Роль | Лицензия |
|---|---|---|---|
| Node.js | 24 (`node:24-bookworm-slim`) | среда выполнения API, worker и сборки фронтенда | MIT |
| PostgreSQL | 17.6 | основное хранилище | PostgreSQL License |
| Redis | 7.4.5 | очередь BullMQ для скрытой оценки кода и фоновых задач | RSALv2 / SSPLv1 |
| Keycloak | 26.3.4 | вход OIDC (Authorization Code + PKCE), роли, подтверждение почты; совместим с будущим ФСП ID | Apache-2.0 |
| Piston | `ghcr.io/engineer-man/piston` | изолированный запуск кода кандидата: Python 3.10.0, JavaScript (Node) 18.15.0 | MIT |
| nginx | 1.27.5 | раздача фронтенда и прокси `/api` | BSD-2-Clause |
| Caddy | 2 | HTTPS и сертификаты Let's Encrypt на публичном стенде | Apache-2.0 |
| Mailpit | 1.27.8 | почта подтверждения регистрации на стенде | MIT |
| Docker Compose | v2 | запуск всего стека одной командой | Apache-2.0 |

Redis начиная с 7.4 распространяется под RSALv2/SSPLv1. Протокол и команды совместимы с Valkey 8
(BSD-3-Clause); замена образа не требует изменений кода.

## Бэкенд

| Библиотека | Версия | Назначение | Лицензия |
|---|---|---|---|
| NestJS (`@nestjs/common`, `core`, `platform-express`) | 11.1.6 | HTTP API, модули, guards | MIT |
| Prisma (`prisma`, `@prisma/client`) | 6.16.2 | схема БД, миграции, доступ к PostgreSQL | Apache-2.0 |
| BullMQ | 5.58.5 | очередь оценки кода, повторы, аренды задач | MIT |
| jose | 6.1.0 | проверка JWT Keycloak по JWKS | MIT |
| Zod | 4.1.11 | проверка тел запросов и ответов по контракту OpenAPI | MIT |
| RxJS | 7.8.2 | зависимость NestJS | Apache-2.0 |
| reflect-metadata | 0.2.2 | декораторы NestJS | Apache-2.0 |
| TypeScript | 5.9.2 | язык бэкенда | Apache-2.0 |
| tsx | 4.20.5 | запуск TypeScript-скриптов (сид, утилиты) | MIT |
| ReportLab (Python) | 5.0.1 | PDF-профиль кандидата с QR-ссылкой проверки | BSD |
| pypdf (Python) | 6.19.0 | извлечение текста из PDF-резюме | BSD-3-Clause |

## Фронтенд

| Библиотека | Версия | Назначение | Лицензия |
|---|---|---|---|
| React, React DOM | 19.3.0 | интерфейс обоих кабинетов | MIT |
| React Router | 8.4.0 | маршрутизация | MIT |
| TanStack Query | 5.104.1 | запросы к API и кеш | MIT |
| oidc-client-ts | 3.5.0 | вход через Keycloak (PKCE) | Apache-2.0 |
| Zod | 4.6.5 | проверка форм и ответов | MIT |
| Tailwind CSS | 4.3.3 | стили | MIT |
| Radix UI | 1.6.7 | доступные компоненты (диалоги, меню, списки) | MIT |
| cmdk | 1.1.1 | выбор навыков с поиском по синонимам | MIT |
| CodeMirror (`codemirror`, языки Python, JavaScript, Go) | 6.0.2 / 6.2.1 / 6.2.5 / 6.0.1 | редактор кода в практическом задании | MIT |
| Recharts | 3.10.1 | графики результата теста и механики | MIT |
| Motion | 14.0.0 | анимации | MIT |
| Sonner | 2.0.8 | уведомления | MIT |
| Tabler Icons | 3.48.0 | иконки | MIT |
| Fontsource (Wix Madefor, Source Serif 4, JetBrains Mono и др.) | 5.3.0 | локальные шрифты без внешних CDN | OFL-1.1 |
| Vite | 8.3.2 | сборка | MIT |
| TypeScript | 6.0.3 | язык фронтенда | Apache-2.0 |

## Разработка и проверки

| Инструмент | Версия | Назначение | Лицензия |
|---|---|---|---|
| Orval | 8.40.0 | генерация клиента, типов и моков из OpenAPI | MIT |
| MSW | 3.0.2 | моки API для разработки и e2e | MIT |
| Vitest | 4.1.11 | модульные тесты фронтенда | MIT |
| Playwright | 1.63.0 | сквозные тесты в браузере (десктоп и 375 px) | Apache-2.0 |
| ESLint | 10.12.0 | статический анализ фронтенда | MIT |
| Node test runner | встроен в Node.js 24 | модульные тесты бэкенда, валидация `npm run eval` | MIT |
| GitHub Actions | — | CI: сборка, тесты, снимок контракта, валидация, e2e | — |

## Внешние сервисы

| Сервис | Где используется | Обязателен |
|---|---|---|
| GigaChat-2-Max (Сбер) | только черновики новых заданий (`npm run llm:drafts`); ответы кандидатов модель не видит | нет, платформа работает без ключа |
