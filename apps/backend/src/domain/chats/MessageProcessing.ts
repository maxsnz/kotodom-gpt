export enum MessageProcessingStatus {
  RECEIVED = "RECEIVED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  TERMINAL = "TERMINAL",
}

type Decimal = import("@prisma/client/runtime/client").Decimal;

export class MessageProcessing {
  constructor(
    private props: {
      id: number;
      userMessageId: number;
      status: MessageProcessingStatus;
      attempts: number;
      lastError: string | null;
      lastErrorAt: Date | null;
      terminalReason: string | null;
      responseMessageId: number | null;
      telegramIncomingMessageId: number | null;
      telegramOutgoingMessageId: number | null;
      telegramUpdateId: bigint | null;
      responseGeneratedAt: Date | null;
      responseSentAt: Date | null;
      price: Decimal;
      createdAt: Date;
      updatedAt: Date;
    }
  ) {}

  get id() {
    return this.props.id;
  }

  get userMessageId() {
    return this.props.userMessageId;
  }

  get status() {
    return this.props.status;
  }

  get attempts() {
    return this.props.attempts;
  }

  get lastError() {
    return this.props.lastError;
  }

  get lastErrorAt() {
    return this.props.lastErrorAt;
  }

  get terminalReason() {
    return this.props.terminalReason;
  }

  get responseMessageId() {
    return this.props.responseMessageId;
  }

  get telegramIncomingMessageId() {
    return this.props.telegramIncomingMessageId;
  }

  get telegramOutgoingMessageId() {
    return this.props.telegramOutgoingMessageId;
  }

  get telegramUpdateId() {
    return this.props.telegramUpdateId;
  }

  get responseGeneratedAt() {
    return this.props.responseGeneratedAt;
  }

  get responseSentAt() {
    return this.props.responseSentAt;
  }

  get price() {
    return this.props.price;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  markProcessing(): void {
    this.props.status = MessageProcessingStatus.PROCESSING;
    this.props.attempts += 1;
  }

  markFailed(error: string): void {
    this.props.status = MessageProcessingStatus.FAILED;
    this.props.lastError = error;
    this.props.lastErrorAt = new Date();
    this.props.attempts += 1;
  }

  markTerminal(reason: string): void {
    this.props.status = MessageProcessingStatus.TERMINAL;
    this.props.terminalReason = reason;
  }

  markResponseGenerated(responseMessageId: number): void {
    this.props.responseMessageId = responseMessageId;
    this.props.responseGeneratedAt = new Date();
  }

  markResponseSent(telegramOutgoingMessageId: number): void {
    this.props.telegramOutgoingMessageId = telegramOutgoingMessageId;
    this.props.responseSentAt = new Date();
  }

  markCompleted(): void {
    this.props.status = MessageProcessingStatus.COMPLETED;
  }

  setPrice(price: Decimal): void {
    this.props.price = price;
  }

  setTelegramIncomingMessageId(messageId: number): void {
    this.props.telegramIncomingMessageId = messageId;
  }

  setTelegramUpdateId(updateId: bigint): void {
    this.props.telegramUpdateId = updateId;
  }
}

