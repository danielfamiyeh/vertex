import { Vector } from '../../math/vector/Vector';
import { CameraFrustrum, CameraOptions } from './Camera.types';
import { Color } from '../color/Color';
import { Plane } from '../../math/plane/Plane';
import { GameEngine } from '@vertex/api/game/engine/GameEngine';

const upVector = new Vector(0, 1, 0);

export class Camera {
  private _frustrum: CameraFrustrum;
  private _position: Vector;
  private _direction: Vector;
  private _displacement: number;
  private _rotation: number;

  constructor(options: CameraOptions) {
    this._position = options.position;
    this._direction = options.direction;
    this._displacement = options.displacement;
    this._rotation = options.rotation;

    this._frustrum = {
      // TODO: Why are some of these flipped?
      near: new Plane(new Vector(0, 0, options.near), new Vector(0, 0, 1)),
      far: new Plane(new Vector(0, 0, options.far), new Vector(0, 0, -1)),
      left: new Plane(
        new Vector(options.right / 2 + 1, 0, 0),
        new Vector(1, 0, 0)
      ),
      right: new Plane(
        new Vector(-(options.right / 2) - 1, 0, 0),
        new Vector(-1, 0, 0)
      ),
      top: new Plane(
        new Vector(0, -(options.bottom / 2) - 1, 0),
        new Vector(0, -1, 0)
      ),
      bottom: new Plane(
        new Vector(0, options.bottom / 2 + 1, 0),
        new Vector(0, 1, 0)
      ),
    };

    addEventListener('keydown', this.defaultKeydownListener.bind(this));
    addEventListener('keyup', this.defaultKeyUpListener.bind(this));
  }

  defaultKeyUpListener(event: KeyboardEvent) {
    // @ts-ignore

    const key = event.key.toLowerCase();

    const cameraEntity = (window.__VERTEX_GAME_ENGINE__ as GameEngine).entities
      .__CAMERA__;

    if (key === 'w' || key === 's') {
      cameraEntity.body?.forces.velocity = new Vector(0, 0, 0);
    }

    if (key === 'arrowdown' || key === 'arrowup') {
      cameraEntity.body?.forces.velocity.y = 0;
    }

    if (key === 'arrowright' || key === 'arrowleft') {
      cameraEntity.body?.forces.velocity = new Vector(0, 0, 0);
    }

    if (key === 'a' || key === 'd') {
      cameraEntity.body?.forces.rotation.x = 0;
    }
  }

  defaultKeydownListener(event: KeyboardEvent) {
    // @ts-ignore
    const cameraEntity = (window.__VERTEX_GAME_ENGINE__ as GameEngine).entities
      .__CAMERA__;

    if (!cameraEntity.body) return;

    if (event.key === 'ArrowUp') {
      cameraEntity.body?.forces.velocity.y = this._displacement;
    }

    if (event.key === 'ArrowDown') {
      cameraEntity.body?.forces.velocity.y = -this._displacement;
    }

    if (event.key === 'ArrowLeft') {
      const left = this.direction
        .cross(upVector)
        .normalize()
        .scale(this._displacement);

      cameraEntity.body?.forces.velocity = left;
    }

    if (event.key === 'ArrowRight') {
      const right = this.direction
        .cross(upVector)
        .normalize()
        .scale(-this._displacement);

      cameraEntity.body?.forces.velocity = right;
    }

    if (event.key.toLowerCase() === 'a') {
      cameraEntity.body?.forces.rotation.x = -this._rotation;
    }

    if (event.key.toLowerCase() === 'd') {
      cameraEntity.body?.forces.rotation.x = this._rotation;
    }

    if (event.key.toLowerCase() === 'w') {
      cameraEntity.body?.forces.velocity = Vector.normalize(
        this._direction
      ).scale(this._displacement);
    }

    if (event.key.toLowerCase() === 's') {
      cameraEntity.body?.forces.velocity = Vector.normalize(
        this._direction
      ).scale(-this._displacement);
    }
  }

  shouldCull(p1: Vector, p2: Vector, p3: Vector, epsilon = 0.05) {
    const pNormal = Vector.sub(p2, p1)
      .cross(Vector.sub(p3, p1))
      .normalize()
      .extend(0);

    const raySimilarity = Vector.sub(p1, this.position)
      .normalize()
      .dot(pNormal);
    return { pNormal, raySimilarity, shouldCull: raySimilarity < epsilon };
  }

  illuminate(normal: Vector) {
    const light = new Vector(0, 0, -1).normalize();

    const raySimilarity = light.dot(normal);
    const brightness = raySimilarity;

    let color = new Color({
      type: 'rgb',
      comps: [128, 255, 255],
    }).RGBToHSV();
    color.comps[2] = brightness;

    return { color };
  }

  get position() {
    return this._position;
  }

  get direction() {
    return this._direction;
  }

  get displacement() {
    return this._displacement;
  }

  set displacement(d: number) {
    this._displacement = d;
  }

  get frustrum() {
    return this._frustrum;
  }
}
