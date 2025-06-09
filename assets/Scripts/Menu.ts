import { _decorator, Component, Node, director, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {
    start() {
        director.preloadScene("GameScene");
    }

    onStartClick() {
        director.loadScene('GameScene');
    }

    onOptionClick() {
        
    }

    onExitClick() {
        game.end();
    }

    update(deltaTime: number) {
        
    }
}

