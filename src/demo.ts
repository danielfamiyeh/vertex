import { GraphicsEngine } from './api/graphics/engine/GraphicsEngine';

const graphicsEngine = new GraphicsEngine();
const meshes = ['http://127.0.0.1:8080/monkey.obj'];

graphicsEngine.loadMeshes(...meshes).then(graphicsEngine.render);
