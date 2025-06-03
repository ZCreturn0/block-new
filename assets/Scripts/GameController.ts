import { 
    _decorator, 
    Component, 
    Node, 
    director,
    Collider2D,
    BoxCollider2D,
    PhysicsSystem2D, 
    Contact2DType 
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    // 左墙
    private leftWall: Node | null = null;
    // 右墙
    private rightWall: Node | null = null;

    start() {
        this.leftWall = this.node.parent.getChildByName('Wall').getChildByName('LeftWall');
        this.rightWall = this.node.parent.getChildByName('Wall').getChildByName('RightWall');

        // 注册全局碰撞回调函数
        if (PhysicsSystem2D.instance) {
            PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D) {
        // 玩家和墙壁碰撞
        if (otherCollider instanceof BoxCollider2D && selfCollider instanceof BoxCollider2D && ['LeftWall', 'TopWall', 'RightWall'].includes(otherCollider.node.name) && selfCollider.node.name === 'PlayerBody') {
            director.emit('contact-wall', otherCollider.node.name);
        }
        // // 球和砖块碰撞
        // if (this.blockType.includes(selfCollider.name) && otherCollider instanceof CircleCollider2D) {
        //     // 球做反射，并通知 BlockManager 处理砖块
        //     // 1. 球反弹，只有镜面反射
        //     const target = this.balls.find(ball => ball.node.name === otherCollider.node.name);
        //     // 球每个角度的碰撞都要判断两个面
        //     // 砖块坐标信息
        //     const blockPos = selfCollider.worldAABB;
        //     // 球坐标信息
        //     const ballPos = otherCollider.worldPosition;
        //     // 球半径
        //     const ballRadius = otherCollider.radius;
        //     // 半径投影长度
        //     const radiusCos = Math.abs(Math.cos(45) * ballRadius);
        //     // 往右上运动
        //     if (target.direction>= 0 && target.direction <= 90) {
        //         // 判断下左面
        //         // 左侧
        //         if (ballPos.x + ballRadius <= blockPos.xMin || 
        //             (
        //                 ballPos.x <= blockPos.xMin &&
        //                 (ballPos.y - blockPos.yMax < radiusCos || blockPos.yMin - ballPos.y < radiusCos)
        //             )) {
        //             target.direction = 90 - target.direction + 90;
        //             log('rt-l');
        //         } else {
        //             target.direction = 360 - target.direction;
        //             log('rt-d');
        //         }
        //     }
        //     // 左上
        //     else if (target.direction>= 90 && target.direction <= 180) {
        //         // 判断下右面
        //         // 右侧
        //         if (ballPos.x + ballRadius >= blockPos.xMax || 
        //             (
        //                 ballPos.x >= blockPos.xMax &&
        //                 (ballPos.y - blockPos.yMax < radiusCos || blockPos.yMin - ballPos.y < radiusCos)
        //             )) {
        //             target.direction = 90 - target.direction + 90;
        //             log('lt-r');
        //         } else {
        //             target.direction = 180 - target.direction + 180;
        //             log('lt-d');
        //         }
        //     }
        //     // 左下
        //     else if (target.direction>= 180 && target.direction <= 270) {
        //         // 判断上右面
        //         // 右侧
        //         if (ballPos.x + ballRadius >= blockPos.xMax || 
        //             (
        //                 ballPos.x >= blockPos.xMax &&
        //                 (ballPos.y - blockPos.yMax < radiusCos || blockPos.yMin - ballPos.y < radiusCos)
        //             )) {
        //             target.direction = (180 - target.direction + 360) % 360;
        //             log('ld-r');
        //         } else {
        //             target.direction = 360 - target.direction;
        //             log('ld-t');
        //         }
        //     }
        //     // 右下
        //     else if (target.direction>= 270 && target.direction <= 360) {
        //         // 判断左上面
        //         // 左侧
        //         if (ballPos.x + ballRadius <= blockPos.xMin || 
        //             (
        //                 ballPos.x <= blockPos.xMin &&
        //                 (ballPos.y - blockPos.yMax < radiusCos || blockPos.yMin - ballPos.y < radiusCos)
        //             )) {
        //             target.direction = 180 + (360 - target.direction);
        //             log('rd-l');
        //         } else {
        //             target.direction = 360 - target.direction;
        //             log('rd-t');
        //         }
        //     }
        //     // 2. 通知 BlockManager
        //     director.emit('block-contact', {
        //         block: selfCollider,
        //         ball: target
        //     });
        // }
        // // 球和玩家碰撞
        // else if (otherCollider instanceof CircleCollider2D && selfCollider instanceof BoxCollider2D && otherCollider.node.name === 'Ball' && selfCollider.node.name === 'PlayerBody') {
        //     /**
        //      * 模板反射算法
        //      * 1. 玩家静止时，镜面反射
        //      * 2. 玩家与球方向一致时，反射角变小
        //      * 3. 玩家与球方向相反时，反射角变大
        //      */
        //     const target = this.balls.find(ball => ball.node.name === otherCollider.node.name);

        //     // 玩家坐标信息
        //     const playerPos = selfCollider.worldAABB;
        //     // 球坐标信息
        //     const ballPos = otherCollider.worldPosition;
        //     // 球半径
        //     const ballRadius = otherCollider.radius;

        //     // 球往右下反弹
        //     if (target.direction >= 270 && target.direction <= 360) {
        //         // 撞到角，原路返回
        //         if (ballPos.x <= playerPos.xMin + ballRadius) {
        //             target.direction = (180 + target.direction) % 360;
        //         }
        //         // 玩家静止
        //         else if (this.playerDirection === DIRECTION_TYPE.STOP) {
        //             target.direction = 360 - target.direction;
        //         }
        //         // 玩家向右
        //         else if (this.playerDirection === DIRECTION_TYPE.RIGHT) {
        //             target.direction = 360 - target.direction - this.reduceAngle;
        //         }
        //         // 玩家向左
        //         else if (this.playerDirection === DIRECTION_TYPE.LEFT) {
        //             target.direction = 360 - target.direction + this.increaseAngle;
        //         }
        //         target.direction = (target.direction + 360) % 360;
        //         if (target.direction < this.minReflectAngle) {
        //             target.direction = this.minReflectAngle;
        //         }
        //     }
        //     // 球往左下反弹
        //     else if (target.direction >= 180 && target.direction <= 270) {
        //         // 撞到角，原路返回
        //         if (ballPos.x >= playerPos.xMax - ballRadius) {
        //             target.direction = (180 + target.direction) % 360;
        //         }
        //         // 玩家静止
        //         else if (this.playerDirection === DIRECTION_TYPE.STOP) {
        //             target.direction = 360 - target.direction;
        //         }
        //         // 玩家向右
        //         else if (this.playerDirection === DIRECTION_TYPE.RIGHT) {
        //             target.direction = 360 - target.direction - this.reduceAngle;
        //         }
        //         // 玩家向左
        //         else if (this.playerDirection === DIRECTION_TYPE.LEFT) {
        //             target.direction = 360 - target.direction + this.increaseAngle;
        //         }
        //         target.direction = (target.direction + 360) % 360;
        //         if (180 - target.direction < this.minReflectAngle) {
        //             target.direction = 180 - this.minReflectAngle;
        //         }
        //     }
        // }
        // // 球和墙壁碰撞
        // else if (otherCollider instanceof CircleCollider2D && selfCollider instanceof BoxCollider2D && otherCollider.node.name === 'Ball' && ['LeftWall', 'TopWall', 'RightWall'].includes(selfCollider.node.name)) {
        //     const target = this.balls.find(ball => ball.node.name === otherCollider.node.name);
        //     switch (selfCollider.tag) {
        //         case TAG.LEFT_WALL:
        //             target.direction = (180 - target.direction + 360) % 360;
        //             break;
        //         case TAG.TOP_WALL:
        //             target.direction = (360 - target.direction + 360) % 360;
        //             break;
        //         case TAG.RIGHT_WALL:
        //             target.direction = (180 - target.direction + 360) % 360;
        //             break;
        //     }
        // }
    }

    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D) {
        if (otherCollider instanceof BoxCollider2D && selfCollider instanceof BoxCollider2D && ['LeftWall', 'TopWall', 'RightWall'].includes(otherCollider.node.name) && selfCollider.node.name === 'PlayerBody') {
            director.emit('leave-wall', otherCollider.node.name);
        }
    }

    update(deltaTime: number) {
        
    }
}

