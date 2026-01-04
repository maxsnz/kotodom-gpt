import { Effect } from "../effects/Effect";

export class Bot {
  constructor(
    private props: {
      id: string;
      enabled: boolean;
      telegramMode: "webhook" | "polling";
      token: string;
    }
  ) {}

  get id() {
    return this.props.id;
  }
  get enabled() {
    return this.props.enabled;
  }
  get telegramMode() {
    return this.props.telegramMode;
  }
  get token() {
    return this.props.token;
  }

  enable(): Effect[] {
    if (this.props.enabled) return [];
    this.props.enabled = true;

    const effects: Effect[] = [];

    if (this.props.telegramMode === "webhook") {
      effects.push({ type: "telegram.ensureWebhook", botId: this.id });
    }

    return effects;
  }

  disable(): Effect[] {
    if (!this.props.enabled) return [];
    this.props.enabled = false;
    return []; // TODO telegram.removeWebhook
  }
}
