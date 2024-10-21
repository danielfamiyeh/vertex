import { GameEngine } from './api/game/engine/GameEngine';
import { Entity } from './api/game/entity/Entity';
import { Vector } from './api/math/vector/Vector';
import { RigidBody } from './api/phyisics/rigid-body/RigidBody';

const gameEngine = new GameEngine({
  graphics: {
    fps: 30,
    zShift: new Vector(0, 0, 50),
  },
  physics: {},
});

(async () => {
  gameEngine.entities.earth = new Entity('earth');
  const earth = await gameEngine.loadEntityMesh(
    'earth',
    'http://127.0.0.1:8080/sphere.obj'
  );

  gameEngine.entities.mars = new Entity('mars');
  const mars = await gameEngine.loadEntityMesh(
    'mars',
    'http://127.0.0.1:8080/sphere.obj'
  );

  earth.rigidBody = new RigidBody({
    position: new Vector(5, 5, 0),
    direction: new Vector(0, 0, 0),
    mass: 0,
  });

  console.log(earth);

  gameEngine.start();
})();
