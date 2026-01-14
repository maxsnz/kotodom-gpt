export class Message {
  constructor(
    private props: {
      id: number;
      chatId: string | null;
      tgUserId: bigint | null;
      botId: number | null;
      text: string;
      telegramUpdateId: bigint | null;
      userMessageId: number | null;
      createdAt: Date;
    }
  ) {}

  get id() {
    return this.props.id;
  }

  get chatId() {
    return this.props.chatId;
  }

  get tgUserId() {
    return this.props.tgUserId;
  }

  get botId() {
    return this.props.botId;
  }

  get text() {
    return this.props.text;
  }

  get telegramUpdateId() {
    return this.props.telegramUpdateId;
  }

  get userMessageId() {
    return this.props.userMessageId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  setUserMessageId(userMessageId: number | null): void {
    this.props.userMessageId = userMessageId;
  }

  updateText(text: string): void {
    this.props.text = text;
  }
}
