import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { GraphicsEngine } from './GraphicsEngine';

import { GeometryPipelineArgs } from './GraphicsEngine.types';

onmessage = function (event) {
  const data = event.data as GeometryPipelineArgs;
  data.camera.__proto__ = Camera.prototype;
  data.zShift.__proto__ = Vector.prototype;
  data.meshes.forEach((mesh) => (mesh.__proto__ = Mesh.prototype));
  data.projectionMatrix.__proto__ = Matrix.prototype;

  const raster = GraphicsEngine.geometry(data);
  const finalRaster = GraphicsEngine.rasterize(raster, data.camera);

  this.postMessage(finalRaster);
};
