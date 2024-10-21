import { GameEngine } from './api/game/engine/GameEngine';
import { Entity } from './api/game/entity/Entity';
import { Vector } from './api/math/vector/Vector';

const gameEngine = new GameEngine({
  graphics: {
    fps: 30,
    zShift: new Vector(0, 0, 50),
  },
  physics: {},
});

(async () => {
  gameEngine.entities.earth = new Entity('earth');
  await gameEngine.loadEntityMesh('earth', 'http://127.0.0.1:8080/sphere.obj');

  gameEngine.entities.mars = new Entity('mars');
  await gameEngine.loadEntityMesh('mars', 'http://127.0.0.1:8080/sphere.obj');

  gameEngine.start();
})();
