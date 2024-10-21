import { GraphicsEngineOptions } from '../../graphics/engine/GraphicsEngine.types';
import { PhysicsEngineOptions } from '../../phyisics/engine/PhysicsEngine.types';

export type GameEngineOptions = {
  graphics: GraphicsEngineOptions;
  physics: PhysicsEngineOptions;
};
