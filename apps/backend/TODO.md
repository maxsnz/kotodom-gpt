# Backend Refactoring TODO

## Высокий приоритет [P0]

(все P0 задачи выполнены)

## Средний приоритет [P1]

(все P1 задачи выполнены)

## Низкий приоритет [P2]

### 1. Effect для удаления webhook [P2] ✅

- [x] Добавить effect type `telegram.removeWebhook` в `Effect.ts`
- [x] Реализовать обработку в `EffectRunner`
- [x] Обновить `Bot.disable()` для отправки этого effect
- [x] Рефакторинг `ensureWebhook`: добавлен `BASE_URL` в конфиг, исправлен webhook URL

### 2. Обработка callback_query [P2] ✅

- [x] Добавить `callbackQueryId` в `BotHandleUpdatePayload` и парсинг в `telegram-update.handler.ts`
- [x] Добавить обработку callback_query в `incoming-message.worker.ts`
- [x] Отправка ответа через `TelegramClient.answerCallbackQuery()`

### 3. Prompt Builder [P2]

- [ ] Реализовать `promptBuilder.ts` для построения промптов
- [ ] Если нужна кастомизация промптов в зависимости от бота/пользователя

### 4. Дополнительные фичи [P2]

- [ ] Логирование всех операций
- [ ] Метрики и мониторинг
- [ ] Rate limiting для API endpoints
- [x] Валидация входных данных (DTOs) - реализовано через Zod

## Заметки

- Старая реализация в `src/` не трогать, пусть живет параллельно
- Все новые файлы в `apps/backend/src/`
- Следовать SOLID принципам
- Использовать domain-driven design где возможно
- Все обработки через workers на pgBoss
