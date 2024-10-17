import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { Camera } from '../camera/Camera';
import { Mesh } from '../mesh/Mesh';

export type GraphicsEngineOptions = {
  scale?: number;
  zShift?: Vector;
  nearPlane?: number;
  farPlane?: number;
  fieldOfView?: number;
  useWorker?: boolean;
  fps?: number;
};

export type Raster = {
  face: Vector[];
  zMidpoint: number;
  pNormal: Vector;
  color: string;
}[];

export type GeometryPipelineArgs = {
  meshes: Mesh[];
  zShift: Vector;
  camera: Camera;
  projectionMatrix: Matrix;
  zOffset: number;
};
