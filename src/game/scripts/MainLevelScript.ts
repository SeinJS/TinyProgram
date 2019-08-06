/**
 * @File   : MainLevelScript.tsx
 * @Author :  ()
 * @Date   : Wed Jul 31 2019
 * @Description: MainLevelScript.
 */
import * as Sein from 'seinjs';
import 'seinjs-gpu-particle-system';

import SystemActor from '../components/actors/SystemActor';

export default class MainLevelScript extends Sein.LevelScriptActor {
  private system: SystemActor;

  public onAdd() {
    this.system = this.getGame().addActor('system', SystemActor);
  }

  public onPreload() {
    const game = this.getGame();

    game.resource.load({type: 'GlTF', name: 'earth.gltf', url: '../../assets/gltfs/earth.gltf'});
    game.resource.load({type: 'GlTF', name: 'spaceship.gltf', url: '../../assets/gltfs/spaceship.gltf'});
    game.resource.load({type: 'GlTF', name: 'star.gltf', url: '../../assets/gltfs/star.gltf'});

    game.resource.load({type: 'Texture', name: 'point', url: '../../assets/img/point.png'});
  }

  public onLoading(state: Sein.IResourceState) {
    console.log(state.current, state.progress);
  }

  public onCreate() {
    const game = this.getGame();
    const world = this.getWorld();

    const camera = world.addActor('camera', Sein.PerspectiveCameraActor, {
      far: 1000,
      near: .01,
      fov: 60,
      aspect: game.screenWidth / game.screenHeight,
      position: new Sein.Vector3(0, 0, -5)
    });
    camera.lookAt(new Sein.Vector3(0, 0, 0));

    world.addActor('aLight', Sein.AmbientLightActor, {
      color: new Sein.Color(1, 1, 1),
      amount: 0.9
    });
    world.addActor('dLight', Sein.DirectionalLightActor, {
      direction: new Sein.Vector3(1, -1, 0.5),
      color: new Sein.Color(1, 1, 1),
      amount: 1.7
    });

    game.resource.instantiate<'GlTF'>('earth.gltf');
    game.resource.instantiate<'GlTF'>('spaceship.gltf');
    game.resource.instantiate<'GlTF'>('star.gltf');

    this.system.start();
  }

  public onUpdate() {
  }
}
