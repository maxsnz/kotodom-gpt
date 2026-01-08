# Shared Contracts

This directory contains shared Zod schemas and TypeScript types used across the application.

## Structure

- `src/shared/` - Common enums and shared schemas
- `src/auth/` - Authentication-related schemas and types
- `src/bots/` - Bot-related schemas and types
- `src/index.ts` - Main entry point that re-exports everything

## Usage

### Backend (NestJS)

Import schemas from relative paths:

```typescript
import { LoginSchema, CreateBotSchema } from "../../../shared/contracts/src";
```

### Frontend (React)

Import using path aliases (after configuration):

```typescript
import { LoginSchema } from "@shared/contracts/auth";
```

## Schemas Available

### Auth

- `LoginSchema` - Login form validation
- `CreateUserSchema` - User creation validation
- `UpdateUserSchema` - User update validation

### Bots

- `CreateBotSchema` - Bot creation validation
- `UpdateBotSchema` - Bot update validation

### Shared

- `UserRoleSchema` - User roles enum
- `UserStatusSchema` - User status enum
- `TelegramModeSchema` - Bot telegram modes enum

## TypeScript Types

All schemas have corresponding inferred types available:

- `LoginDto`, `CreateUserDto`, `UpdateUserDto`
- `CreateBotDto`, `UpdateBotDto`
- `UserRole`, `UserStatus`, `TelegramMode`
