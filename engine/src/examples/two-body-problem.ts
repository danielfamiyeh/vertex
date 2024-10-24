import { Entity } from '@vertex/api/game/entity/Entity';
import { GameEngine } from '../api/game/engine/GameEngine';
import { Vector } from '../api/math/vector/Vector';
import { SphereCollider } from '../api/physics/collider/SphereCollider';

const fGravity = (entityA: Entity, entityB: Entity) => {
  if (!entityA.body || !entityB.body) return new Vector(0, 0, 0);

  const G = 0.025;
  const distance = Vector.sub(entityB.body.position, entityA.body.position);
  const r = distance.mag;

  if (!r) return new Vector(0, 0, 0);

  const scalar = (G * (entityA.body.mass * entityB.body.mass)) / r ** 2;

  return distance.normalize().scale(scalar);
};

export const initTwoBodyProblemExample = async (gameEngine: GameEngine) => {
  const earth = await gameEngine.createEntity('earth', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
    },
    physics: {
      position: new Vector(8, 5, -5),
      rotation: new Vector(30, 0, 0),
      mass: 10,
      forces: {
        velocity: new Vector(0, 0, 0.1),
        rotation: new Vector(0, 1, 0),
      },
      transforms: {
        rotate(_, self) {
          self.rotation.add(self.forces.rotation);
        },
        applyGravity(_, self, entities) {
          self.forces.velocity.add(
            fGravity(entities.moon, entities.earth).scale(-1 / self.mass)
          );
        },
        move(_, self) {
          self.position.add(self.forces.velocity);
        },
      },
    },
  });

  const moon = await gameEngine.createEntity('moon', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
      scale: Vector.uniform(0.25, 3),
    },
    physics: {
      position: new Vector(-5, 0, 0),
      rotation: new Vector(0, 2, 0),
      mass: 1,
      forces: {
        velocity: new Vector(0, 0, 0),
        rotation: new Vector(0, 4, 0),
      },
      transforms: {
        rotate(_, self) {
          self.rotation.add(self.forces.rotation);
        },
        applyGravity(_, self, entities) {
          self.forces.velocity.add(
            fGravity(entities.moon, entities.earth).scale(1 / self.mass)
          );
        },
        move(_, self) {
          self.position.add(self.forces.velocity);
        },
      },
    },
  });

  earth.colliders.withMoon = new SphereCollider(earth.body, moon.body, () => {
    moon.body?.forces.velocity.scale(-1);
    earth.body?.forces.velocity.scale(-1);
  });
  earth.colliders.withMoon.isActive = true;

  console.log(gameEngine);
};
