const _ = require('lodash');

const wound = require('./meta').wound;
const world = require('./world');
const util = require('./util');
const random = util.random;
const direction = util.dir;


wrapper = (me, theWound) => {
    return {
        me,
        wound,
        center: {
            x: world.center.x,
            y: world.center.y,
        },
        findinInv: (tp) => {
            if (Array.isArray(tp)) {
                for (let t of tp) {
                    let i = world.inv(t, me);
                    if (i) return i;
                }
            } else {
                return world.inv(tp, me)
            }
        },
        inv: (obj) => {
            if (!obj) {
                obj = me;
            }
            return world.inv(obj);
        },
        isHere: (tp) => {
            if (tp) {
                if (!Array.isArray(tp)) tp = [tp];
                for (let t of tp) {
                    let i = world.lay(t, me.x, me.y);
                    if (i && i !== me) return i;
                }
            } else {
                let a = world.point(me.x, me.y);
                if (a) {
                    if (a[0] !== me) {
                        return a[0];
                    } else {
                        if (a[1]) {
                            return a[1];
                        }
                    }
                }
            }
            return false;
        },
        objHere: (x, y) => {
            if (!x || !y) {
                x = me.x;
                y = me.y;
            }
            return world.objArrInPoint(x, y);
        },
        move: (dir) => {
            if (!dir) {
                dir = exe.wrapper().dirRnd;
            }
            return world.move(me, dir);
        },
        goTo: (d) => {
            if (_.isFinite(d.x) && _.isFinite(d.y)) {
                d = dirTo(d.x, d.y, me).dir;
            }
            let ox = me.x;
            let oy = me.y;
            let m = false;
            if (d[0] !== direction.here) {
                m = world.move(me, d[0]);
                if (ox === me.x && oy === me.y && d[1] !== direction.here) {
                    m = world.move(me, d[1]);
                }
            }
            return m;
        },
        isNear: (tp) => {
            if (!Array.isArray(tp)) tp = [tp];
            for (let t of tp) {
                let i;
                i = world.lay(t, me.x + 1, me.y);
                if (i && i !== me) return i;
                i = world.lay(t, me.x, me.y + 1);
                if (i && i !== me) return i;
                i = world.lay(t, me.x, me.y - 1);
                if (i && i !== me) return i;
                i = world.lay(t, me.x - 1, me.y);
                if (i && i !== me) return i;
            }
            return false;
        },
        isHereNear: (tp) => {
            let f = wrapper(me).isHere(tp);
            if (!f) {
                f = wrapper(me).isNear(tp);
            }
            return f;
        },
        movetrought: (dir) => {
            let x = me.x + dir.x;
            let y = me.y + dir.y;
            world.relocate(me, x, y)
        },
        relocate: (x, y) => world.relocate(me, x, y),
        dirRnd: util.dirs[random(3)],
        nextTurn: (time) => world.nextTurn(time, me),
        nextAct: (time) => {
            me.wounds.push({time: world.time() + time, wound: theWound, first: false});
        },
        transform: (obj, tp) => world.transform(obj, tp),
        pickUp: (tp) => {
            if (!Array.isArray(tp)) tp = [tp];
            for (let t of tp) {
                let i = world.pickUp(me, t);
                if (i) return i;
            }
        },
        take: (obj) => {
            world.put(obj, me);
        },
        put: (obj, to) => {
            world.put(obj, to);
        },
        drop: (obj) => {
            if (!obj) {
                obj = world.inv(me);
                if (obj) obj = obj[0];
            }
            if (obj) {
                world.drop(obj, me.x, me.y);
            } else {
                return false
            }
        },
        dropAll: (o) => {
            if (o === undefined) {
                o = me;
            }
            let obj = world.inv(o);
            if (obj) {
                while (obj[0])
                    world.drop(obj[0], me.x, me.y);
            }
        },
        transformdropAll: (tp) => {
            let obj = world.inv(me);
            while (obj[0]) {
                world.transform(obj[0], tp);
                world.drop(obj[0], me.x, me.y);
            }
        },
        getOut: (x, y) => {
            if (me.carrier) {
                world.drop(me, x, y);
            }
        },
        // trade: (obj) => world.trade(me, obj),
        removeWound: (player, string) => {
            return world.removeWound(player, string)
        },
        addWound: (player, string) => {
            return world.addWound(player, string)
        },
        fillWound: (player, string) => {
            for (let w of player.wound) {
                if (w === wound.life) {
                    return world.addWound(player, string);
                }
            }
        },
        dirFrom: (x, y) => {
            let o = dirTo(x, y, me);
            for (let a = 0; a < 1; a++) {
                if (o.dir[a] === direction.up) {
                    o.dir[a] = direction.down
                } else if (o.dir[a] === direction.down) {
                    o.dir[a] = direction.up
                } else if (o.dir[a] === direction.left) {
                    o.dir[a] = direction.right
                } else if (o.dir[a] === direction.right) {
                    o.dir[a] = direction.left
                }
            }
            return o;
        },
        dirTo: (x, y) => {
            return dirTo(x, y, me);
        },
        find: (target, first, last) => {
            return world.find(target, me.x, me.y, first, last)
        },
        findFrom: (x, y, target, first, last) => {
            return world.find(target, x, y, first, last)
        },
        say: (text, obj, color) => {
            if (_.isArray(text)) {
                text = text[random(text.length - 1)];
            }
            if (obj.message && obj.message.text === text) {
                text += " ";
            }
            obj.message = {text, color};
        }
    };
};

function dirTo(x, y, me) {
    let dir = [direction.here, direction.here];
    let xWant = Math.abs(x - me.x);
    let yWant = Math.abs(y - me.y);
    let dx;
    let dy;
    if (xWant > yWant) {
        dx = 0;
        dy = 1;
    } else {
        dx = 1;
        dy = 0;
    }
    if (x - me.x > 0) {
        dir[dx] = direction.right;
    } else if (x - me.x < 0) {
        dir[dx] = direction.left;
    } else {
        dir[dx] = direction.here
    }
    if (y - me.y > 0) {
        dir[dy] = direction.down;
    } else if (y - me.y < 0) {
        dir[dy] = direction.up;
    } else {
        dir[dy] = direction.here;
    }
    return {dir, xWant, yWant};
}

module.exports = wrapper;