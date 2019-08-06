/**
 * @File   : MainGameMode.tsx
 * @Author :  ()
 * @Date   : Wed Jul 31 2019
 * @Description: MainGameMode.
 */
import * as Sein from 'seinjs';
import * as CANNON from 'cannon-dtysky';
// import 'seinjs-debug-tools';

export default class MainGameMode extends Sein.GameModeActor {
  private delta: number;
  // private physicDebugger: Sein.DebugTools.CannonDebugRenderer;

  public onError(error: Error) {
    console.log(error);

    return true;
  }

  public onAdd() {
    this.delta = 0;

    this.getWorld().enablePhysic(
      new Sein.CannonPhysicWorld(
        CANNON,
        new Sein.Vector3(0, 0, 0)),
    );
    
    // this.physicDebugger = new Sein.DebugTools.CannonDebugRenderer(this.getGame());
  }

  public onUpdate(delta: number) {
    this.delta += delta;

    if (this.delta > 2000) {
      this.delta = 0;
    }

    // this.physicDebugger.update();
  }
}
