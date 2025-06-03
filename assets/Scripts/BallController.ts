import { _decorator, Component, Node, director, Vec3, Graphics } from 'cc';
const { ccclass, property } = _decorator;

import type { Ball } from './Type';
import { BALL } from './Type';
import { DIRECTION_KEY } from './Type';

@ccclass('BallController')
export class BallController extends Component {

    // 存储所有球
    private balls: Ball[] = [];
    // 反射线数量
    private reflectLineCount: number = 50;
    // 反射线间隔
    private reflectLineInterval: number = 10;
    // 左墙
    private leftWall: Node | null = null;
    // 右墙
    private rightWall: Node | null = null;

    start() {
        this.balls.push({
            onShoot: false,
            speed: 0,
            attack: 1,
            type: BALL.NORMAL,
            // 0 - 360度
            direction: 135,
            node: this.node.getChildByName('Ball').getChildByName('MainBall')
        });
        this.leftWall = this.node.parent.getChildByName('Wall').getChildByName('LeftWall');
        this.rightWall = this.node.parent.getChildByName('Wall').getChildByName('RightWall');
        director.on('player-move', this.onPlayerMove.bind(this));
    }

    onPlayerMove({ direction, speed }) {
        const unshotBalls = this.balls.filter((ball) => !ball.onShoot);
        if (unshotBalls.length) {
            let k = 0;
            if (direction === DIRECTION_KEY.a || direction === DIRECTION_KEY.left) {
                k = -1;
            } else if (direction === DIRECTION_KEY.d || direction === DIRECTION_KEY.right) {
                k = 1;
            }
            unshotBalls.forEach((ball) => {
                const pos = ball.node.position;
                const addPos = new Vec3(k * speed, 0, 0);
                Vec3.add(pos, pos, addPos);
                ball.node.setPosition(pos);
            });
        }
    }

    // 画瞄准线
    drawAimLine(unshotBalls) {
        const graphics = this.node.getComponent(Graphics);
        if (graphics) {
            graphics.clear();
        } else {
            return;
        }
        if (unshotBalls.length === 1) {
            const ball = unshotBalls[0];
            const radius = 2;
            graphics.strokeColor.fromHEX('#FF0000');
            graphics.fillColor.fromHEX('#FF0000');
            const pointCount = this.reflectLineCount;

            // 使用的是相对坐标
            const startPos = {
                x: ball.node.x,
                y: ball.node.y
            };
            const drawPos = {
                x: 0,
                y: 0
            };
            let currentAngle = ball.direction;

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

                const wallWidth = (this.rightWall as any).width / 2;

                // 检查是否需要镜面反射
                if (currentAngle >= 0 && currentAngle <= 90 && compareX >= this.rightWall.x - wallWidth) {
                    // 计算x轴最多画几个点
                    const xMaxCount = (this.rightWall.x - wallWidth - startPos.x) / deltaXDis;
                    // 计算往前画的距离
                    drawPos.x = startPos.x + deltaXDis * xMaxCount - (i - xMaxCount - 1) * deltaXDis;
                    drawPos.y = y - deltaYDis;
                    graphics.circle(drawPos.x, drawPos.y, radius / 2);
                    graphics.stroke();
                    graphics.fill();
                } else if (currentAngle > 90 && currentAngle <= 180 && compareX <= this.leftWall.x + wallWidth) {
                    // 计算x轴最多画几个点
                    const xMaxCount = Math.abs((startPos.x - (this.leftWall.x + wallWidth)) / deltaXDis);
                    // 计算往前画的距离
                    drawPos.x = startPos.x - deltaXDis * xMaxCount + (i - xMaxCount + 1) * deltaXDis;
                    drawPos.y = y - deltaYDis;
                    graphics.circle(drawPos.x, drawPos.y, radius / 2);
                    graphics.stroke();
                    graphics.fill();
                } else {
                    drawPos.x = x;
                    drawPos.y = y;
                    if (this.rightWall.x - wallWidth - compareX > deltaXDis && compareX - this.leftWall.x - wallWidth >= deltaXDis) {
                        graphics.circle(drawPos.x, drawPos.y, radius / 2);
                        graphics.stroke();
                        graphics.fill();
                    }
                }
            }
        }
    }

    update(deltaTime: number) {
        const unshotBalls = this.balls.filter((ball) => !ball.onShoot);
        if (unshotBalls.length) {
            this.drawAimLine(unshotBalls);
        }
    }
}

