import { Vector } from '../../math/Vector';

export type GraphicsEngineOptions = {
  scale?: number;
  zShift?: Vector;
  nearPlane?: number;
  farPlane?: number;
  fieldOfView?: number;
};
