# Chapter-5：引入交互

一个游戏必定会发生玩家和游戏世界的交互，在这一章，我们将会加载飞船模型，并能够让玩家通过手指触摸移动事件来控制飞船的飞行，增加这个小游戏的可玩性。当然，游戏的可玩性设计和人机交互设计方面是两个很广很深的领域。

## 加载飞船模型

加载飞船模型的过程和步骤可以参考之前加载地球模型的过程来，在这里设定飞船的``ClassName``为``SpaceshipActor``，也是扩写自``StaticMeshActor``类。

![spaceship-export](./img/chapter5-0.png)

对于脚本来说，我们创建``SpaceshipActor``类并编写其装饰器，为了方便管理和控制，依旧把它添加到``SystemActor``中。

```
/* SpaceshipActor.ts */
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
```

```
/* SystemActor.ts */
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
    }

    public addStarActor(star: StarActor) {
        this.stars.push(star);
    }
}
```

别忘记最后在``src/game/index.ts``中``import`` ``SpaceshipActor``。

```
/* src/index.ts */
import './components/actors/SpaceshipActor';
```

这样我们就加载并显示一艘静止的飞船并摆放在合适的位置上了，游戏所需的模型都加载完毕后，整个游戏场景就看起来不那么空旷了。

![fruit-show-5-0](./img/chapter5-1.png)

## HID交互

HID，即用户接口设备，泛指和用户进行交互的设备，如果你是PC端游戏爱好者，那么常见HID可能是鼠标、键盘或者麦克风，如果你是移动端游戏粉，那么HID可能是你眼前的屏幕等等。

对于PC端和移动端的常见HID，Sein.js提供了键盘事件、鼠标事件和触摸事件提供给开发者进行开发，当然，你还可以注册新的事件并监听。

在这里，我们简单的使用``TouchMove``事件来控制飞船的飞行，并做出一个简单的飞船跟随控制。**注意：PC端浏览器调试请选择移动模式！**

- step1：给``game``的``hid``添加``TouchMove``事件。在这里，我在给``SystemActor``添加``SpaceshipActor``时，给``hid``添加该事件，回调函数为``handleMoveEvent``。也许更好的方式是在``MainLevelScript``中为``game``添加？

```
/* SystemActor.ts */
@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    // emit some source code here...

    public isSystemActor: boolean = true;

    public spaceship: SpaceshipActor = null;

    public setSpaceshipActor(spaceship: SpaceshipActor) {
        this.spaceship = spaceship;
        this.addMoveEvent();
    }

    private addMoveEvent() {
        const game = this.getGame();
        game.hid.add('TouchMove', this.handleMoveEvent);
    }

    private handleMoveEvent = (args) => {
        
    }
}
```

- step2：编写``handleMoveEvent``回调函数，在这个函数里控制飞船的运动。在传入的``args``参数中，获取其手指接触点的坐标``clientX``和``clientY``，计算这两个坐标值相对于整个``canvas``的长宽比例，即做了一个简单的归一化，并通过归一化后的值对飞船``transform``的``position``属性进行修改。同时，为了使得飞船有种沿着圆弧轨道运动的感觉，对于飞船``transform``的``rotation``进行修改。事实上，由于万有引力的作用，很难垂直地移动，除非你有足够的动力。

```
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
        }
        else {
            console.log('Please use it in the mobile phone model.');
        }
    }
```

- step3：同时改变地球和星星的转速，营造一种飞船往前就加速的错觉。这里的错觉利用了相对运动这个``trick``，地球后退得越快，感觉飞船前进得就加快一点。在``SpaceshipActor``和``StarActor``中添加``rotationSpeed``私有变量，并写方法``setRotationSpeed``来修改它的旋转速度，在``SystemActor``中的``handleMove``方法中根据手指触摸的位置，同步改变转速

```
/* EarthActor.ts */
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
```

```
/* SystemActor.ts */
// emit some source code here...
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
```

到这里，你能看到你的飞船跟随你的手指移动了。不过，也许你会有更好的控制方法，给飞船加入动画或者添加阻尼效果会更加有操作感？

## 潜在的踩坑点

N/A

## 章节成果展示

![fruit-show-5-1](./img/chapter5-3.gif)

## 章节代码参考

// TODO
// SystemActor.ts
// EarthActor.ts
// SpaceshipActor.ts
// StarActor.ts