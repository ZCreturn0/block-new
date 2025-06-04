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
// todo: 增加更多类型
export const BALL = {
    NORMAL: 0,
    FIRE: 1
};
export type Ball = {
    // 是否发射
    onShoot: boolean;
    // 球的速度
    speed: number;
    // 类型
    type: typeof BALL[keyof typeof BALL];
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