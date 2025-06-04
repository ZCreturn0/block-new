import { _decorator, Component, Node, Prefab, instantiate, Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

import type { SIZE, BLOCK_NODE, BLOCK_TYPE, BALL_TYPE } from './Type';
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

    // 地图
    private map: Array<Array<number>> = [
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

    onBallDamage(e) {
        const { blockPos, ball } = e;
        const pos = {
            x: 0,
            y: 0
        };
        // 找到在数组中的索引
        this.mapNodes.forEach((item, _i) => {
            item.forEach((_item, _j) => {
                if (_item.node && _item.node.x === blockPos.x && _item.node.y === blockPos.y) {
                    pos.x = _i;
                    pos.y = _j;
                }
            });
        });
        const target = this.mapNodes[pos.x][pos.y];
        if (target && target.hp) {
            const damage = this.getDamage(target.type, ball.type);
            target.hp -= damage;
            if (target.hp <= 0) {
                this.node.removeChild(target.node);
                this.mapNodes[pos.x][pos.y].node = null;
                this.map[pos.x][pos.y] = BLOCK.EMPTY;
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

