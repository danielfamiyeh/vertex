import { GraphicsEngine } from './api/graphics/engine/GraphicsEngine';

window.__VERTEX_GAME_ENGINE__ = { graphics: {} as GraphicsEngine };

const graphicsEngine = new GraphicsEngine(undefined, {
  fps: 30,
});
const meshes = ['http://127.0.0.1:8080/mountains.obj'];

graphicsEngine
  .loadMeshes(...meshes)
  .then(graphicsEngine.render.bind(graphicsEngine));
