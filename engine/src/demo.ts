import { GameEngine } from './api/game/engine/GameEngine';
import { Vector } from './api/math/vector/Vector';
import { examples } from './examples';

const gameEngine = new GameEngine({
  graphics: {
    fps: 30,
    scale: 300,
    camera: {
      near: 0.1,
      far: 1000,
      fieldOfView: 45,
      position: new Vector(0, 10, -30),
      direction: new Vector(0, 0, 1),
      displacement: 1,
      rotation: 1e-2,
    },
  },
  physics: {},
});

examples.twoBodyProblem(gameEngine).then(() => gameEngine.start());
