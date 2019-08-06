import * as Sein from 'seinjs';

import * as React from 'react';

import './ui.scss';
import GameState from '../states/GameState';
import {GlobalEvent} from '../GlobalEvent';

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