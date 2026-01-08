export interface TgUserProps {
  id: bigint;
  username: string | null;
  name: string | null;
  fullName: string | null;
  createdAt: Date;
}

/**
 * TgUser domain entity representing a Telegram user
 */
export class TgUser {
  constructor(private readonly props: TgUserProps) {}

  get id(): bigint {
    return this.props.id;
  }

  get username(): string | null {
    return this.props.username;
  }

  get name(): string | null {
    return this.props.name;
  }

  get fullName(): string | null {
    return this.props.fullName;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}