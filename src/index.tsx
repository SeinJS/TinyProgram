/**
 * @File   : index.tsx
 * @Author :  ()
 * @Date   : Wed Jul 31 2019
 * @Description: Component.
 */
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

ReactDom.render(<Game />, document.getElementById('container'));
