import { Effect } from "../../domain/effects/Effect";
import { EffectRunner } from "../../infra/effects/EffectRunner";

export class EffectsContext {
  private effects: Effect[] = [];

  add(effects: Effect[]) {
    this.effects.push(...effects);
  }

  async flush(runner: EffectRunner) {
    const toRun = this.effects;
    this.effects = [];
    await runner.runAll(toRun);
  }
}
