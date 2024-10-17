import { GraphicsEngine } from './api/graphics/engine/GraphicsEngine';

window.vertexGameEngine = { graphics: {} as GraphicsEngine };

const graphicsEngine = new GraphicsEngine(undefined, { useWorker: false });
const meshes = ['http://127.0.0.1:8080/monkey.obj'];

graphicsEngine
  .loadMeshes(...meshes)
  .then(graphicsEngine.render.bind(graphicsEngine));
