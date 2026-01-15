export class Chat {
  constructor(
    private props: {
      id: string;
      telegramChatId: bigint;
      botId: number | null;
      tgUserId: bigint;
      name: string | null;
      createdAt: Date;
      lastResponseId: string | null;
    }
  ) {}

  get id() {
    return this.props.id;
  }

  get telegramChatId() {
    return this.props.telegramChatId;
  }

  get botId() {
    return this.props.botId;
  }

  get tgUserId() {
    return this.props.tgUserId;
  }

  get name() {
    return this.props.name;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get lastResponseId() {
    return this.props.lastResponseId;
  }

  updateName(name: string | null): void {
    this.props.name = name;
  }

  updateLastResponseId(lastResponseId: string | null): void {
    this.props.lastResponseId = lastResponseId;
  }
}
