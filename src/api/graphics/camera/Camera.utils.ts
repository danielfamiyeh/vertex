import { CameraFrustrum } from '../camera/Camera.types';

export const cameraBounds = [
  'top',
  'bottom',
  'left',
  'right',
] as unknown as (keyof CameraFrustrum)[];
