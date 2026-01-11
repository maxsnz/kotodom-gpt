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
    } else if (this.props.telegramMode === "polling") {
      effects.push({
        type: "telegram.refreshPolling",
        botId: this.id,
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
        type: "telegram.refreshPolling",
        botId: this.id,
      });
    }

    return effects;
  }

  onModeChange(
    oldMode: "webhook" | "polling",
    newMode: "webhook" | "polling"
  ): Effect[] {
    const effects: Effect[] = [];

    // When switching from webhook to polling, remove webhook
    if (oldMode === "webhook" && newMode === "polling") {
      effects.push({ type: "telegram.removeWebhook", botToken: this.token });
      // If bot is enabled, start polling immediately
      if (this.props.enabled) {
        effects.push({
          type: "telegram.refreshPolling",
          botId: this.id,
        });
      }
    }

    // When switching from polling to webhook and bot is enabled, set webhook
    if (oldMode === "polling" && newMode === "webhook" && this.props.enabled) {
      effects.push({
        type: "telegram.ensureWebhook",
        botId: this.id,
        botToken: this.token,
      });
    }

    return effects;
  }
}
