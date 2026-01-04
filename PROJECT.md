- переписываем проект на nest в строгом SOLID стиле
- обработку сообщений (особенно запросов к OpenAI) выносим в воркеры на pgBoss
- добавляем свой фронтенд для админки
- добавляем новое landing-web приложение

## Кто принимает update при webhook

Telegram → HTTP → Nest

Telegram server
↓ POST
bots-webhook.controller.ts
↓
telegram-update.handler.ts

- bots-webhook.controller.ts принимает update по HTTP;
- фильтрует: bot.telegramMode === 'webhook'
- передаёт update в handler

## Кто принимает update при polling

telegram-polling.worker.ts
↓ getUpdates()
Telegram API
↓ updates
telegram-polling.worker.ts
↓
telegram-update.handler.ts

- telegram-polling.worker.ts сам получает update через getUpdates
- фильтрует: берёт только ботов с telegramMode === 'polling'
- передаёт update в handler

## TODO: Fault-tolerant processing of incoming Telegram messages

Goal:
One job = one incoming Telegram update.
If processing fails, job stops, admin is notified, and can manually retry failed jobs after fix.

Jobs can end in three states: retryable failure, fatal failure, or terminal failure.
Terminal failures are explicitly marked in DB and excluded from automatic and manual retries.
This prevents infinite retries for messages that are logically impossible to process.

### Flow

1. On incoming update

Create job openai:incoming-message

Job payload contains everything needed to finish later:

botId

telegramUpdateId

chatId

messageId

text

Use idempotency key (botId + telegramUpdateId)

2. Job pipeline (end-to-end, idempotent)

ensureIncomingMessageSaved (upsert, unique constraint)

ensureResponseGenerated (call OpenAI only if not already generated)

ensureResponseSaved

ensureResponseSent (send to Telegram only if not already sent)

Mark message as COMPLETED

3. Error handling

Classify errors:

fatal (401/403, invalid token, permanent config error) → fail immediately

retryable (timeouts, 5xx, rate limits) → retry up to retryLimit

Do not retry infinitely

4. On final failure

Job remains in failed

Send single admin notification (deduped, no spam)

Store last error info for visibility

5. Manual recovery

Admin UI button: “Retry failed jobs”

Backend endpoint retries failed openai:incoming-message jobs

Re-run job continues pipeline from last unfinished step

User eventually receives response

### Guarantees

No duplicate OpenAI calls

No duplicate Telegram messages

Safe to retry after code/config fix

No background infinite retries
