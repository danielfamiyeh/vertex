import { CameraFrustrum } from './Camera.types';

export const cameraBounds = [
  'top',
  'bottom',
  'left',
  'right',
] as unknown as (keyof CameraFrustrum)[];
