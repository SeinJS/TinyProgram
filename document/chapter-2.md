# Chapter-2：用Actor控制动态模型

在上一章的内容中，我们已经成功将模型加载并显示了，但直接导入加载并实例化的方法比较适合场景中的一些静态模型。举个例子，若是你希望开发一个密室逃脱的3D游戏，你可以将你的房间静态模型按照上述方式加载并显示。在本章节中，我希望能够调整这个低多边形风格地球模型在世界坐标的坐标位置，并且能够让其匀角速度绕轴旋转。

## Sein Node Script

让我们回到unity中。如果你有心的话，也许能够发现，在unity中利用SeinJS插件导出glTF时，原本的``prefab``或者是``GameObject``上挂载了一个``SeinNode``脚本。这个脚本就表征了这个“模型”具有场景中的节点属性，是``game``中的一个``Node``。整个游戏是一个树状的结构，每一个模型都是其中的一个节点，同时，每一个节点和其下的Component也是一个树状节点的结构关系。

在这里，我们赋予它的``Class Name``为``EarthActor``。
![sein node className](./img/chapter2-0.png)

这时，再运行，你会发现模型无法显示，并且浏览器的控制台给你一个``Error``。这个error告诉我们需要定义装饰器类。
![className decorator error](./img/chapter2-1.png)

## 使用Actor加载显示模型

由于我们希望这个模型拥有一些属性或者行为，所以我们用``Actor``来控制管理它。对于``Actor``，我们将相关脚本文件放在``src/game/components/actors``文件夹下。

- step1：创建``EarthActor.ts``。由于这个模型是需要显示几何和纹理材质信息的模型，我们需要在``StaticMeshActor``类的基础上扩展为``EarthActor``类

- step2：``StaticMeshActor``类的基本模板如下，如果你需要创建不同``className``的``Actor``，注意需要修改其中的类名和装饰器的类名。其中的``onInstantiate``方法会在资源实例化的时候被调用。
```
/* EarthActor.ts */
import * as Sein from 'seinjs';

export interface IEarthActorOptions extends Sein.IStaticMeshComponentState {

}

export function isEarthActor(value: Sein.SObject): value is EarthActor {
  return (value as EarthActor).isEarthActor;
}

@Sein.SClass({className: 'EarthActor'})
export default class EarthActor extends Sein.StaticMeshActor<IEarthActorOptions> {
    public isEarthActor: boolean = true;

    public onInstantiate(initOptions: IEarthActorOptions) {

    }
}
```

- step3：在``src/game/index.ts``，即在游戏的入口中，引入这个装饰器类

```
/* index.ts */
import './components/actors/EarthActor';
```

这样你的模型就能够再次正常加载显示了。

![fruit-show-2-0](./img/chapter1-6.png)

## 为Actor添加属性和行为

使用Actor类来控制管理后，你可以为其添加一定的属性并控制它的一些行为。在这里，我们将把低多边形风格的地球模型移动至合适的世界坐标系位置并让它绕着它的自转轴旋转。

首先，我们通过在浏览器的控制台输出Actor，观察它具备哪些属性。

```
/* EarthActor.ts */
@Sein.SClass({className: 'EarthActor'})
export default class EarthActor extends Sein.StaticMeshActor<IEarthActorOptions> {
    public isEarthActor: boolean = true;

    public onInstantiate(initOptions: IEarthActorOptions) {
      console.log(this);  // 浏览器控制台输出
    }
}
```

我们可以使用Actor的transform属性来改变它在世界坐标系中的位置，并控制它的绕轴旋转。

![console-output](./img/chapter2-2.png)

我们通过``setPosition``方法，改变它在世界坐标系中的位置。这里，我们希望它从原来的(0, 0, 0)位置移动到(0, -1.2, -2.1)位置，让它离相机观察点的距离更近，并处于偏下的位置，把上方的空间留给星星和飞船。

```
/* EarthActor.ts */
@Sein.SClass({className: 'EarthActor'})
export default class EarthActor extends Sein.StaticMeshActor<IEarthActorOptions> {
    public isEarthActor: boolean = true;

    public onInstantiate(initOptions: IEarthActorOptions) {
      // console.log(this);  // 浏览器控制台输出
      this.transform.setPosition(0, -1.2, -2.1);
    }
}
```

![earth-setPosition](./img/chapter2-3.png)

重写``Actor``类的``onUpdate``方法，让其``tranform``中的``rotation``属性在每帧重绘时改变，就能产生地球绕轴运动的行为。在这里，模拟的是观察者位于地球的北极点方向，沿着地球的自转轴看向南极点的视角，所以，逐帧减少``transform``的``rotationZ``值即可。

```
/* EarthActor.ts */
@Sein.SClass({className: 'EarthActor'})
export default class EarthActor extends Sein.StaticMeshActor<IEarthActorOptions> {
    public isEarthActor: boolean = true;
    private rotationSpeed: number = 0.01;

    public onInstantiate(initOptions: IEarthActorOptions) {
      this.transform.setPosition(0, -1.2, -2.1);
    }

    public onUpdate() {
      this.transform.rotationZ -= this.rotationSpeed;
    }
}
```

## 潜在的踩坑点

* SceneActor和StaticMeshActor的继承关系与区别：每一个能够添加到我们的游戏世界中的，都必须为``SceneActor``，但是``SceneActor``一般是具有``transform``属性的``Actor``，而``StaticMeshActor``是具有``geometry``属性。如果你发现你加载模型成功，控制台也没有给予你错误信息时，你可以回看一下你``Actor``扩写的类是什么。

* 注意关注设置``transform``中``rotation``相关属性时，角度制单位和弧度制单位的区别

## 章节成果展示

![earth-setPosition](./img/chapter2-4.gif)

## 章节代码参考

// TODO
// EarthActor.ts