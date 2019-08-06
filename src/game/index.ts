/**
 * @File   : main.tsx
 * @Author :  ()
 * @Date   : Wed Jul 31 2019
 * @Description: Component.
 */
import * as Sein from 'seinjs';

import './components/actors/SystemActor';
import './components/actors/EarthActor';
import './components/actors/SpaceshipActor';
import './components/actors/StarActor';

import GameState from './states/GameState';
import MainGameMode from './scripts/MainGameMode';
import MainLevelScript from './scripts/MainLevelScript';
import { GlobalEvent } from './GlobalEvent';

export async function main(canvas: HTMLCanvasElement): Promise<Sein.Game> {
  const engine = new Sein.Engine();

  const game = new Sein.Game(
    'intro-game',
    {
      canvas,
      clearColor: new Sein.Color(0.254, 0.183, 0.394, 1),
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
      antialias: true
    },
    GameState
  );

  engine.addGame(game);

  game.addWorld('main', MainGameMode, MainLevelScript);

  game.event.register(GlobalEvent.GetStar);

  await game.start();

  return game;
}
