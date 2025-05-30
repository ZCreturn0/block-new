import { 
    _decorator, 
    Component, 
    director,
    input, 
    Input, 
    EventKeyboard
} from 'cc';
const { ccclass } = _decorator;

import type { PLAYER_MOVE_KEY } from './Type';

/**
 * 存储所有按下的按键，供其他 Controller 获取
 * 提供最后一个按键的 keycode
 * 提供订阅按键功能
 * 后续可扩展，返回所有正按下的 keycode
 */

@ccclass('KeyController')
export class KeyController extends Component {

    // 存储正在按住的方向键
    private pressingDirectionKey: Array<number> = [];

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        const { keyCode } = event;
        this.pressingDirectionKey.push(keyCode);

        director.emit('last-key-update', keyCode);
        // if (keyCode instanceof PLAYER_MOVE_KEY) {

        // }
    }

    onKeyUp(event: EventKeyboard) {
        const { keyCode } = event;
        this.pressingDirectionKey = this.pressingDirectionKey.filter((item) => item !== keyCode);
        if (this.pressingDirectionKey.length) {
            director.emit('last-key-update', this.pressingDirectionKey.slice(-1)[0]);
        } else {
            director.emit('last-key-update', 0);
        }
    }

    update(deltaTime: number) {
        
    }
}

