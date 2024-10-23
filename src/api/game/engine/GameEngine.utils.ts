import { GraphicsEngineOptions } from '../../graphics/engine/GraphicsEngine.types';
import { PhysicsEngineOptions } from '../../physics/engine/PhysicsEngine.types';

export type GameEngineOptions = {
  graphics: GraphicsEngineOptions;
  physics: PhysicsEngineOptions;
};
