import { Plane } from '@vertex/api/math/plane/Plane';
import { Vector } from '@vertex/api/math/vector/Vector';

export type CameraFrustrum = {
  near: Plane;
  far: Plane;
  left: Plane;
  right: Plane;
  top: Plane;
  bottom: Plane;
};

export type CameraOptions = {
  displacement: number;
  rotation: number;
  position: Vector;
  direction: Vector;
  near: number;
  far: number;
  bottom: number;
  right: number;
};
