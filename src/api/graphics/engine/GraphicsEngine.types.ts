import { Vector } from '../../math/vector/Vector';

export type GraphicsEngineOptions = {
  scale?: number;
  zShift?: Vector;
  camera?: {
    near: number;
    far: number;
    fieldOfView: number;
    position: Vector;
  };
  fps?: number;
};
