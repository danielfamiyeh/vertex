import { Vector } from '../../math/vector/Vector';

export const GRAPHICS_ENGINE_OPTIONS_DEFAULTS = {
  scale: 750,
  zShift: new Vector(0, 0, 5),
  nearPlane: 0.1,
  farPlane: 1000,
  fieldOfView: 90,
  cameraPosition: new Vector(0, 0, 0),
  useWorker: true,
  fps: 30,
};
