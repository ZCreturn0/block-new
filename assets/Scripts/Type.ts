import { Node } from 'cc';

export const DIRECTION_KEY = {
    w: 87,
    a: 65,
    s: 83,
    d: 68,
    up: 38,
    left: 37,
    down: 40,
    right: 39
} as const;
export const KEY = {
    space: 32
};
/**
 * tag:
 * 100 球
 * 1 左墙
 * 2 上墙
 * 3 右墙
 * 10086 玩家
 */
export const TAG = {
    BALL: 100,
    LEFT_WALL: 1,
    TOP_WALL: 2,
    RIGHT_WALL: 3,
    PLAYER: 10086
};
// 方向 1左 2右
export const DIRECTION_TYPE = {
    STOP: 0,
    LEFT: 1,
    RIGHT: 2
};
export type PLAYER_MOVE_KEY = typeof DIRECTION_KEY.a | typeof DIRECTION_KEY.left | typeof DIRECTION_KEY.d | typeof DIRECTION_KEY.right;
export type SHOOT_CORNER_CHANGE_KEY = typeof DIRECTION_KEY.w | typeof DIRECTION_KEY.up | typeof DIRECTION_KEY.s | typeof DIRECTION_KEY.down;
export type PLAYER_DIRECTION_KEY = typeof DIRECTION_TYPE.STOP | typeof DIRECTION_TYPE.LEFT | typeof DIRECTION_TYPE.RIGHT;

export const BALL = {
    NORMAL: 1,
    FIRE: 2,
    WIND: 3,
    COLORFUL: 4
};
export type BALL_TYPE = typeof BALL[keyof typeof BALL];
export type Ball = {
    // 是否发射
    onShoot: boolean;
    // 球的速度
    speed: number;
    // 类型
    type: BALL_TYPE;
    // 攻击力
    attack: number;
    // 球的方向(0 - 360度)
    direction: number;
    // 添加 node 属性以存储球的节点
    node: Node;
};

export function isPlayerMoveKey(key: number): key is PLAYER_MOVE_KEY {
    return Object.values(DIRECTION_KEY).some(k => k === key) 
        && (key === DIRECTION_KEY.a 
            || key === DIRECTION_KEY.left 
            || key === DIRECTION_KEY.d 
            || key === DIRECTION_KEY.right);
}
export function isShootCornerChangeKey(key: number): key is PLAYER_MOVE_KEY {
    return Object.values(DIRECTION_KEY).some(k => k === key) 
        && (key === DIRECTION_KEY.w
            || key === DIRECTION_KEY.up 
            || key === DIRECTION_KEY.s
            || key === DIRECTION_KEY.down);
}
export function isSpace(key: number) {
    return key === KEY.space;
}

export interface PLAYER_MOVE_TYPE {
    direction: PLAYER_MOVE_KEY;
    speed: number;
}

export const BLOCK = {
    EMPTY: 0,
    NORMAL: 1,
    GRASS: 2,
    WOOD: 3,
    GOLD: 4,
    DIAMOND: 5
};
export type BLOCK_TYPE = typeof BLOCK[keyof typeof BLOCK];

export interface SIZE {
    w: number;
    h: number;
};
export interface BLOCK_NODE {
    hp: number;
    type: BLOCK_TYPE;
    node: Node;
}
export const blockType: Array<string> = ['NormalBlock<BoxCollider2D>', 'WoodBlock<BoxCollider2D>', 'GrassBlock<BoxCollider2D>', 'GoldBlock<BoxCollider2D>', 'DiamandBlock<BoxCollider2D>'];