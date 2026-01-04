# Backend Refactoring TODO

## Высокий приоритет [P0]

### 1. Incoming Message Worker (главный worker) [P0]

- [ ] Переименовать `openai.worker.ts` в `incoming-message.worker.ts`
- [ ] Реализовать полный pipeline обработки входящего сообщения:
  1. `ensureIncomingMessageSaved` - сохранение входящего сообщения в БД (idempotent)
     - Проверка, не обработано ли уже сообщение (по botId + telegramUpdateId)
     - Создание/обновление TgUser
     - Создание/обновление Chat
     - Сохранение Message от пользователя
  2. `ensureResponseGenerated` - генерация ответа через OpenAI API (idempotent)
     - Проверка, не сгенерирован ли уже ответ
     - Обработка команд `/start`, `/help`, `/refresh`
     - Вызов OpenAI API через `openaiClient`
     - Сохранение threadId в Chat
  3. `ensureResponseSaved` - сохранение ответа в БД
     - Сохранение Message от бота с pricing
  4. `ensureResponseSent` - отправка ответа в Telegram (idempotent)
     - Проверка, не отправлен ли уже ответ
     - Отправка через TelegramClient
- [ ] Классификация ошибок:
  - Fatal (401/403, invalid token, permanent config error) → fail immediately
  - Retryable (timeouts, 5xx, rate limits) → retry up to retryLimit
  - Terminal → mark in DB, exclude from retries
- [ ] Использовать idempotency key: `${botId}:${telegramUpdateId}` при публикации job

### 2. Регистрация Workers [P0]

- [ ] В `main.ts` или через lifecycle hook зарегистрировать workers
- [ ] Вызвать `registerWorkers()` с `processBotUpdate` функцией из `incoming-message.worker.ts`
- [ ] Настроить логирование для workers

### 3. Дополнение Bot Domain модели [P0]

- [ ] Добавить все поля из Prisma схемы в `Bot.ts`:
  - token, name, startMessage, errorMessage, model, assistantId, error, isActive
- [ ] Обновить методы `enable()` и `disable()` если нужно
- [ ] Завершить `BotRepositoryPrisma.toDomain()` и `toPrisma()` с всеми полями

### 4. Telegram Client Factory [P0]

- [ ] Создать factory/provider для `TelegramClient`
- [ ] Проблема: `TelegramClient` требует `token` в конструкторе, но токен хранится в Bot
- [ ] Решение: создать factory, который принимает `botId` и создает клиент с токеном из Bot
- [ ] Или использовать `@Inject()` с динамическим провайдером

## Средний приоритет [P1]

### 5. Admin Controllers [P1]

- [ ] Реализовать `bots-admin.controller.ts`
  - GET `/bots` - список всех ботов
  - GET `/bots/:id` - получить бота по id
  - POST `/bots` - создать бота
  - PUT `/bots/:id` - обновить бота
  - DELETE `/bots/:id` - удалить бота
  - POST `/bots/:id/enable` - включить бота
  - POST `/bots/:id/disable` - выключить бота
- [ ] Реализовать `chats-admin.controller.ts`
  - GET `/chats` - список чатов (с фильтрами по userId, botId)
  - GET `/chats/:id` - получить чат по id
  - GET `/chats/:id/messages` - получить сообщения чата
  - POST `/chats/:id/messages` - отправить сообщение от админа (аналог `src/controllers/bots.ts::sendMessage`)

### 6. Auth Module [P1]

- [ ] Реализовать `auth.controller.ts`
  - POST `/auth/login` - вход в систему
  - POST `/auth/logout` - выход
  - GET `/auth/me` - текущий пользователь
- [ ] Реализовать `auth.module.ts`
  - Настроить сессии/cookies с использованием `COOKIE_SECRET`
  - Guard для защиты admin endpoints
- [ ] Добавить `@UseGuards(AuthGuard)` к admin controllers

### 7. Chats Module [P1]

- [ ] Реализовать `chats.module.ts`
  - Импортировать `ChatRepository` и `ChatRepositoryPrisma`
  - Настроить DI для репозитория
  - Импортировать `ChatsAdminController`

### 8. Health Module [P1]

- [ ] Реализовать `health.controller.ts`
  - GET `/health` - простой health check
  - GET `/health/db` - проверка подключения к БД
  - GET `/health/pgboss` - проверка состояния PgBoss
- [ ] Реализовать `health.module.ts`

## Низкий приоритет [P2]

### 9. Effect для удаления webhook [P2]

- [ ] Добавить effect type `telegram.removeWebhook` в `Effect.ts`
- [ ] Реализовать обработку в `EffectRunner`
- [ ] Обновить `Bot.disable()` для отправки этого effect

### 10. Обработка callback_query [P2]

- [ ] Добавить обработку callback_query в `incoming-message.worker.ts`
- [ ] Логика обработки callback data
- [ ] Отправка ответа через `TelegramClient.answerCallbackQuery()`

### 11. Обработка команд [P2]

- [ ] `/start` - отправка `bot.startMessage`
- [ ] `/help` - справка с командами
- [ ] `/refresh` - сброс `threadId` в чате (установить в null/empty)

### 12. Prompt Builder [P2]

- [ ] Реализовать `promptBuilder.ts` для построения промптов
- [ ] Если нужна кастомизация промптов в зависимости от бота/пользователя

### 13. Error Handling и Notifications [P2]

- [ ] Классификация ошибок в worker (fatal/retryable/terminal)
- [ ] Уведомления админу при финальных ошибках (deduped, no spam)
- [ ] Хранение последней ошибки для visibility в админке
- [ ] Endpoint для ручного retry failed jobs

### 14. Дополнительные фичи [P2]

- [ ] Логирование всех операций
- [ ] Метрики и мониторинг
- [ ] Rate limiting для API endpoints
- [ ] Валидация входных данных (DTOs)

## Заметки

- Старая реализация в `src/` не трогать, пусть живет параллельно
- Все новые файлы в `apps/backend/src/`
- Следовать SOLID принципам
- Использовать domain-driven design где возможно
- Все обработки через workers на pgBoss
