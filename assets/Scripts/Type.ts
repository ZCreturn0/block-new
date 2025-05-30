export interface DIRECTION_KEY {
    w: 87,
    a: 65,
    s: 83,
    d: 68,
    up: 38,
    left: 37,
    down: 40,
    right: 39
};
export type PLAYER_MOVE_KEY = DIRECTION_KEY['a'] | DIRECTION_KEY['left'] | DIRECTION_KEY['d'] | DIRECTION_KEY['right'];