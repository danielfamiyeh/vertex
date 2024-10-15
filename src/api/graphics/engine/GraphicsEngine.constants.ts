import { Vector } from '../../math/Vector';

export const GRAPHICS_ENGINE_OPTIONS_DEFAULTS = {
  scale: 50,
  zShift: new Vector(0, 0, 1.3),
  nearPlane: 0.1,
  farPlane: 1000,
  fieldOfView: 90,
};
