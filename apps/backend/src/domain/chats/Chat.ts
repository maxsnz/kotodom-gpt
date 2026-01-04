export class Chat {
  constructor(
    private props: {
      id: string;
      botId: number | null;
      tgUserId: bigint;
      threadId: string | null;
      name: string | null;
      createdAt: Date;
    }
  ) {}

  get id() {
    return this.props.id;
  }

  get botId() {
    return this.props.botId;
  }

  get tgUserId() {
    return this.props.tgUserId;
  }

  get threadId() {
    return this.props.threadId;
  }

  get name() {
    return this.props.name;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  setThreadId(threadId: string | null): void {
    this.props.threadId = threadId;
  }

  updateName(name: string | null): void {
    this.props.name = name;
  }
}
