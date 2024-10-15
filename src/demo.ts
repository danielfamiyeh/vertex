import { Vector } from './api/math/Vector';
import { Cube } from './api/util/cube/Cube';
import { GraphicsEngine } from './api/graphics/engine/GraphicsEngine';

const cube = new Cube(new Vector(0, 0, 0));
const graphicsEngine = new GraphicsEngine(undefined, { fieldOfView: 45 });

graphicsEngine.render([cube.mesh]);
