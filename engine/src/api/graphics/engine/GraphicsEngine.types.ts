import { Vector } from '../../math/vector/Vector';

export type GraphicsEngineOptions = {
  style?: 'fill' | 'stroke';
  camera?: {
    near: number;
    far: number;
    fieldOfView: number;
    position: Vector;
    displacement: number;
    direction: Vector;
    rotation: number;
  };
  fps?: number;
  scale?: number;
};
