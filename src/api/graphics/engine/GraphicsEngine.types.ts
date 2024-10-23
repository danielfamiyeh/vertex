import { Vector } from '../../math/vector/Vector';

export type GraphicsEngineOptions = {
  zShift?: Vector;
  camera?: {
    near: number;
    far: number;
    fieldOfView: number;
    position: Vector;
  };
  fps?: number;
};
