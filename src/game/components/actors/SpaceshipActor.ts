import * as Sein from 'seinjs';

import SystemActor from './SystemActor';

export interface ISpaceshipActorOptions extends Sein.IStaticMeshComponentState {

}

export function isSpaceshipActor(value: Sein.SObject): value is SpaceshipActor {
  return (value as SpaceshipActor).isSpaceshipActor;
}

@Sein.SClass({className: 'SpaceshipActor'})
export default class SpaceshipActor extends Sein.StaticMeshActor<ISpaceshipActorOptions> {
    public isSpaceshipActor: boolean = true;

    public onInstantiate(initOptions: ISpaceshipActorOptions) {
      this.transform.setPosition(0, 0, -2.1);

      Sein.findActorByClass(this.getGame(), SystemActor).setSpaceshipActor(this);
    }
}