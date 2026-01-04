import type * as runtime from "@prisma/client/runtime/client";
type Decimal = runtime.Decimal;

export class Message {
  constructor(
    private props: {
      id: number;
      chatId: string | null;
      tgUserId: bigint | null;
      botId: number | null;
      text: string;
      price: Decimal;
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

  get price() {
    return this.props.price;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
