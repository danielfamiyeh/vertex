import { Entity } from '@vertex/api/game/entity/Entity';

export class PhysicsEngine {
  private _lastUpdate: number = 0;
  constructor() {}

  update(entities: Record<string, Entity>) {
    const { lastUpdate } = this;

    const now = Date.now();
    const delta = now - lastUpdate;
    const interval = 1000 / 60;

    if (delta > interval) {
      Object.keys(entities).forEach((id) => {
        entities[id].body?.update(delta, entities);
      });
      this._lastUpdate = now - (delta % interval);
    }
  }

  get lastUpdate() {
    return this._lastUpdate;
  }
}
