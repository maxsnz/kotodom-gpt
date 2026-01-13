import { Effect } from "../effects/Effect";

export class Bot {
  constructor(
    private props: {
      createdAt: Date;
      id: string;
      name: string;
      startMessage: string;
      errorMessage: string;
      model: string;
      token: string;
      enabled: boolean;
      telegramMode: "webhook" | "polling";
      error: string | null;
      ownerUserId: string | null;
      prompt: string;
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

  get token() {
    return this.props.token;
  }

  get enabled() {
    return this.props.enabled;
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

  get prompt() {
    return this.props.prompt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  setError(error: string | null): void {
    this.props.error = error;
  }

  enable(): Effect[] {
    this.props.enabled = true;

    const effects: Effect[] = [];

    if (this.props.telegramMode === "webhook") {
      effects.push({
        type: "telegram.ensureWebhook",
        botId: this.id,
        botToken: this.token,
      });
    } else if (this.props.telegramMode === "polling") {
      effects.push({
        type: "telegram.startPolling",
        botId: this.id,
        botToken: this.token,
      });
    }

    return effects;
  }

  disable(): Effect[] {
    if (!this.props.enabled) return [];
    this.props.enabled = false;

    const effects: Effect[] = [];

    if (this.props.telegramMode === "webhook") {
      effects.push({ type: "telegram.removeWebhook", botToken: this.token });
    } else if (this.props.telegramMode === "polling") {
      effects.push({
        type: "telegram.stopPolling",
        botId: this.id,
      });
    }

    return effects;
  }

  /**
   * Stop bot based on current telegramMode.
   * Only stops what's actually being used (webhook or polling).
   */
  stop(): Effect[] {
    const effects: Effect[] = [];

    if (this.props.telegramMode === "webhook") {
      effects.push({ type: "telegram.removeWebhook", botToken: this.token });
    } else if (this.props.telegramMode === "polling") {
      effects.push({
        type: "telegram.stopPolling",
        botId: this.id,
      });
    }

    return effects;
  }

  restart(): Effect[] {
    const effects: Effect[] = [];

    // Stop completely first
    effects.push(...this.stop());

    // If bot is enabled, re-enable based on current telegramMode
    if (this.props.enabled) {
      if (this.props.telegramMode === "webhook") {
        effects.push({
          type: "telegram.ensureWebhook",
          botId: this.id,
          botToken: this.token,
        });
      } else if (this.props.telegramMode === "polling") {
        effects.push({
          type: "telegram.startPolling",
          botId: this.id,
          botToken: this.token,
        });
      }
    }

    return effects;
  }
}
