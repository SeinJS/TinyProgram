import * as Sein from 'seinjs';

import SystemActor from './SystemActor';

export interface IEarthActorOptions extends Sein.IStaticMeshComponentState {

}

export function isEarthActor(value: Sein.SObject): value is EarthActor {
  return (value as EarthActor).isEarthActor;
}

@Sein.SClass({className: 'EarthActor'})
export default class EarthActor extends Sein.StaticMeshActor<IEarthActorOptions> {
    public isEarthActor: boolean = true;
    private rotationSpeed: number = 0.01;

    public onInstantiate(initOptions: IEarthActorOptions) {
      this.transform.setPosition(0, -1.2, -2.1);
      Sein.findActorByClass(this.getGame(), SystemActor).setEarthActor(this);
    }

    public setRotationSpeed(rotationSpeed: number) {
      this.rotationSpeed = rotationSpeed;
    }

    public rotateWithAxis() {
      this.transform.rotationZ -= this.rotationSpeed;
    }
}