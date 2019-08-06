# Chapter-8：UI

游戏中的一些分数统计和成就解算缺少不了精美的UI，在这里，简单制作一个统计已经收集到几颗星的UI界面，并放置在屏幕的左上角。在这里的UI只是简单地书写DOM，获取游戏中的状态数值，即``starNum``进行显示，方便大家了解整个游戏数据的传递和整体架构。如果你需要对游戏中某些角色绑定相应的UI，你可能会需要使用基于DOM的HUD，但是，两者都建立在对游戏中数据传递和整体架构的理解上。

## 显示UI

首先，我们先使用静态数据，让UI能够显示在屏幕上。在这里，先不急于同步你的游戏数据或者状态，仅仅先满足UI的视觉表现效果。

- step1：合理管理你的UI。在``src/game``路径下创建``ui``文件夹，在内部创建``ui.tsx``和``ui.scss``。你可以将你的UI逻辑和渲染写在``ui.tsx``中，将UI的样式写在``ui.scss``中。

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
    │   └───img
    │
    └───game
        │   index.ts
        └───components
        └───scripts
        │       MainGameMode.ts
        │       MainLevelScript.ts
        └───state
        │       GameState.ts
        └───ui
                ui.tsx
                ui.scss
```

- step2：编写React组件，设计你的UI。这里，采用一个简单的``<div></div>``来显示目前已经收集的星星数量。如果你熟悉并能熟练使用React的话，一定比我更擅长做下面的一些事情。

```
/* ui.tsx */
import * as React from 'react';

import './ui.scss';

export interface IPropTypes {
}

export interface IStateTypes {
}

export default class UI extends React.Component<IPropTypes, IStateTypes> {
    public componentWillMount() {
    }

    public componentDidMount() {
    }

    public componentWillUnmount() {
    }

    public render() {
        return(
            <div className={'star-number'}>Stars : 0</div>
        );
    }
}
```

```
/* ui.scss */
.star-number {
    color: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
    position: fixed;
    left: 10%;
    top: 5%;
    border-radius: 10px;
    border: 2px solid;
    padding: 3% 5%;
}
```

- step3：在根目录下的``index.ts``中渲染你所写的UI组件。

```
/* index.ts */
import UI from './game/ui/ui';

class Game extends React.Component<IPropTypes, IStateTypes> {
    // emit some source code here...
    public render() {
        return (
            <div>
                <canvas className={'game'} ref={this.canvas}/>
                <UI />
            </div>
        );
    }
}
```

走到这里，你的UI就能显示在你的游戏界面中了，只不过，其中星星的数量并不会随着你的收集而增多。

![fruit-show-8-0](./img/chapter8-0.png)

## 同步更新数据

接下来，我们需要让UI中星星的数量与你已经收集到的星星数量同步起来。这里，收集的星星数量存储在``GameState.ts``中，我们需要利用React组件的``prop``将``game``的数据或者说是状态传递过去，并获取其中的``starNum``。这样的数据更新发生在每次收集到星星事件之后。

- step1：``props``和``state``。在``Game``类中，将整个game作为``props``传递给``UI``类，并且``UI``类中设置``starNum``为``state``。同样的，熟悉React的你，一定比我更加擅长做下面的一些的工作，并且能够更加优雅地处理这些问题。

```
/* index.ts */
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Sein from 'seinjs';

import {main} from './game';
import './base.scss';

import UI from './game/ui/ui';

export interface IPropTypes {
}

export interface IStateTypes {
}

class Game extends React.Component<IPropTypes, IStateTypes> {
  private canvas: React.RefObject<HTMLCanvasElement> = React.createRef();
  private game: Sein.Game;

  public async componentDidMount() {
    this.game = await main(this.canvas.current);
    this.forceUpdate();
  }

  public componentWillUnmount() {
    this.game.destroy();
  }

  public render() {
    return (
      <div>
        <canvas className={'game'} ref={this.canvas}/>
        {this.game && <UI game={this.game}/>}
      </div>
    );
  }
}
```

```
/* ui.tsx */
import * as Sein from 'seinjs';

import * as React from 'react';

import './ui.scss';
import GameState from '../states/GameState';

export interface IPropTypes {
    game: Sein.Game;
}

export interface IStateTypes {
    starNum: number;
}

export default class UI extends React.Component<IPropTypes, IStateTypes> {
    public componentWillMount() {
        this.setState({starNum: 0});
    }

    public componentDidMount() {
        const {game} = this.props.game;
        this.setState({starNum: Sein.findActorByClass(this.props.game, GameState).starNum});
    }

    public componentWillUnmount() {
    }

    public render() {
        return(
            <div className={'star-number'}>Stars : {this.state.starNum}</div>
        );
    }
}
```

- step2：完成以上工作，并不能让数据在你收集到新的星星的时候更新。我们需要创建一个全局的变量来监听获得捕获星星这个事件，在``src/game``目录下新建``GlobalEvent.ts``，定义枚举事件变量。

```
/* GlobalEvent.ts */
export enum GlobalEvent {
    GetStar = 'GetStar'
}
```

- step3：为游戏注册``GetStar``事件，注意请在游戏的主入口处注册，在``MainLevelScript``中注册会导致多次注册，不过你也可以在结束后取消注册来解决这个问题。

```
/* src/game/index.ts */
import { GlobalEvent } from './GlobalEvent';

export async function main(canvas: HTMLCanvasElement): Promise<Sein.Game> {
    // emit some source code here...
    game.event.register(GlobalEvent.GetStar);
}
```

- step4：在捕获星星时触发``GetStar``事件

```
/* StarActor.ts */
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
        // emit some source code here...
    }
}
```

- step5：添加``GetStar``事件监听器，并及时更新状态

```
/* ui.tsx */
// emit some source code here...
export default class UI extends React.Component<IPropTypes, IStateTypes> {
    public componentWillMount() {
        this.setState({starNum: 0});
    }

    public componentDidMount() {
        const {game} = this.props.game;
        game.event.add(GlobalEvent.GetStar, () => {
            this.setState({starNum: Sein.findActorByClass(this.props.game, GameState).starNum})}
        );
    }

    public componentWillUnmount() {
    }

    public render() {
        return(
            <div className={'star-number'}>Stars : {this.state.starNum}</div>
        );
    }
}
```

这样，你收集的星星数量就能同步显示在你的UI中了。

走到这里，这个十分简单的小游戏的主体逻辑就基本完成了。当然，作为一个游戏，或者你日后在使用Sein.js引擎开发游戏的时候，需要大大提高游戏的完整性，比如加入游戏开始和游戏解算，增加游戏的关卡甚至是世界，丰富游戏的玩法和复杂度。其实，Sein.js提供更多复杂完善的功能模块等待你去探索，那么请移步至官网的后续内容吧。

教程走到这里，笔者只是作为一个小白的角度来抛砖引玉，希望大家能够继续探索和使用Sein.js！

![sein-js-logo](./img/logo.png)

## 潜在的踩坑点


## 章节成果展示

![fruit-show-8-1](./img/chapter8-1.gif)

## 章节代码参考

// TODO
// StarActor.ts
// src/game/index.ts
// index.tsx
// GlobalEvent.ts
// ui.tsx
// ui/scss