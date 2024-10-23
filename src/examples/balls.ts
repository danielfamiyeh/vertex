import { GameEngine } from '../api/game/engine/GameEngine';
import { Vector } from '../api/math/vector/Vector';

export const initBallsExample = async (gameEngine: GameEngine) => {
  const earth = await gameEngine.createEntity('earth', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
    },
    physics: {
      position: new Vector(5, 5, 0),
      rotation: new Vector(30, 0, 0),
      forces: {
        velocity: new Vector(0, 0, 0.1),
        acceleration: new Vector(0, 0, 0.1),
        rotation: new Vector(0, 4, 0),
      },
      transforms: {
        rotate: (_, body) => body.rotation.add(body.forces.rotation),
        move: (_, body) => body.position.add(body.forces.velocity),
        accelerate: (_, body) => {
          body.forces.acceleration.z = body.position.z >= 50 ? -0.1 : 0.1;
          body.forces.velocity.add(body.forces.acceleration);
        },
      },
    },
  });

  const mars = await gameEngine.createEntity('mars', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
    },
    physics: {
      position: new Vector(0, 0, -25),
      rotation: new Vector(0, 0, 0),
      forces: {
        velocity: new Vector(0, 0, 0.1),
        acceleration: new Vector(0, 0, 0.2),
        rotation: new Vector(0, 8, 0),
      },
      transforms: {
        rotate: (_, body) => body.rotation.add(body.forces.rotation),
        move: (_, body) => body.position.add(body.forces.velocity),
        accelerate: (_, body) => {
          body.forces.acceleration.z = body.position.z >= 25 ? -0.2 : 0.2;
          body.forces.velocity.add(body.forces.acceleration);
        },
      },
    },
  });
};
