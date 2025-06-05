import { _decorator, Component, Node, Prefab, instantiate, Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

import type { SIZE, BLOCK_NODE, BLOCK_TYPE, BALL_TYPE, POS } from './Type';
import { BLOCK, BALL } from './Type';

@ccclass('BlockCtroller')
export class BlockCtroller extends Component {

    // 普通砖
    @property({type: Prefab})
    public normalBlock: Prefab | null = null;

    // 草砖
    @property({type: Prefab})
    public grassBlock: Prefab | null = null;

    // 木砖
    @property({type: Prefab})
    public woodBlock: Prefab | null = null;

    // 黄金砖
    @property({type: Prefab})
    public goldBlock: Prefab | null = null;

    // 钻石砖
    @property({type: Prefab})
    public diamondBlock: Prefab | null = null;

    // 砖块尺寸
    private blockSize: SIZE = {
        w: 1200,
        h: 700
    };

    // 每行能放下砖块数: 1 / blockScale
    // 砖块缩放比例
    private blockScale: number = 0.02;

    // 存储上一次碰撞的坐标
    public lastContactingPos: POS = {
        x: -1,
        y: -1
    };

    // 地图
    public map: Array<Array<number>> = [
        [BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.EMPTY],
        [BLOCK.GOLD, BLOCK.GOLD, BLOCK.GOLD, BLOCK.GOLD, BLOCK.GOLD, BLOCK.GOLD, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND, BLOCK.DIAMOND],
        [BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.NORMAL],
        [BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.NORMAL, BLOCK.GRASS, BLOCK.GRASS, BLOCK.GRASS, BLOCK.GRASS, BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.EMPTY],
        [BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.NORMAL, BLOCK.GRASS, BLOCK.WOOD, BLOCK.WOOD, BLOCK.GRASS, BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.EMPTY],
        [BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.NORMAL, BLOCK.GRASS, BLOCK.GRASS, BLOCK.GRASS, BLOCK.GRASS, BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.EMPTY],
        [BLOCK.EMPTY, BLOCK.EMPTY, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.EMPTY, BLOCK.EMPTY],
        [],
        [BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL, BLOCK.NORMAL]
    ];

    // 存储地图对应的节点
    private mapNodes: Array<Array<BLOCK_NODE>> = [];

    start() {
        this.renderMap();
        director.on('ball-damage', this.onBallDamage.bind(this));
    }

    getBlockByType(type: BLOCK_TYPE) {
        switch(type) {
            case BLOCK.EMPTY:
                return null;
            case BLOCK.NORMAL:
                return this.normalBlock;
            case BLOCK.GRASS:
                return this.grassBlock;
            case BLOCK.WOOD:
                return this.woodBlock;
            case BLOCK.GOLD:
                return this.goldBlock;
            case BLOCK.DIAMOND:
                return this.diamondBlock;
            default:
                return null;
        }
    }

    getHpByType(type: BLOCK_TYPE) {
        switch(type) {
            case BLOCK.EMPTY:
                return 0;
            case BLOCK.NORMAL:
                return 1;
            case BLOCK.GRASS:
                return 3;
            case BLOCK.WOOD:
                return 3;
            case BLOCK.GOLD:
                return 3;
            case BLOCK.DIAMOND:
                return 1;
            default:
                return 0;
        }
    }

    renderMap() {
        const {width, height} = (this.node as any);
        const xMin = 0;
        const yMin = 0;
        const xMax = width;
        const yMax = height;
        this.map.forEach((item, y) => {
            const line: Array<BLOCK_NODE> = [];
            item.forEach((_item, x) => {
                const block = this.getBlockByType(_item);
                if (block) {
                    const blockIns = instantiate(block);
                    this.node.addChild(blockIns);
                    blockIns.setScale(new Vec3(this.blockScale, this.blockScale, 1));
                    // 定位点在砖块中心，所以x,y 坐标需要减去自身宽高的一半
                    blockIns.setPosition(
                        xMin + (x + 0.5) * this.blockSize.w * this.blockScale, 
                        yMax - ((y + 0.5) * this.blockSize.h * this.blockScale), 
                        0
                    );
                    line.push({
                        hp: this.getHpByType(_item),
                        type: _item,
                        node: blockIns
                    });
                }
            });
            this.mapNodes.push(line);
        });
    }

    // 通过x,y坐标获取砖块在mapNodes下的索引
    getPosByXy(x: number, y: number) {
        const pos = {
            x: 0,
            y: 0
        };
        this.mapNodes.forEach((item, _i) => {
            item.forEach((_item, _j) => {
                if (_item.node && _item.node.x === x && _item.node.y === y) {
                    pos.x = _i;
                    pos.y = _j;
                }
            });
        });
        return pos;
    }

    setSchedule() {
        this.scheduleOnce(this.setLastContactingPos, 0.1);
    }

    cancelSchedule() {
        this.unschedule(this.setLastContactingPos);
    }

    setLastContactingPos() {
        this.lastContactingPos.x = -1;
        this.lastContactingPos.y = -1;
    }

    onBallDamage(e) {
        const { blockPos, ball } = e;
        const pos = this.getPosByXy(blockPos.x, blockPos.y);
        const target = this.mapNodes[pos.x][pos.y];
        /**
         * 防重复碰撞，短时间内与上一次碰撞在同一行或同一列则视为无效
         */
        if (pos.x === this.lastContactingPos.x || pos.y === this.lastContactingPos.y) {
            return;
        }
        if (target && target.hp) {
            this.cancelSchedule();
            const damage = this.getDamage(target.type, ball.type);
            target.hp -= damage;
            if (target.hp <= 0) {
                this.node.removeChild(target.node);
                target.node.destroy();
                this.mapNodes[pos.x][pos.y].node = null;
                this.map[pos.x][pos.y] = BLOCK.EMPTY;
                this.lastContactingPos.x = pos.x;
                this.lastContactingPos.y = pos.y;
                this.setSchedule();
            }
        }
    }

    getDamage(ballType: BALL_TYPE, blockType: BLOCK_TYPE): number {
        let damage = 0;
        switch(ballType) {
            case BALL.NORMAL:
                if ([BLOCK.NORMAL, BLOCK.GRASS, BLOCK.WOOD, BLOCK.GOLD].includes(blockType)) {
                    damage = 1;
                } else if (blockType === BLOCK.DIAMOND) {
                    damage = 0;
                }
                break;
            case BALL.FIRE:
                if ([BLOCK.NORMAL, BLOCK.GRASS, BLOCK.GOLD].includes(blockType)) {
                    damage = 1;
                } else if (blockType === BLOCK.WOOD) {
                    damage = 3;
                } else if (blockType === BLOCK.DIAMOND) {
                    damage = 0;
                }
                break;
            case BALL.WIND:
                if ([BLOCK.NORMAL, BLOCK.WOOD, BLOCK.GOLD].includes(blockType)) {
                    damage = 1;
                } else if (blockType === BLOCK.GRASS) {
                    damage = 3;
                } else if (blockType === BLOCK.DIAMOND) {
                    damage = 0;
                }
                break;
            case BALL.COLORFUL:
                if ([BLOCK.GRASS, BLOCK.WOOD, BLOCK.GOLD].includes(blockType)) {
                    damage = 3;
                } else if ([BLOCK.NORMAL, BLOCK.DIAMOND].includes(blockType)) {
                    damage = 1;
                }
                break;
        }
        return damage;
    }

    update(deltaTime: number) {
        
    }
}

