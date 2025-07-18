import { 
    _decorator, 
    Component, 
    Node, 
    director,
    Collider2D,
    BoxCollider2D,
    CircleCollider2D,
    PhysicsSystem2D, 
    Contact2DType 
} from 'cc';
const { ccclass, property } = _decorator;

import { blockType } from './Type';

@ccclass('GameController')
export class GameController extends Component {

    // 左墙
    private leftWall: Node | null = null;
    // 右墙
    private rightWall: Node | null = null;
    // 当前关
    private level: number = 1;
    // 关卡数
    private levelNum: number = 2;

    protected onLoad(): void {
        
    }

    start() {
        this.leftWall = this.node.parent.getChildByName('Wall').getChildByName('LeftWall');
        this.rightWall = this.node.parent.getChildByName('Wall').getChildByName('RightWall');

        // 注册全局碰撞回调函数
        if (PhysicsSystem2D.instance) {
            PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        director.emit('load-level', this.level);
        director.emit('level-clear', this.onLevelClear.bind(this));
    }

    onLevelClear() {
        if (this.level < this.levelNum) {
            this.level++;
            director.emit('load-level', this.level);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D) {
        // 球和墙壁碰撞
        if (otherCollider instanceof CircleCollider2D && selfCollider instanceof BoxCollider2D && otherCollider.node.name === 'MainBall' && ['LeftWall', 'TopWall', 'RightWall'].includes(selfCollider.node.name)) {
            director.emit('ball-wall-contacting', {
                tag: selfCollider.tag,
                name: otherCollider.node.name
            });
        }
        // 玩家和墙壁碰撞
        else if (otherCollider instanceof BoxCollider2D && selfCollider instanceof BoxCollider2D && ['LeftWall', 'TopWall', 'RightWall'].includes(otherCollider.node.name) && selfCollider.node.name === 'Player') {
            director.emit('contact-wall', otherCollider.node.name);
        }
        // 球和砖块碰撞
        else if (blockType.includes(selfCollider.name) && otherCollider instanceof CircleCollider2D && otherCollider.node.name === 'MainBall') {
            director.emit('ball-block-contacting', {
                node: selfCollider.node,
                ballName: otherCollider.node.name
            });
        }
        // 球和玩家碰撞
        else if (otherCollider instanceof CircleCollider2D && selfCollider instanceof BoxCollider2D && otherCollider.node.name === 'MainBall' && selfCollider.node.name === 'Player') {
            director.emit('ball-player-contacting', {
                name: otherCollider.node.name,
                ballPos: otherCollider.node.position,
                radius: otherCollider.radius,
                playerPos: selfCollider.node.position,
                playerSize: {
                    width: (selfCollider.node as any).width,
                    height: (selfCollider.node as any).height,
                }
            });
        }
    }

    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D) {
        if (otherCollider instanceof BoxCollider2D && selfCollider instanceof BoxCollider2D && ['LeftWall', 'TopWall', 'RightWall'].includes(otherCollider.node.name) && selfCollider.node.name === 'Player') {
            director.emit('leave-wall', otherCollider.node.name);
        }
    }

    update(deltaTime: number) {
        
    }
}

