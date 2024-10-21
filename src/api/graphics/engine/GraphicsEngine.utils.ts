import { Vector } from '../../math/vector/Vector';

export const GRAPHICS_ENGINE_OPTIONS_DEFAULTS = {
  scale: 750,
  zShift: new Vector(0, 0, 5, 0),
  camera: {
    near: 1,
    far: 1000,
    fieldOfView: 90,
    position: new Vector(0, 0, 0),
    direction: new Vector(0, 0, 1),
    displacement: 0.2,
  },
  useWorker: false,
  fps: 30,
};
