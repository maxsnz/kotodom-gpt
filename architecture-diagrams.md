# Схемы потоков данных приложения Kotodom GPT

## 1. Общая архитектура приложения

```mermaid
graph TB
    subgraph "Frontend"
        AW[Admin Web<br/>React + Vite]
        LW[Landing Web<br/>React + Vite]
    end

    subgraph "Backend (NestJS)"
        WC[Webhook Controller<br/>/webhook/:botId]
        BC[Bots Controller<br/>CRUD ботов]
        CC[Chats Controller<br/>Управление чатами]
        AC[Auth Controller<br/>Аутентификация]
        MC[Message Processing Controller<br/>Обработка сообщений]
    end

    subgraph "Infrastructure"
        DB[(PostgreSQL<br/>Prisma ORM)]
        Redis[(Redis<br/>Сессии, кэш)]
        PGBOSS[PG-Boss<br/>Очереди задач]
        TG[Telegram API]
        OpenAI[OpenAI API]
    end

    subgraph "Workers"
        IMW[Incoming Message Worker<br/>Обработка сообщений]
        TPW[Telegram Polling Worker<br/>Поллинг обновлений]
    end

    subgraph "Domain Services"
        BR[Bot Repository]
        CR[Chat Repository]
        MR[Message Repository]
        MPR[MessageProcessing Repository]
        UR[User Repository]
        OAI[OpenAI Client]
        TGC[Telegram Client]
    end

    AW --> AC
    AW --> BC
    AW --> CC
    AW --> MC

    WC --> PGBOSS
    PGBOSS --> IMW

    IMW --> BR
    IMW --> CR
    IMW --> MR
    IMW --> MPR
    IMW --> OAI
    IMW --> TGC

    IMW --> DB
    IMW --> Redis
    IMW --> OpenAI
    IMW --> TG

    BC --> BR
    CC --> CR
    MC --> MPR

    BR --> DB
    CR --> DB
    MR --> DB
    MPR --> DB
    UR --> DB

    style AW fill:#e1f5fe
    style LW fill:#f3e5f5
    style DB fill:#e8f5e8
    style Redis fill:#fff3e0
    style PGBOSS fill:#ffebee
    style OpenAI fill:#f3e5f5
    style TG fill:#e0f2f1
```

## 2. Поток обработки входящих сообщений

```mermaid
sequenceDiagram
    participant U as Пользователь
    participant TG as Telegram
    participant WC as Webhook Controller
    participant TH as TelegramUpdate Handler
    participant QB as Queue (PG-Boss)
    participant IMW as Incoming Message Worker
    participant DB as Database

    U->>TG: Отправляет сообщение
    TG->>WC: Webhook update
    WC->>TH: handle(botId, update)
    TH->>TH: Парсит update
    TH->>QB: publish(BOT_HANDLE_UPDATE)
    QB->>IMW: Выполняет задачу

    IMW->>DB: Загружает Bot, Chat, User
    IMW->>DB: Сохраняет UserMessage
    IMW->>DB: Создает MessageProcessing

    IMW->>IMW: Генерирует ответ через OpenAI
    IMW->>DB: Сохраняет BotMessage
    IMW->>TG: Отправляет ответ
    IMW->>DB: Обновляет MessageProcessing

    Note over IMW: Обработка ошибок,<br/>повторы через queue
```

## 3. Детальный поток генерации ответов

```mermaid
flowchart TD
    A[Получено сообщение от пользователя] --> B{Это команда?}

    B -->|Да| C[Обработать команду]
    C --> D[/start] --> E[Отправить startMessage]
    C --> F[/help] --> G[Отправить HELP_TEXT]
    C --> H[/refresh] --> I[Сбросить threadId]

    B -->|Нет| J[Отправить в OpenAI]

    J --> K[Создать/получить thread]
    K --> L[Добавить сообщение в thread]
    L --> M[Запустить assistant run]
    M --> N[Ожидать завершения]

    N --> O{Status = completed?}
    O -->|Да| P[Получить ответ]
    O -->|Нет| Q{Status = failed?}
    Q -->|Да| R[Ошибка генерации]
    Q -->|Нет| N

    P --> S[Сохранить ответ в БД]
    S --> T[Отправить в Telegram]

    R --> U[Отметить как TERMINAL в MessageProcessing]

    style A fill:#e8f5e8
    style T fill:#e8f5e8
    style U fill:#ffebee
```

## 4. Система очередей и обработки ошибок

```mermaid
stateDiagram-v2
    [*] --> RECEIVED: Новое сообщение

    RECEIVED --> PROCESSING: Начинаем обработку
    PROCESSING --> COMPLETED: Успешно обработано

    PROCESSING --> FAILED: Ошибка (retryable)
    FAILED --> PROCESSING: Повторная попытка

    FAILED --> TERMINAL: Превышено кол-во попыток<br/>или terminal ошибка

    COMPLETED --> [*]
    TERMINAL --> [*]

    note right of FAILED
        Классификация ошибок:
        - RETRYABLE: 429, 5xx, timeout
        - FATAL: 401, 403, invalid token
        - TERMINAL: остальные ошибки
    end note

    note right of TERMINAL
        Админ получает уведомление
        через Telegram бот
    end note
```

## 5. Схема базы данных

```mermaid
erDiagram
    User ||--o{ Bot : owns
    User {
        string id PK
        string email UK
        string passwordHash
        UserRole role
        UserStatus status
        datetime createdAt
        datetime updatedAt
    }

    Bot ||--o{ Chat : has
    Bot ||--o{ Message : sends
    Bot {
        int id PK
        string startMessage
        string errorMessage
        string name
        string token
        string model
        datetime createdAt
        boolean isActive
        boolean enabled
        string assistantId
        string error
        TelegramModeEnum telegramMode
        string ownerUserId FK
    }

    TgUser ||--o{ Chat : participates
    TgUser ||--o{ Message : sends
    TgUser {
        bigint id PK
        string username
        string name
        string fullName
        datetime createdAt
    }

    Chat ||--o{ Message : contains
    Chat {
        string id PK
        bigint telegramChatId
        int botId FK
        string threadId
        datetime createdAt
        bigint tgUserId FK
        string name
    }

    Message ||--o{ MessageProcessing : has
    Message ||--o{ Message : "user-bot responses"
    Message {
        int id PK
        int chatId FK
        bigint tgUserId FK
        int botId FK
        string text
        bigint telegramUpdateId
        int userMessageId FK
        datetime createdAt
    }

    MessageProcessing {
        int id PK
        int userMessageId FK,UK
        MessageProcessingStatus status
        int attempts
        string lastError
        datetime lastErrorAt
        string terminalReason
        int responseMessageId FK
        bigint telegramIncomingMessageId
        bigint telegramOutgoingMessageId
        bigint telegramUpdateId
        datetime responseGeneratedAt
        datetime responseSentAt
        decimal price
        datetime createdAt
        datetime updatedAt
    }

    Setting {
        string id PK
        string value
    }
```

## 6. Поток администрирования

```mermaid
flowchart TD
    A[Администратор] --> B[Admin Web Interface]

    B --> C[Bots Management]
    B --> D[Chats Monitoring]
    B --> E[Messages Review]
    B --> F[Jobs Monitoring]
    B --> G[Settings]

    C --> H[Create/Edit Bots]
    C --> I[Configure Webhooks]
    C --> J[Enable/Disable Bots]

    D --> K[View Active Chats]
    D --> L[Chat History]

    E --> M[View Message Processing]
    E --> N[Retry Failed Messages]

    F --> O[View Failed Jobs]
    F --> P[Job Statistics]

    H --> Q[Bot Service]
    I --> R[Effect Runner]
    J --> S[Bot Repository]

    Q --> T[(Database)]
    R --> U[Telegram API]
    S --> T

    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style T fill:#e8f5e8
    style U fill:#e0f2f1
```

## 7. Система эффектов и асинхронных операций

```mermaid
flowchart TD
    A[Бизнес-логика] --> B[Создает Effect]

    B --> C{Тип эффекта}

    C -->|telegram.ensureWebhook| D[Telegram Client]
    C -->|telegram.removeWebhook| D
    C -->|jobs.publish| E[PG-Boss Queue]
    C -->|notification.adminAlert| F[Admin Notification]

    D --> G[Установка webhook]
    D --> H[Удаление webhook]

    E --> I[Публикация задачи в очередь]

    F --> J[Отправка уведомления<br/>администратору]

    J --> K[Получение настроек<br/>из базы данных]
    K --> L[Отправка через<br/>Telegram Bot API]

    style A fill:#fff3e0
    style B fill:#fff3e0
    style D fill:#e0f2f1
    style E fill:#ffebee
    style F fill:#ffebee
```

## 8. Мониторинг и логирование

```mermaid
flowchart TD
    A[Приложение] --> B[Pino Logger]

    B --> C[Console Output]
    B --> D[Logtail Service]

    A --> E[Health Checks]
    E --> F[/health endpoint]

    A --> G[Метрики]
    G --> H[PG-Boss Job Stats]
    G --> I[Database Connection]
    G --> J[External API Status]

    H --> K[Failed Jobs Count]
    I --> L[Connection Pool Status]
    J --> M[OpenAI Rate Limits]
    J --> N[Telegram API Status]

    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style B fill:#fff3e0
    style D fill:#fff3e0
```

