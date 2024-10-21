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

  mars.rigidBody = new RigidBody({
    position: new Vector(0, 0, 0),
    rotation: new Vector(0, 0, 0),
    mass: 0,
  });

  earth.rigidBody = new RigidBody({
    position: new Vector(5, 5, 0),
    rotation: new Vector(30, 0, 0),
    mass: 0,
  });

  earth.rigidBody.transforms.moveBack = () => {
    earth.rigidBody?.position.sub(new Vector(0, 0, -1));
  };

  earth.rigidBody.transforms.rotate = () => {
    earth.rigidBody?.rotation.add(new Vector(0, 4, 0));
  };

  mars.rigidBody?.transforms.rotate = () => {
    mars.rigidBody?.rotation.add(new Vector(0, 4, 0));
  };

  gameEngine.start();
})();
