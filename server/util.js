let dir = {
    up: {x: 0, y: -1},
    left: {x: -1, y: 0},
    down: {x: 0, y: 1},
    right: {x: 1, y: 0},
    here: {x: 0, y: 0},
};

module.exports.dirs = [dir.up, dir.left, dir.down, dir.right];

module.exports.dir = dir;
module.exports.up = dir.up;
module.exports.left = dir.left;
module.exports.right = dir.right;
module.exports.down = dir.down;
module.exports.here = dir.here;

