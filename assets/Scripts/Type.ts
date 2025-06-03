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
export type PLAYER_MOVE_KEY = typeof DIRECTION_KEY.a | typeof DIRECTION_KEY.left | typeof DIRECTION_KEY.d | typeof DIRECTION_KEY.right;
export type SHOOT_CORNER_CHANGE_KEY = typeof DIRECTION_KEY.w | typeof DIRECTION_KEY.up | typeof DIRECTION_KEY.s | typeof DIRECTION_KEY.down;
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