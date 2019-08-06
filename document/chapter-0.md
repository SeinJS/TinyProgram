# Chapter-0：新建项目和初始化

## 新建项目

使用``sein new``命令新建项目，使用你喜欢的IDE打开这个新建的项目。对于新建的项目，使用``npm install``命令安装相关依赖。安装相关依赖成功后，使用``npm run dev``让你的项目跑起来，打开浏览器，在``localhost``的``8888``端口能够看到蓝色背景下的miku和位于两旁的红蓝立方体。

到此处，恭喜你，新建项目成功。

## 项目基本文件目录结构

项目中的主要文件目录树结构如下，从文件目录树结构认识你的游戏或者项目的相关脚本和资源应该放置在哪些合适的位置。

```
project
│   readme.md
│   index.html
│
└───node_modules
│
└───unity
│
└───src
    │   index.tsx
    │   base.scss
    └───assets
    │   │
    │   └───gltfs
    │
    └───game
        │   index.ts
        └───components
        └───scripts
        │       MainGameMode.ts
        │       MainLevelScript.ts
        └───state
                GameState.ts

```
在项目文件的根目录下，``node_modules``主要是安装的相关依赖，这里我们可以先简单略过，主要的文件目录是``unity``和``src``。

在``unity``文件夹中有一个初始化的unity工程，在这个工程中，你可以导入你的美术模型资源，进行初步调整，并导出为glTF格式，方便项目加载模型资源。在``unity``中含有``SeinJSUnityToolkit.unitypackage``插件，记得在调整你的美术资源时倒入unity。

在``src``文件夹中主要是你的代码资源和导出的模型和其他美术资源等。其中，在``src``的子文件夹``game``中主要存放的是你的脚本代码文件，而在子文件夹``assets``中存放模型资源和其他美术资源。

**美术资源管理**

你可以把从unity中导出的glTF文件存放在``assets``目录下的``gltfs``文件夹中，当然，你的其他美术资源可以在``assets``下创建其他子文件夹进行管理。

**脚本代码资源管理**

你的游戏中涉及的主要脚本代码存放在``game``文件夹中。``index.ts``为游戏的主入口。

``script``中的``MainGameMode.ts``主要编写了整个游戏世界（world）的逻辑，而``MainLevelScript.ts``中主要编写了游戏世界主关卡或者说是默认关卡的展示逻辑。

    e.g. 新建的miku项目的``MainLevelScript.ts``中完成了加载glTF模型资源，创建相机，创建灯光和显示模型等逻辑。

``state``中的``GameState.ts``主要编写管理游戏状态的逻辑，这里的逻辑可以是游戏中人物（Actor）的状态，也可以是整个游戏系统（System）的状态。

    e.g. 新建的miku项目的``GameState.ts``中控制立方体的浮动系数。

``component``中用于管理游戏中的组件脚本，这些组件脚本可以赋予游戏中的人物（Actor）一定的属性。了解unity开发游戏的开发者会发现这种模式和unity的脚本功能十分相似——你希望一个``GameObject``拥有怎样的属性，就写一个脚本，挂载在这个``GameObject``上。
    
    e.g. 在新建的miku项目中的``FloatingComponent.ts``赋予了立方体上下浮动的属性。

## 初始化项目

由于新建的项目已经有了一个模版化的工程，在这里，你只需要做一些简单的工作来初始化你的工程就可以进行之后的游戏开发了。

- step 1：删除``assets/gltfs``下的模型资源，之后你会把你的游戏需要的glTF资源存放在这里

- step 2: 删除``src/game/component/FloatingCompoent.ts``，之后你会在这里创建你游戏中的Actor和其它相关component

- step 3：整理``src/game/scripts/MainLevelScript.ts``的主逻辑，清理加载miku资源和创建立方体的部分

- step 4: 整理``src/game/state/GameState.ts``的逻辑，清理控制``Floating state``的部分

    ```
    /* 整理后的 GameState.ts */
    import * as Sein from 'seinjs';

    export default class GameState extends Sein.StateActor {
    }
    ```

- step 5: 整理``src/game/scripts/MainGameMode.ts``的逻辑，清理控制``Floating``的部分

    ```
    /* 整理后的 MainGameMode.ts */
    import * as Sein from 'seinjs';

    export default class MainGameMode extends Sein.GameModeActor {
        private delta: number;

        public onError(error: Error) {
            console.log(error);

            return true;
        }

        public onAdd() {
            this.delta = 0;
        }

        public onUpdate(delta: number) {
            this.delta += delta;

            if (this.delta > 2000) {
                this.delta = 0;
            }
        }
    }   
    ```

- step 6：整理``src/index.ts``，修改``clearColor``值为你希望的颜色。在这里，我用一种饱和度较低的深紫色（R:65/G:47/B:101）作为``clearColor``,同时也充当游戏的整体背景色

    ```
    /* 整理后的 index.ts */
    import * as Sein from 'seinjs';

    import GameState from './states/GameState';
    import MainGameMode from './scripts/MainGameMode';
    import MainLevelScript from './scripts/MainLevelScript';

    export async function main(canvas: HTMLCanvasElement): Promise<Sein.Game> {
    const engine = new Sein.Engine();

    const game = new Sein.Game(
        'intro-game',
        {
        canvas,
        clearColor: new Sein.Color(0.254, 0.183, 0.394, 1),
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
        antialias: true
        },
        GameState
    );

    engine.addGame(game);

    game.addWorld('main', MainGameMode, MainLevelScript);

    await game.start();

    return game;
    }
    ```

## 章节成果展示

![fruit-show-0-0](./img/chapter0-0.png)

## 章节代码参考

// TODO
// MainLevelScript.ts
// MainGameMode.ts
// GameState.ts
// src/index.ts