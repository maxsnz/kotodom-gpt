export class Chat {
  constructor(
    private props: {
      id: string;
      telegramChatId: bigint;
      botId: number | null;
      tgUserId: bigint;
      name: string | null;
      createdAt: Date;
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

  updateName(name: string | null): void {
    this.props.name = name;
  }
}
