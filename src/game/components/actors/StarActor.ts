import * as Sein from 'seinjs';

import SystemActor from './SystemActor';
import GameState from '../../states/GameState';
import { GlobalEvent } from '../../GlobalEvent';

export interface IStarActorOptions extends Sein.IStaticMeshComponentState {

}

export function isStarActor(value: Sein.SObject): value is StarActor {
  return (value as StarActor).isStarActor;
}

@Sein.SClass({className: 'StarActor'})
export default class StarActor extends Sein.StaticMeshActor<IStarActorOptions> {
    public isStarActor: boolean = true;

    private r: number;
    private alpha: number;
    private rotationSpeed: number = 0.01;

    public onInstantiate(initOptions: IStarActorOptions) {
        // 随机设定星星的轨道半径和初相位
        this.r = 1.2 + Math.random() * 1.2;
        this.alpha = Math.random() * 6.18;

        this.transform.setPosition(-this.r * Math.cos(this.alpha), -1.2 + this.r * Math.sin(this.alpha), -2.1);

        this.rigidBody.event.add('Collision', this.handleCollision);
        
        Sein.findActorByClass(this.getGame(), SystemActor).addStarActor(this);
    }

    public setRotationSpeed(rotationSpeed: number) {
        this.rotationSpeed = rotationSpeed;
    }

    public rotateWithEarth() {
        this.alpha += this.rotationSpeed;
        this.transform.setPosition(-this.r * Math.cos(this.alpha), -1.2 + this.r * Math.sin(this.alpha), -2.1);
    }

    public floating(delta: number) {
        this.transform.position.y += 0.2 * Math.sin(delta);
    }

    public rotateWithSelf(delta: number) {
        this.transform.rotationY = Math.sin(delta);
    }

    private handleCollision = (args) => {
        const game = this.getGame();
        const world = this.getWorld();

        if(args.otherActor.isSpaceshipActor && args.selfActor.visible) {
            console.log('Collision With Spaceship!');
            this.visible = false;

            // 捕获一颗星星
            this.getGame<GameState>().state.starNum ++;
            game.event.trigger(GlobalEvent.GetStar);

            // 产生星云
            const particleStarCloud = world.addActor('particleSystem', Sein.GPUParticleSystem.Actor, {
                emitter: new Sein.GPUParticleSystem.SphereEmitter({
                    radius: 0.1
                }),
                count: 1000,
                maxLifeTime: 2.5,
                minLifeTime: 1.5,
                updateSpeed: .01,
                maxVelocity: 1.5,
                minVelocity: 0.5,
                texture: game.resource.get<'Texture'>('point'),
                maxSize: 20,
                minSize: 10,
                maxAcceleration: 0
            });
            particleStarCloud.transform.rotationZ = 45;
            particleStarCloud.transform.position = args.selfActor.transform.position;
            setInterval(() => {
                particleStarCloud.stop();
                particleStarCloud.visible = false;
                world.removeActor(particleStarCloud);
            },1000);
        }
    }
}