import { Matrix } from './Matrix';

export function getProjectionMatrix(
  canvas: HTMLCanvasElement,
  nearPlane: number,
  farPlane: number,
  fieldOfViewDegrees: number
) {
  const aspectRatio = canvas.height / canvas.width;
  const projectionMatrix = Matrix.identity(4);

  const fieldOfViewRadians =
    1 / Math.tan(0.5 * fieldOfViewDegrees * (3.14 / 180));
  const fx = fieldOfViewRadians;
  const fy = fieldOfViewRadians;
  const fz = farPlane / (farPlane - nearPlane);

  projectionMatrix._mat[0][0] = aspectRatio * fx;
  projectionMatrix._mat[1][1] = fy;
  projectionMatrix._mat[2][2] = fz;

  return {
    projectionMatrix,
    zOffset: (farPlane * nearPlane) / (farPlane - nearPlane),
  };
}
