import { _decorator, Component, Node, director, Vec3, Graphics, log } from 'cc';
const { ccclass, property } = _decorator;

import type { Ball, PLAYER_MOVE_TYPE, PLAYER_DIRECTION_KEY } from './Type';
import { BALL, DIRECTION_KEY, TAG, DIRECTION_TYPE } from './Type';

@ccclass('BallController')
export class BallController extends Component {

    // 玩家运动方向
    private direction: PLAYER_DIRECTION_KEY | 0 = 0;
    // 存储所有球
    private balls: Ball[] = [];
    // 反射线数量
    private reflectLineCount: number = 50;
    // 反射线间隔
    private reflectLineInterval: number = 10;
    // 最小发射角度
    private minShootDirection: number = 10;
    // 每次增减的发射角度
    private increaseShootAngle: number = 1;
    // 按住的调角度按钮
    private pressingDirectionKey: number = 0;
    // 球初始速度
    private initSpeed: number = 300;
    // 同向减小的角度
    private reduceAngle: number = 20;
    // 反向增加的角度
    private increaseAngle: number = 20;
    // 固定反射最小角度
    private minReflectAngle: number = 10;

    start() {
        this.balls.push({
            onShoot: false,
            speed: 0,
            attack: 1,
            type: BALL.NORMAL,
            // 0 - 360度
            direction: 135,
            node: this.node.getChildByName('MainBall')
        });
        director.on('player-move', this.onPlayerMove.bind(this));
        director.on('shoot-corner-change', this.onShootCornerChange.bind(this));
        director.on('shooting-press', this.onShootingPress.bind(this));
        director.on('ball-wall-contacting', this.onBallWallContacting.bind(this));
        director.on('ball-player-contacting', this.onBallPlayerContacting.bind(this));
        director.on('ball-block-contacting', this.onBallBlockContacting.bind(this));
    }

    onPlayerMove({ direction, speed }: PLAYER_MOVE_TYPE) {
        if (direction === DIRECTION_KEY.a || direction === DIRECTION_KEY.left) {
            this.direction = DIRECTION_TYPE.LEFT;
        } else if (direction === DIRECTION_KEY.d || direction === DIRECTION_KEY.right) {
            this.direction = DIRECTION_TYPE.RIGHT;
        } else {
            this.direction = DIRECTION_TYPE.STOP;
        }
        const unshootBalls = this.balls.filter((ball) => !ball.onShoot);
        if (unshootBalls.length) {
            let k = 0;
            if (direction === DIRECTION_KEY.a || direction === DIRECTION_KEY.left) {
                k = -1;
            } else if (direction === DIRECTION_KEY.d || direction === DIRECTION_KEY.right) {
                k = 1;
            }
            unshootBalls.forEach((ball) => {
                const pos = ball.node.position;
                const addPos = new Vec3(k * speed, 0, 0);
                Vec3.add(pos, pos, addPos);
                ball.node.setPosition(pos);
            });
            this.drawAimLine();
        }
    }

    onShootCornerChange(keyCode) {
        this.pressingDirectionKey = keyCode;
    }

    onShootingPress() {
        this.balls.forEach((ball) => {
            if (!ball.onShoot) {
                ball.onShoot = true;
                ball.speed = 300;
            }
        });
    }

    onBallWallContacting({ tag, name }) {
        const target = this.balls.find(ball => ball.node.name === name);
        switch (tag) {
            case TAG.LEFT_WALL:
                target.direction = (180 - target.direction + 360) % 360;
                break;
            case TAG.TOP_WALL:
                target.direction = (360 - target.direction + 360) % 360;
                break;
            case TAG.RIGHT_WALL:
                target.direction = (180 - target.direction + 360) % 360;
                break;
        }
    }

    onBallPlayerContacting({ name, ballPos, radius, playerPos, playerSize }) {
        /**
         * 模板反射算法
         * 1. 玩家静止时，镜面反射
         * 2. 玩家与球方向一致时，反射角变小
         * 3. 玩家与球方向相反时，反射角变大
         */
        const target = this.balls.find(ball => ball.node.name === name);
        // 球半径
        const ballRadius = radius;

        // 球往右下反弹
        if (target.direction >= 270 && target.direction <= 360) {
            // 撞到角，原路返回
            if (ballPos.x <= playerPos.x - playerSize.width / 2 + ballRadius) {
                target.direction = (180 + target.direction) % 360;
            }
            // 玩家静止
            else if (this.direction === DIRECTION_TYPE.STOP) {
                target.direction = 360 - target.direction;
            }
            // 玩家向右
            else if (this.direction === DIRECTION_TYPE.RIGHT) {
                target.direction = 360 - target.direction - this.reduceAngle;
            }
            // 玩家向左
            else if (this.direction === DIRECTION_TYPE.LEFT) {
                target.direction = 360 - target.direction + this.increaseAngle;
            }
            target.direction = (target.direction + 360) % 360;
            if (target.direction < this.minReflectAngle) {
                target.direction = this.minReflectAngle;
            }
        }
        // 球往左下反弹
        else if (target.direction >= 180 && target.direction <= 270) {
            // 撞到角，原路返回
            if (ballPos.x >= playerPos.x + playerSize.width / 2 - ballRadius) {
                target.direction = (180 + target.direction) % 360;
            }
            // 玩家静止
            else if (this.direction === DIRECTION_TYPE.STOP) {
                target.direction = 360 - target.direction;
            }
            // 玩家向右
            else if (this.direction === DIRECTION_TYPE.RIGHT) {
                target.direction = 360 - target.direction - this.reduceAngle;
            }
            // 玩家向左
            else if (this.direction === DIRECTION_TYPE.LEFT) {
                target.direction = 360 - target.direction + this.increaseAngle;
            }
            target.direction = (target.direction + 360) % 360;
            if (180 - target.direction < this.minReflectAngle) {
                target.direction = 180 - this.minReflectAngle;
            }
        }
    }

    onBallBlockContacting(e) {
        const { blockPos, ballName, blockSize } = e;
        blockPos.xMin = blockPos.x - blockSize.w / 2;
        blockPos.xMax = blockPos.x + blockSize.w / 2;
        blockPos.yMin = blockPos.y - blockSize.h / 2;
        blockPos.yMax = blockPos.y + blockSize.h / 2;
        const target = this.balls.find((item) => item.node.name = ballName);
        if (target) {
            // 修改角度
            // 球半径
            const radius = (target.node as any).width / 2;
            // 半径投影长度
            const radiusCos = Math.abs(Math.cos(45) * radius);
            // 正上
            if (target.direction === 90) {
                if (target.node.x < blockPos.x) {
                    target.direction += 180;
                }
            }
            // 正右
            else if (target.direction === 0) {
                if (target.node.y < blockPos.y) {
                    target.direction += 180;
                }
            }
            // 正下
            else if (target.direction === 270) {
                if (target.node.x > blockPos.x) {
                    target.direction -= 180;
                }
            }
            // 正左
            else if (target.direction === 180) {
                if (target.node.y > blockPos.y) {
                    target.direction -= 180;
                }
            }
            // 往右上运动
            else if (target.direction> 0 && target.direction < 90) {
                // 判断下左面
                // 左侧
                if (target.node.x + radiusCos <= blockPos.xMin || 
                    (
                        target.node.x <= blockPos.xMin &&
                        (target.node.y - blockPos.yMax < radiusCos || blockPos.yMin - target.node.y < radiusCos)
                    )) {
                    target.direction = 90 - target.direction + 90;
                } else {
                    target.direction = 360 - target.direction;
                }
            }
            // 左上
            else if (target.direction> 90 && target.direction < 180) {
                // 判断下右面
                // 右侧
                if (target.node.x + radiusCos >= blockPos.xMax || 
                    (
                        target.node.x >= blockPos.xMax &&
                        (target.node.y - blockPos.yMax < radiusCos || blockPos.yMin - target.node.y < radiusCos)
                    )) {
                    target.direction = 90 - target.direction + 90;
                } else {
                    target.direction = 180 - target.direction + 180;
                }
            }
            // 左下
            else if (target.direction> 180 && target.direction < 270) {
                // 判断上右面
                // 右侧
                if (target.node.x + radiusCos >= blockPos.xMax || 
                    (
                        target.node.x >= blockPos.xMax &&
                        (target.node.y - blockPos.yMax < radiusCos || blockPos.yMin - target.node.y < radiusCos)
                    )) {
                    target.direction = (180 - target.direction + 360) % 360;
                } else {
                    target.direction = 360 - target.direction;
                }
            }
            // 右下
            else if (target.direction> 270 && target.direction < 360) {
                // 判断左上面
                // 左侧
                if (target.node.x + radiusCos <= blockPos.xMin || 
                    (
                        target.node.x <= blockPos.xMin &&
                        (target.node.y - blockPos.yMax < radiusCos || blockPos.yMin - target.node.y < radiusCos)
                    )) {
                    target.direction = 180 + (360 - target.direction);
                } else {
                    target.direction = 360 - target.direction;
                }
            }
            // 事件通知
            director.emit('ball-damage', {
                blockPos,
                ball: {
                    attack: target.attack,
                    type: target.type
                }
            });
        }
    }

    // 画瞄准线
    drawAimLine() {
        const graphics = this.node.getComponent(Graphics);
        if (graphics) {
            graphics.clear();
        } else {
            return;
        }
        const unshootBalls = this.balls.filter((ball) => !ball.onShoot);
        /**
         * graphics 坐标系为左下角为起始坐标(0, 0)
         */
        // 左下角坐标
        const leftBottomCoord = {
            x: 0,
            y: 0
        };
        // 场景宽高
        const sceneSize = {
            w: (this.node as any).width,
            h: (this.node as any).height,
        };
        // 右下角坐标
        const rightBottomCoord = {
            x: sceneSize.w,
            y: 0
        };
        if (unshootBalls.length === 1) {
            const ball = unshootBalls[0];
            const radius = 2;
            graphics.strokeColor.fromHEX('#FF0000');
            graphics.fillColor.fromHEX('#FF0000');
            const pointCount = this.reflectLineCount;

            const startPos = {
                x: ball.node.position.x,
                y: ball.node.position.y
            };
            const drawPos = {
                x: 0,
                y: 0
            };
            const currentAngle = ball.direction;

            for (let i = 1; i <= pointCount; i++) {
                // 点间距
                const aimRadian = currentAngle * (Math.PI / 180);
                // 横向纵向每个点的间距
                const deltaXDis = Math.abs(Math.cos(aimRadian) * this.reflectLineInterval);
                const deltaYDis = Math.abs(Math.sin(aimRadian) * this.reflectLineInterval);

                let x;
                let y;
                let compareX;
                if (currentAngle >= 0 && currentAngle <= 90) {
                    x = startPos.x + deltaXDis * i;
                    y = startPos.y + deltaYDis * i;
                    compareX = startPos.x + deltaXDis * i;
                } else if (currentAngle > 90 && currentAngle <= 180) {
                    x = startPos.x - deltaXDis * i;
                    y = startPos.y + deltaYDis * i;
                    compareX = startPos.x - deltaXDis * i;
                }

                // 检查是否需要镜面反射
                if (currentAngle >= 0 && currentAngle <= 90 && compareX >= rightBottomCoord.x) {
                    // 计算x轴最多画几个点
                    const xMaxCount = (rightBottomCoord.x - startPos.x) / deltaXDis;
                    // 计算往前画的距离
                    drawPos.x = startPos.x + deltaXDis * xMaxCount - (i - xMaxCount) * deltaXDis;
                    drawPos.y = y - deltaYDis;
                    graphics.circle(drawPos.x, drawPos.y, radius / 2);
                    graphics.stroke();
                    graphics.fill();
                } else if (currentAngle > 90 && currentAngle <= 180 && compareX <= leftBottomCoord.x) {
                    // 计算x轴最多画几个点
                    const xMaxCount = Math.abs((startPos.x - leftBottomCoord.x) / deltaXDis);
                    // 计算往前画的距离
                    drawPos.x = startPos.x - deltaXDis * xMaxCount + (i - xMaxCount) * deltaXDis;
                    drawPos.y = y - deltaYDis;
                    graphics.circle(drawPos.x, drawPos.y, radius / 2);
                    graphics.stroke();
                    graphics.fill();
                } else {
                    drawPos.x = x;
                    drawPos.y = y;
                    if (rightBottomCoord.x - compareX > deltaXDis && compareX - leftBottomCoord.x >= deltaXDis) {
                        graphics.circle(drawPos.x, drawPos.y, radius / 2);
                        graphics.stroke();
                        graphics.fill();
                    }
                }
            }
        }
    }

    update(deltaTime: number) {
        this.drawAimLine();
        this.balls.forEach((ball) => {
            if (ball.onShoot) {
                // 更新球的位置
                const radian = ball.direction * (Math.PI / 180);
                const dx = ball.speed * Math.cos(radian) * deltaTime;
                const dy = ball.speed * Math.sin(radian) * deltaTime;

                // 更新球的节点位置
                ball.node.setPosition(ball.node.position.x + dx, ball.node.position.y + dy);
            }
        });
        const unshootBalls = this.balls.filter((ball) => !ball.onShoot);
        if (unshootBalls.length) {
            if (this.pressingDirectionKey) {
                const keyCode = this.pressingDirectionKey;
                if (keyCode === DIRECTION_KEY.w || keyCode === DIRECTION_KEY.up) {
                    if (unshootBalls.length) {
                        unshootBalls.forEach((ball) => {
                            ball.direction = ball.direction + this.increaseShootAngle;
                            if (ball.direction >= 180 - this.minShootDirection) {
                                ball.direction = 180 - this.minShootDirection;
                            }
                        });
                    }
                } else if (keyCode === DIRECTION_KEY.s || keyCode === DIRECTION_KEY.down) {
                    if (unshootBalls.length) {
                        unshootBalls.forEach((ball) => {
                            ball.direction = ball.direction - this.increaseShootAngle;
                            if (ball.direction <= this.minShootDirection) {
                                ball.direction = this.minShootDirection;
                            }
                        });
                    }
                }
            }
            this.drawAimLine();
        }
    }
}

