# Chapter-4：模型编组

设想一种情况，假使你的游戏中有几位NPC，他们可能共同拥有一样的属性值，你可能会用navie的方法或甚至可能用AI相关算法来定义他们共同的行为，但是，他们的模型却是不同的，那么需要一个个导出模型资源吗？为了能够在unity和Sein.js中保持良好的资源结构架构，建议将这些同类的模型编组。

## unity中编组模型导出导入

在教程中，在地球的外轨道上有不少绕着地球公转的星星，虽然科学地来讲，地球只有月球这颗卫星绕着它公转……在unity中，我们将这些星星的模型编组在一个``Empty GameObject``下，每个星星都挂载有``SeinNode``脚本，并设置其``Class Name``为``StarActor``，按照之前的方式把这一组星星的模型导出，得到``star.gltf``和``star.bin``（你的模型可能含有纹理贴图）。

![model-array-export](./img/chapter4-0.png)

![model-array-export](./img/chapter4-1.png)

将导出的产物文件复制粘贴至``src/assets/gltfs``中。注意，此处已经定义了它的``className``，所以我们要按照之前类似的方法来写一个``StarActor``类。

## 使用Actor加载显示编组模型

这里的步骤和之前创建``EarthActor``类的方法十分相似，同时，引入了一些简单的数学来控制星星的公转、自转和扰动漂浮。

- step1：创建``StarActor.ts``。由于这个模型是需要显示几何和纹理材质信息的模型，我们需要在``StaticMeshActor``类的基础上扩展为``StarActor``类，并修改它的装饰器类名。

```
/* StarActor.ts */
import * as Sein from 'seinjs';

export interface IStarActorOptions extends Sein.IStaticMeshComponentState {

}

export function isStarActor(value: Sein.SObject): value is StarActor {
  return (value as StarActor).isStarActor;
}

@Sein.SClass({className: 'StarActor'})
export default class StarActor extends Sein.StaticMeshActor<IStarActorOptions> {
    public isStarActor: boolean = true;

    public onInstantiate(initOptions: IStarActorOptions) {
    }
}
```

- step2: 将这些星星加入SystemActor中，方便控制和管理。当然，如果你只需要导入静态的编组模型，不需要在后续中动态更新它们的属性，那么你可能不需要加入``SystemActor``进行控制和管理。首先在``SystemActor``中添加``stars``数组变量和``addStarActor``方法。注意资源的获取和释放！

```
/* SystemActor.ts */
import StarActor from './StarActor';

@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    // emit some source code here...

    private stars: StarActor[] = [];

    public destroy() {
        this.stars = [];
    }

    public addStarActor(star: StarActor) {
        this.stars.push(star);
    }
}
```

- step3：在``StarActor``类的``onInstantiate``方法中将这些星星一个个添加到``SystemActor``的``stars``数组中

```
/* StarActor.ts */
@Sein.SClass({className: 'StarActor'})
export default class StarActor extends Sein.StaticMeshActor<IStarActorOptions> {
    public isStarActor: boolean = true;

    public onInstantiate(initOptions: IStarActorOptions) {
        Sein.findActorByClass(this.getGame(), SystemActor).addStarActor(this);
    }
}
```

- step4：我们希望星星的初始位置处于不同的位置，在此处给``StarActor``引入两个变量——``r``和``alpha``。其中``r``为星星距离地球球心的半径，``alpha``为星星位置和地球求新连线与世界坐标x轴正向的夹角，即相位。有了这两个变量，我们可以通过简单的数学计算得到每个星星相对于地球球心的位置偏移量为（r * cos(alpha), r * sin(alpha), 0），在加上地球球心的位置向量(0, -1.2, -2.1)，就得到星星的初始位置。对于每个星星，用随机函数赋予一个不同的半径和初始相位就得到位于不同位置的星星了

```
/* StarActor.ts */
@Sein.SClass({className: 'StarActor'})
export default class StarActor extends Sein.StaticMeshActor<IStarActorOptions> {
    public isStarActor: boolean = true;

    private r: number;
    private alpha: number;

    public onInstantiate(initOptions: IStarActorOptions) {
        // 随机设定星星的轨道半径和初相位
        this.r = 1.2 + Math.random() * 1.2;
        this.alpha = Math.random() * 6.18;

        this.transform.setPosition(-this.r * Math.cos(this.alpha), -1.2 + this.r * Math.sin(this.alpha), -2.1);
        
        Sein.findActorByClass(this.getGame(), SystemActor).addStarActor(this);
    }
}
```

- step5：通过``SystemActor``控制星星绕行地球公转。这里，我们简单的通过更新星星的相位，即``alpha``，并通过上一步计算位置的方法计算每一帧更新后的星星位置，得到星星绕行地球公转的效果

```
/* StarActor.ts */
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

        Sein.findActorByClass(this.getGame(), SystemActor).addStarActor(this);
    }

    public setRotationSpeed(rotationSpeed: number) {
        this.rotationSpeed = rotationSpeed;
    }

    public rotateWithEarth() {
        this.alpha += this.rotationSpeed;
        this.transform.setPosition(-this.r * Math.cos(this.alpha), -1.2 + this.r * Math.sin(this.alpha), -2.1);
    }
}
```


```
/* SystemActor.ts */
@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    public isSystemActor: boolean = true;

    public earth: EarthActor = null;
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
            });
        }
    }
}
```

- step6：控制星星的扰动漂浮，假使星星在其公转轨迹上随着时间有一定的上下浮动，但是总体不大幅度偏离轨迹。这里简单地通过计算游戏开始进行的时间，并控制其位置随之有一个三角函数关系的偏移量即可。在``SystemActor``的``onUpdate``方法中又一个变量``delta``，它记录了每两帧之间绘制的时间间隔，累加得到游戏开始进行的时间

```
/* SystemActor.ts */
@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    public isSystemActor: boolean = true;

    public earth: EarthActor = null;
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
            });
        }
    }
}
```

```
/* StarActor.ts */
@Sein.SClass({className: 'StarActor'})
export default class StarActor extends Sein.StaticMeshActor<IStarActorOptions> {
    // emit some source code here...

    public floating(delta: number) {
        this.transform.position.y += 0.2 * Math.sin(delta);
    }
}
```

- step7：增加星星的自转，此处用三角函数引入一个随游戏进行时间变化的旋转偏量

```
/* SystemActor.ts */
@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    public isSystemActor: boolean = true;

    public earth: EarthActor = null;
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
                star.rotateWithEarth();  // 公转
                star.floating(this.time);  // 扰动漂浮
                star.rotateWithSelf(this.time * 2);  // 自转
            });
        }
    }
}
```

```
/* StarActor.ts */
@Sein.SClass({className: 'StarActor'})
export default class StarActor extends Sein.StaticMeshActor<IStarActorOptions> {
    // emit some source code here...
    public rotateWithSelf(delta: number) {
        this.transform.rotationY = Math.sin(delta);
    }
}
```

- step8：设置星星的行为完成，最后别忘记在``src/game/index.ts``中``import``

```
/* index.ts */
import './components/actors/StarActor';
```

这样星星就能处于不同的初始位置，并具有公转、自转和扰动漂浮的行为了。

## 潜在的踩坑点

* SceneActor和StaticMeshActor的继承关系与区别

## 章节成果展示

![fruit-show-4-0](./img/chapter4-3.gif)

## 章节代码参考

// TODO
// MainLevelScript.ts
// SystemActor.ts
// StarActor.ts
// src/index.ts