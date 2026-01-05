import { Effect } from "../effects/Effect";

export class Bot {
  constructor(
    private props: {
      id: string;
      name: string;
      startMessage: string;
      errorMessage: string;
      model: string;
      assistantId: string;
      token: string;
      enabled: boolean;
      isActive: boolean;
      telegramMode: "webhook" | "polling";
      error: string | null;
      ownerUserId: string | null;
    }
  ) {}

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }

  get startMessage() {
    return this.props.startMessage;
  }

  get errorMessage() {
    return this.props.errorMessage;
  }

  get model() {
    return this.props.model;
  }

  get assistantId() {
    return this.props.assistantId;
  }

  get token() {
    return this.props.token;
  }

  get enabled() {
    return this.props.enabled;
  }

  get isActive() {
    return this.props.isActive;
  }

  get telegramMode() {
    return this.props.telegramMode;
  }

  get error() {
    return this.props.error;
  }

  get ownerUserId() {
    return this.props.ownerUserId;
  }

  setError(error: string | null): void {
    this.props.error = error;
  }

  enable(): Effect[] {
    if (this.props.enabled) return [];
    this.props.enabled = true;

    const effects: Effect[] = [];

    if (this.props.telegramMode === "webhook") {
      effects.push({
        type: "telegram.ensureWebhook",
        botId: this.id,
        botToken: this.token,
      });
    }

    return effects;
  }

  disable(): Effect[] {
    if (!this.props.enabled) return [];
    this.props.enabled = false;

    if (this.props.telegramMode === "webhook") {
      return [{ type: "telegram.removeWebhook", botToken: this.token }];
    }

    return [];
  }
}
