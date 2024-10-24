import { Vector } from '../../math/vector/Vector';
import { GraphicsEngineOptions } from './GraphicsEngine.types';

export const GRAPHICS_ENGINE_OPTIONS_DEFAULTS: Required<GraphicsEngineOptions> =
  {
    fps: 30,
    style: 'stroke',
    scale: 300,
    camera: {
      near: 0.01,
      far: 1000,
      fieldOfView: 90,
      position: new Vector(0, 0, 0),
      direction: new Vector(0, 0, -5),
      displacement: 0.5,
      rotation: 1e-2,
    },
  };
