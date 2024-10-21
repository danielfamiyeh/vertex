import { GraphicsEngine } from '../../graphics/engine/GraphicsEngine';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from '../../graphics/engine/GraphicsEngine.utils';
import { PhysicsEngine } from '../../phyisics/engine/PhysicsEngine';
import { GameEngineOptions } from './GameEngine.utils';
import { Entity } from '../entity/Entity';

export class GameEngine {
  private _graphics: GraphicsEngine;
  private _physics: PhysicsEngine;
  private _entities: Record<string, Entity> = {};

  constructor({ graphics, physics }: GameEngineOptions) {
    this._graphics = new GraphicsEngine(
      document.getElementById('canvas') as HTMLCanvasElement,
      Object.assign({}, GRAPHICS_ENGINE_OPTIONS_DEFAULTS, graphics)
    );

    this._physics = new PhysicsEngine();

    window.__VERTEX_GAME_ENGINE__ = this;
  }

  start() {
    this.graphics.render(this._entities);
  }

  async loadEntityMesh(id: string, url: string) {
    const mesh =
      this.graphics.meshes[url] ?? (await this.graphics.loadMesh(url));

    if (!this.entities[id]) this.entities[id] = new Entity(id);

    this.entities[id].mesh = mesh;

    return this.entities[id];
  }

  get physics() {
    return this._physics;
  }

  get graphics() {
    return this._graphics;
  }

  get entities() {
    return this._entities;
  }
}
