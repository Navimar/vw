let dir = {
    up: {x: 0, y: -1},
    left: {x: -1, y: 0},
    down: {x: 0, y: 1},
    right: {x: 1, y: 0},
    here: {x: 0, y: 0},
};

let color = {
    green: '#005500',
};

let random = (min, max) => {
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
};

module.exports = {
    color: color,
    dirs: [dir.up, dir.left, dir.down, dir.right],
    dir,
    random,
};

// module.exports.up = dir.up;
// module.exports.left = dir.left;
// module.exports.right = dir.right;
// module.exports.down = dir.down;
// module.exports.here = dir.here;

