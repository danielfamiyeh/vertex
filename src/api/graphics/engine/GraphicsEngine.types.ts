import { Vector } from '../../math/vector/Vector';

export type GraphicsEngineOptions = {
  scale?: number;
  zShift?: Vector;
  nearPlane?: number;
  farPlane?: number;
  fieldOfView?: number;
};

export type Raster = {
  face: Vector[];
  zMidpoint: number;
  pNormal: Vector;
  color: string;
}[];
