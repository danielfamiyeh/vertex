import { GraphicsEngine } from '../../graphics/engine/GraphicsEngine';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from '../../graphics/engine/GraphicsEngine.utils';
import { PhysicsEngine } from '../../physics/engine/PhysicsEngine';
import { GameEngineOptions } from './GameEngine.utils';
import { Entity } from '../entity/Entity';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { RigidBodyOptions } from '@vertex/api/physics/rigid-body/RigidBody.utils';
import { Vector } from '../../math/vector/Vector';
import { Sphere } from '../../math/sphere/Sphere';

export class GameEngine {
  private _graphics: GraphicsEngine;
  private _physics: PhysicsEngine;
  private _entities: Record<string, Entity> = {};
  private _fps;
  private _lastFrame = Date.now();

  constructor({ graphics, physics }: GameEngineOptions) {
    // @ts-ignore
    window.__VERTEX_GAME_ENGINE__ = this;

    this._graphics = new GraphicsEngine(
      document.getElementById('canvas') as HTMLCanvasElement,
      Object.assign({}, GRAPHICS_ENGINE_OPTIONS_DEFAULTS, graphics)
    );

    this._physics = new PhysicsEngine();
    this._fps = graphics.fps ?? 30;
  }

  start() {
    const now = Date.now();
    const interval = 1000 / this.fps;
    const delta = now - this.lastFrame;

    if (delta > interval / 2) {
      this.physics.update(delta, this._entities);
    }

    if (delta > interval) {
      this.graphics.render(this._entities);
      this._lastFrame = now - (delta % interval);
    }

    window.requestAnimationFrame(() => this.start());
  }

  async createEntity(
    id: string,
    options: {
      graphics?: {
        mesh: string;
        scale?: Vector;
      };
      physics?: RigidBodyOptions;
    } = {}
  ) {
    if (this._entities[id]) {
      throw new Error(`Entity '${id}' already exists`);
    }

    const { graphics, physics } = options;
    const entity = new Entity(id);

    entity.scale = graphics?.scale ?? new Vector(1, 1, 1);

    this._entities[id] = entity;

    if (physics) entity.body = new RigidBody(physics);

    if (graphics?.mesh)
      await this.loadEntityMesh(id, graphics.mesh, entity.scale);

    return entity;
  }

  async loadEntityMesh(id: string, url: string, scale: Vector) {
    // TODO: Caching
    const { mesh, boundingSphere } = await this.graphics.loadMesh(
      id,
      url,
      scale
    );
    let entity = this.entities[id];

    if (!entity) entity = new Entity(id);

    entity.mesh = mesh;

    if (entity.body !== undefined) {
      entity.body.boundingSphere = boundingSphere;
    }

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

  get fps() {
    return this._fps;
  }

  get lastFrame() {
    return this._lastFrame;
  }
}
