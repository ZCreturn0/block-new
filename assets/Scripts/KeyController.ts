import { 
    _decorator, 
    Component, 
    director,
    input, 
    Input, 
    EventKeyboard
} from 'cc';
const { ccclass } = _decorator;

import { isPlayerMoveKey, isShootCornerChangeKey, isSpace } from './Type';

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
        if (isPlayerMoveKey(keyCode)) {
            director.emit('player-move-change', keyCode);
        }
        if (isShootCornerChangeKey(keyCode)) {
            director.emit('shoot-corner-change', keyCode);
        }
        if (isSpace(keyCode)) {
            director.emit('shooting-press', keyCode);
        }
    }

    onKeyUp(event: EventKeyboard) {
        const { keyCode } = event;
        this.pressingDirectionKey = this.pressingDirectionKey.filter((item) => item !== keyCode);
        if (this.pressingDirectionKey.length) {
            director.emit('last-key-update', this.pressingDirectionKey.slice(-1)[0]);
        } else {
            director.emit('last-key-update', 0);
        }
        // 松开的是方向键
        if (isPlayerMoveKey(keyCode)) {
            // 取最后一个方向键
            const lastMoveKey = this.pressingDirectionKey.reverse().find((item) => isPlayerMoveKey(item));
            if (lastMoveKey) {
                director.emit('player-move-change', lastMoveKey);
            } else {
                director.emit('player-move-change', 0);
            }
        }
        // 松开的是调节角度键
        if (isShootCornerChangeKey(keyCode)) {
            // 取最后一个方向键
            const lastChangeCornerKey = this.pressingDirectionKey.reverse().find((item) => isShootCornerChangeKey(item));
            if (lastChangeCornerKey) {
                director.emit('shoot-corner-change', lastChangeCornerKey);
            } else {
                director.emit('shoot-corner-change', 0);
            }
        }
    }

    update(deltaTime: number) {
        
    }
}

