import { GeometryPipelineArgs, Raster } from './GraphicsEngine.types';
import { Vector } from '../../math/vector/Vector';
import { Camera } from '../camera/Camera';

export const GRAPHICS_ENGINE_OPTIONS_DEFAULTS = {
  scale: 750,
  zShift: new Vector(0, 0, 5),
  nearPlane: 0.1,
  farPlane: 1000,
  fieldOfView: 90,
  cameraPosition: new Vector(0, 0, 0),
  useWorker: true,
};

export const pipeline = {
  geometry(args: GeometryPipelineArgs) {
    const { meshes, zShift, camera, projectionMatrix, zOffset } = args;

    const raster: Raster = [];
    meshes.forEach((mesh) => {
      mesh.triangles.forEach(([p1, p2, p3]) => {
        const transformedP1 = Vector.add(p1, zShift);
        const transformedP2 = Vector.add(p2, zShift);
        const transformedP3 = Vector.add(p3, zShift);

        const pNormal = Vector.sub(transformedP2, transformedP1)
          .cross(Vector.sub(transformedP3, transformedP1))
          .normalize();
        const raySimilarity = Vector.sub(camera.position, transformedP1)
          .normalize()
          .dot(pNormal);

        // TODO: NO MAGIC NUMBERS
        if (raySimilarity < 0.05) return;

        const projectedP1 = projectionMatrix.mult(transformedP1.matrix).vector;
        const projectedP2 = projectionMatrix.mult(transformedP2.matrix).vector;
        const projectedP3 = projectionMatrix.mult(transformedP3.matrix).vector;

        projectedP1.comps[2] -= zOffset;
        projectedP2.comps[2] -= zOffset;
        projectedP3.comps[2] -= zOffset;

        const finalP1 = Vector.div(projectedP1, projectedP1.z);
        const finalP2 = Vector.div(projectedP2, projectedP2.z);
        const finalP3 = Vector.div(projectedP3, projectedP3.z);

        raster.push({
          face: [finalP1, finalP2, finalP3],
          zMidpoint: (projectedP1.z + projectedP2.z + projectedP3.z) / 3,
          pNormal,
          color: '',
        });
      });
    });

    return raster;
  },

  rasterize(raster: Raster, camera: Camera) {
    raster.sort((a, b) => b.zMidpoint - a.zMidpoint);

    raster.forEach((rasterObj) => {
      const { color } = camera.illuminate(rasterObj.pNormal);
      rasterObj.color = `#${color.toHex()}`;
    });

    return raster;
  },

  screen(raster: Raster, ctx: CanvasRenderingContext2D | null, scale: number) {
    raster.forEach((raster) => {
      if (!ctx) return;
      raster.face.forEach((v) => (v.__proto__ = Vector.prototype));

      const {
        face: [p1, p2, p3],
        color,
      } = raster;
      ctx.fillStyle = color;

      ctx?.beginPath();
      ctx?.moveTo(scale * p1.x, -scale * p1.y);
      ctx?.lineTo(scale * p2.x, -scale * p2.y);
      ctx?.lineTo(scale * p3.x, -scale * p3.y);
      ctx?.lineTo(scale * p1.x, -scale * p1.y);
      ctx?.fill();
    });
  },
};
