import { _decorator, Component, Node, director, Vec3, log } from 'cc';
const { ccclass, property } = _decorator;
import type { PLAYER_MOVE_KEY } from './Type';
import { DIRECTION_KEY, isPlayerMoveKey } from './Type';

@ccclass('PlayerController')
export class PlayerController extends Component {
    // 玩家运动方向键
    private direction: PLAYER_MOVE_KEY | 0 = 0;
    // 移动速度
    private speed: number = 10;
    // 当前主角位置
    private curPos: Vec3 = new Vec3();
    // 玩家正在接触的墙
    private cantactingWall: 'LeftWall' | 'TopWall' | 'RightWall' | null = null;

    start() {
        director.on('player-move-change', (keyCode: PLAYER_MOVE_KEY) => {
            this.direction = keyCode;
            if (!isPlayerMoveKey(keyCode)) {
                director.emit('player-move', {
                    direction: 0,
                    speed: 0
                });
            }
        });
        director.on('contact-wall', (wall: 'LeftWall' | 'TopWall' | 'RightWall') => {
            this.cantactingWall = wall;
        });
        director.on('leave-wall', () => {
            this.cantactingWall = null;
        });
        this.curPos = this.node.position;
    }

    move() {
        // 左移
        if (this.direction === DIRECTION_KEY.a || this.direction === DIRECTION_KEY.left) {
            if (this.cantactingWall === 'LeftWall') {
                return;
            }
            const addPos = new Vec3(-1 * this.speed, 0, 0);
            Vec3.add(this.curPos, this.curPos, addPos);
            this.node.setPosition(this.curPos);
            director.emit('player-move', {
                direction: this.direction,
                speed: this.speed
            });
        } 
        // 右移
        else if (this.direction === DIRECTION_KEY.d || this.direction === DIRECTION_KEY.right) {
            if (this.cantactingWall === 'RightWall') {
                return;
            }
            const addPos = new Vec3(1 * this.speed, 0, 0);
            Vec3.add(this.curPos, this.curPos, addPos);
            this.node.setPosition(this.curPos);
            director.emit('player-move', {
                direction: this.direction,
                speed: this.speed
            });
        }
    }

    update(deltaTime: number) {
        if (this.direction) {
            this.move();
        }
    }
}

