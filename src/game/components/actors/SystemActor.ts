import * as Sein from 'seinjs';

import EarthActor from './EarthActor';
import SpaceshipActor from './SpaceshipActor';
import StarActor from './StarActor';

export interface ISystemActorOptions {

}

export function isSystemActor(value: Sein.SObject): value is SystemActor {
  return (value as SystemActor).isSystemActor;
}

@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    public isSystemActor: boolean = true;

    public earth: EarthActor = null;
    public spaceship: SpaceshipActor = null;
    public stars: StarActor[] = [];

    public time: number = 0;

    public start() {

    }

    public onUpdate(delta: number) {
        this.time += delta / 1000;
        if(this.earth) {
            this.earth.rotateWithAxis();
        }
        if(this.stars) {
            this.stars.forEach(star => {
                star.rotateWithEarth();
                star.floating(this.time);
                star.rotateWithSelf(this.time * 2);
            });
        }
    }

    public destroy() {
        this.earth = null;
        this.spaceship = null;
        this.stars = [];
    }

    public setEarthActor(earth: EarthActor) {
        this.earth = earth;
    }

    public setSpaceshipActor(spaceship: SpaceshipActor) {
        this.spaceship = spaceship;
        this.addMoveEvent();
    }

    public addStarActor(star: StarActor) {
        this.stars.push(star);
    }

    private addMoveEvent() {
        const game = this.getGame();
        game.hid.add('TouchMove', this.handleMoveEvent);
    }

    private handleMoveEvent = (args) => {
        const game = this.getGame();
        const canvasWidth = game.screenWidth;
        const canvasHeight = game.screenHeight;

        if(args.touches) {
            const x = args.touches[0].clientX;
            const y = args.touches[0].clientY;
            const normalX = 0.5 - x / canvasWidth;
            const normalY = 0.5 - y / canvasHeight;
            let positionX = 4 * normalX;
            let positionY = 4 * normalY;
            if(positionY < -0.10) {
                positionY = -0.10;
            }
            this.spaceship.transform.setPosition(positionX, positionY, -2.1);
            this.spaceship.transform.rotationX = normalX;

            // 配合飞船改变地球和星星的转速
            const newSpeed = 0.01 + 0.1 * (x / canvasWidth - 0.5);
            if(newSpeed > 0.01) {
                this.earth.setRotationSpeed(newSpeed);
                this.stars.forEach(star => {
                    star.setRotationSpeed(newSpeed);
                });
            }
            else {
                this.earth.setRotationSpeed(0.01);
                this.stars.forEach(star => {
                    star.setRotationSpeed(0.01);
                });
            }
        }
        else {
            console.log('Please use it in the mobile phone model.');
        }
    }
}