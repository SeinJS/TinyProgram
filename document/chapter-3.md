# Chapter-3：用SystemActor管理游戏系统

在之前的文件结构的介绍中，我们提到过，对于游戏中的状态的管理，可以在``src/game/states``下创建``StateActor``进行管理，并且事实上，现在确实存在一个``StateActor``，你甚至可以直接在其中添加你需要的部分来管理你游戏中的各种状态。

    e.g. 在一开始新建的miku工程下，其中一个立方体拥有Floating这个Component，并在GameState中管理Floating Component中的Floating Factor。

在这里，由于之后会引入更多的Actor，我这里采用创建一个SystemActor来管理整个游戏系统。当然，你也可以为不同的Actor创建多个StateActor进行管理，比如对于FPS类游戏，你的Player需要有一个Player State Actor来管理它。

## 创建SystemActor

``SystemActor``继承自``Sein.InfoActor``，我们将相关脚本文件放在``src/game/components/actors``文件夹下。

- step1：创建``SystemActor``，我们在``InfoActor``的基础上扩写为``SystemActor``类

- step2：``InfoActor``类的基本模板如下，其生命周期主要分为初始化（``start``）、不断更新的生存期（``onUpdate``）和销毁（``destroy``）。

```
/* SystemActor.ts */
import * as Sein from 'seinjs';

import EarthActor from './EarthActor';

export interface ISystemActorOptions {

}

export function isSystemActor(value: Sein.SObject): value is SystemActor {
  return (value as SystemActor).isSystemActor;
}

@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    public isSystemActor: boolean = true;

    public start() {

    }

    public onUpdate(delta: number) {

    }

    public destroy() {

    }
}
```

- step3：在``MainLevelScript``中为``game``添加这个``SystemActor``，并在``MainLevelScript``的``onCreate``方法显式调用``SystemActor``的``start``方法。

```
import SystemActor from '../components/actors/SystemActor';

export default class MainLevelScript extends Sein.LevelScriptActor {
  private system: SystemActor;

  public onAdd() {
    this.system = this.getGame().addActor('system', SystemActor);
  }

  public onCreate() {
      // emit some source code here...

      this.system.start();
  }
}
```

- step3：在``src/game/index.ts``，即在游戏的入口中，引入这个装饰器类

```
import './components/actors/SystemActor';
```

## 使用SystemActor管理Actor

接下来，我们使用新创建的``SystemActor``来管理我们的``EarthActor``,让其进行旋转。

- step1：清除``EarthActor``中``onUpdate``方法的内容，并写一个``public``的``rotateWithAxis``方法来更新地球的``transform.rotationZ``属性。

```
/* EarthActor.ts */
@Sein.SClass({className: 'EarthActor'})
export default class EarthActor extends Sein.StaticMeshActor<IEarthActorOptions> {
    public isEarthActor: boolean = true;
    private rotationSpeed: number = 0.01;

    public onInstantiate(initOptions: IEarthActorOptions) {
      this.transform.setPosition(0, -1.2, -2.1);
    }

    public rotateWithAxis() {
      this.transform.rotationZ -= this.rotationSpeed;
    }
}
```

- step2：引入``earth: EarthActor``为``SystemActor``的一个成员，并在``SystemActor``中写一个``public``的``setEarthActor``方法进行绑定，并且不要忘记在``SystemActor``的``destory``方法中销毁它，释放资源。

```
/* SystemActor.ts */
import EarthActor from './EarthActor';

// emit some source code here...

@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    public isSystemActor: boolean = true;

    public earth: EarthActor = null;

    public start() {

    }

    public onUpdate(delta: number) {

    }

    public destroy() {
        this.earth = null;
    }

    public setEarthActor(earth: EarthActor) {
        this.earth = earth;
    }
}
```

- step3：将地球通过``SystemActor``的``setEarthActor``方法绑定到``earth``成员变量上，方便我们在``SystemActor``中控制地球的绕轴自转行为

```
/* EarthActor.ts */
@Sein.SClass({className: 'EarthActor'})
export default class EarthActor extends Sein.StaticMeshActor<IEarthActorOptions> {
    public isEarthActor: boolean = true;
    private rotationSpeed: number = 0.01;

    public onInstantiate(initOptions: IEarthActorOptions) {
      this.transform.setPosition(0, -1.2, -2.1);
      Sein.findActorByClass(this.getGame(), SystemActor).setEarthActor(this);  // 绑定到SystemActor的earth成员变量
    }

    // emit some source code here...
}
```

- step4：在``SystemActor``的``onUpdate``方法中调用``EarthActor``的``rotateWithAxis``方法让其绕轴自转

```
/* SystemActor.ts */
@Sein.SClass({className: 'SystemActor'})
export default class SystemActor extends Sein.InfoActor<ISystemActorOptions> {
    // emit some source code here...

    public onUpdate(delta: number) {
        if(this.earth) {
            this.earth.rotateWithAxis();
    }

    // emit some source code here...
}
```

## 潜在的踩坑点

* 注意在``src/game/index.ts``，即``game``的入口处，``import``相应的模块

## 章节成果展示

![systemActor-control](./img/chapter2-4.gif)

## 章节代码参考

// TODO
// src/index.ts
// MainLevelScript.ts
// SystemActor.ts
// EarthActor.ts