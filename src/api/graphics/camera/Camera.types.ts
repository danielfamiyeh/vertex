import { Plane } from '@vertex/api/math/plane/Plane';
import { Vector } from '@vertex/api/math/vector/Vector';

export type CameraFrustrum = {
  near: Plane;
  far: Plane;
};

export type CameraOptions = {
  displacement: number;
  position: Vector;
  direction: Vector;
  near: number;
  far: number;
};
