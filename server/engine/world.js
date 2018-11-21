const _ = require('lodash');
const util = require('../web/util');
const direction = util.dir;
const random = util.random;

const meta = require('../logic/meta.js').meta;
const wound = require('../logic/meta.js').wound;
const config = require('../logic/config.js');
const zarr = require('../logic/zarr.js');

let world = {};
let game = {};

let server = {
    connected: 0,
};

world.wrapper = (me, theWound) => {
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
            let f = world.wrapper(me).isHere(tp);
            if (!f) {
                f = world.wrapper(me).isNear(tp);
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
            if (me.carrier && _.isFinite(x) && _.isFinite(y)) {
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

world.init = () => {
    game.player = [];
    game.time = 0;
    game.map = new Map();
    game.logic = new Map();
    game.cnMass = 0;
    game.cnId = 0;
    // game.cnError = 1;
    // game.willgo = [];
    game.center = {x: 0, y: 0};
    game.obj = [];

    _.forEach(meta, (value, key, list) => {
        _.forEach(zarr, (zvalue, zkey, zlist) => {
            if (zvalue == key) {
                value.z = zkey;
            }
        });
        // console.log(value.key);
        value.key = key;
        // console.log(key);
        if (!value.z) {
            console.log("НЕ ДОБВАЛЕН В МАССИВ Z", key);
        }
        if (!value.describe) {
            console.log("Нет описания", key);
        }
    });
};
world.center = () => {
    return game.center;
};
world.player = () => {
    return game.player;
};
world.obj = () => {
    return game.obj;
};
world.logic = () => {
    return game.logic;
};
world.time = () => {
    return game.time;
};
world.game = () => {
    return game;
};
world.snap = () => {
    let snap = game;
    snap.maparr = Array.from(game.map);
    snap.logicarr = Array.from(game.logic);
    return snap;
};
world.loadgame = (g) => {
    game = g;
    let gm = new Map;
    _.forEach(g.maparr, function (value) {
        gm.set(value[0], value[1]);
    });
    game.map = gm;
    let gl = new Map;
    _.forEach(g.logicarr, function (value) {
        gl.set(value[0], value[1]);
    });
    game.logic = gl;
};
world.timeplus = () => {
    game.time++;
};
world.connection = () => {
    server.connected++
};
world.disconnect = () => {
    server.connected--
};
world.connected = () => {
    return server.connected;
};

function removefromMap(obj) {
    if (obj.x === false || obj.y === false) {
        world.error = "removefromMap error";
        return false;
    }
    remove(obj.x + " " + obj.y, obj);
}

function remove(k, obj) {
    if (game.map.has(k)) {
        let m = game.map.get(k);
        for (let i in m) {
            if (obj === m[i]) {
                m.splice(i, 1);
            }
        }
    } else {
        world.error = "remove error. Key = " + k;
    }
}

world.addPlayer = (socket, id, x, y) => {
    if (!x || !y) {
        x = 0;
        y = 0;
    }
    let p = {socket, id, x, y};
    p.message = false;
    p.wounds = [];
    p.solid = true;
    p.dirx = 0;
    p.diry = 0;
    p.order = "stop";
    p.order.n = 0;
    p.lastorder = {val: {}};
    p.satiety = 100;
    p.wound = [];
    p.tire = 0;
    p.slct = 0;
    p.tp = 'player';
    let data = {};
    p.data = data;
    p.remembers = new Map();
    meta[p.tp].onCreate(data);
    for (let a = 0; a < 9; a++) {
        p.wound[a] = wound.life;
    }
    addtoMap(p.x, p.y, p);
    game.player.push(p);
    return p;
};
world.playerBySocket = (socket) => {
    if (socket) {
        for (let p of world.player) {
            if (p.socket == socket) {
                return p
            }
        }
    }
    return false;
};
world.playerBySocket = (socket) => {
    if (socket) {
        for (let p of game.player) {
            if (p.socket == socket) {
                return p
            }
        }
    }
    return false;
};

world.playerById = (id) => {
    for (let p of world.player) {
        if (id === p.id) {
            return p
        }
    }
    return false
};

world.pickUp = (objTaker, tp) => {
    let k = objTaker.x + " " + objTaker.y;
    let obs = game.map.get(k);
    if (obs) {
        // if (obs.length < 8) {
        for (let o of obs) {
            if (o.tp === tp) {
                world.put(o, objTaker);
                return o;
            }
            // }
        }
    }
    return false;
};

function addtologic(obj, t) {
    // console.log(game.logic,'       ___________        ');
    if (game.logic.has(t)) {
        let i = game.logic.get(t);
        i.push(obj);
        game.logic.set(t, i);
    } else {
        game.logic.set(t, [obj]);
    }
    obj.nextTurn = t;
}

// function cancelTurn(obj) {
//     let objArr = world.logic.get(obj.nextTurn);
//     for (let o in objArr) {
//         if (objArr[o] === obj) {
//             objArr.splice(o, 1);
//         }
//     }
// }


world.put = (obj, carrier) => {
    removefromMap(obj);
    addtoInv(obj, carrier);
};

world.drop = function (obj, x, y) {
    removefromInv(obj);
    addtoMap(x, y, obj);
};

function addtoInv(obj, carrier) {
    addkey(carrier.id, obj);
    obj.x = false;
    obj.y = false;
    obj.carrier = carrier.id;

}

function removefromInv(obj) {
    remove(obj.carrier, obj);
}

function makeid() {
    // let text = "";
    // let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //
    // for (let i = 0; i < 12; i++)
    //     text += possible.charAt(Math.floor(Math.random() * possible.length));
    game.cnId++;
    return game.cnId;
}

function addtoMap(x, y, obj) {
    addkey(x + " " + y, obj);
    obj.x = x;
    obj.y = y;
    obj.carrier = false;
}

function addkey(k, obj) {
    if (game.map.has(k)) {
        let i = game.map.get(k);
        i.push(obj);
        game.map.set(k, i);
    } else {
        game.map.set(k, [obj]);
    }
}

world.createObj = (tp, x, y) => {
    let data = {first: true};
    if (meta[tp].onCreate) {
        meta[tp].onCreate(data);
    }
    let o = {x: x, y: y, id: makeid(), tp, data, message: false};


    addtoMap(x, y, o);
    game.obj.push(o);

    if (meta[tp].onTurn) {
        let t = world.time() + random(99);
        addtologic(o, t);
    }
    world.cnMass++;
    return o;
};


world.inv = function (tp, obj) {
    let inv = world.map.get(obj.id);
    if (inv != undefined) {
        for (let k of inv) {
            if (k.tp === tp) {
                return k;
            }
        }
    }
    return false;
};

world.lay = function lay(tp, x, y) {
    let key = x + " " + y;
    let inv = game.map.get(key);
    if (inv != undefined) {
        for (let k of inv) {
            if (k.tp === tp) {
                return k
            }
        }
    }
    return false;
};

world.trade = function (obj, carrier) {
    removefromInv(obj);
    addtoInv(obj, carrier);
};

world.move = function (obj, dir, y) {
    if (_.isFinite(obj.x) && _.isFinite(obj.y)) {
        let m = (x, y) => {
            for (let o of world.point(x, y)) {
                let solid =
                    _.isFunction(meta[o.tp].isSolid) ?
                        meta[o.tp].isSolid(o.data, obj)
                        :
                        meta[o.tp].isSolid;
                if (solid) {
                    return o
                }
            }
            for (let o of world.point(obj.x, obj.y)) {
                if (_.isFunction(meta[o.tp].onStepout)) {
                    if (meta[o.tp].onStepout(o.data, world.wrapper(o), obj)) {
                        return o
                    }
                }
            }
            world.relocate(obj, x, y);
            for (let o of world.point(x, y)) {
                if (_.isFunction(meta[o.tp].onStepin))
                    meta[o.tp].onStepin(o.data, world.wrapper(o), obj);
            }
            return false
        };

        if (y) {
            let xx = dir;
            let yy = y;
            return m(xx, yy);
        } else {
            let x = obj.x + dir.x;
            let y = obj.y + dir.y;
            return m(x, y);
        }
    }
    return false;
};

world.addWound = (player, w) => {
    if (!player.data.died) {
        let ok = true;
        for (let x in player.wound) {
            if (player.wound[x] === wound.life && ok) {
                player.wound[x] = w;
                let ws = true;
                for (let a of player.wounds) {
                    if (a.wound === w) {
                        ws = false;
                        break;
                    }
                }
                if (ws) player.wounds.push({time: game.time + 1, wound: w, first: true});
                ok = false;
            }
        }
        if (ok) {
            player.data.died = true;
        }
    } else {
        return false;
    }
};

world.removeWound = (player, w) => {
    if (w) {
        for (let x in player.wound) {
            if (player.wound[x] === w) {
                player.wound[x] = wound.life;
                return true;
            }
        }
    } else {
        for (let x in player.wound) {
            if (player.wound[x] !== wound.life) {
                player.wound[x] = wound.life;
                return true;
            }
        }
    }
};
world.isInInv = (obj, carrier) => {
    let arr = world.inv(carrier);
    if (arr) {
        for (let o of arr) {
            if (o === obj) {
                return o;
            }
        }
    }
    return false;
};

world.relocate = (obj, x, y) => {

    // if (obj.carrier!==undefined&& obj.carrier!==false) {
    //     console.log (obj.carrier);
    //     throw 'relocate from inv';
    // }
    // for (let o of world.obj) {
    //     if (o === obj) {
    //         o.x = x;
    //         o.y = y;
    //         break;
    //     }
    // }

    removefromMap(obj);
    addtoMap(x, y, obj)
};

world.nextTurn = (time, obj) => {
    let t = game.time + time;
    addtologic(obj, t);
};

world.transform = (obj, tp) => {
    obj.tp = tp;
    if (meta[tp].onCreate) {
        let data = {first: true};
        meta[obj.tp].onCreate(data);
        obj.data = data;
    }
    if (meta[tp].onTurn) {
        world.nextTurn(1, obj);
    }
    // if (tp.onCreate) {
    //     let data = {first: true};
    //     tp.onCreate(data);
    //     obj.data = data;
    // }
    // if (tp.onTurn) {
    //     world.nextTurn(1, obj);
    // }
};

world.point = (x, y) => {
    ////array
    // let arr = [];
    // for (let o of world.obj) {
    //     if (o.x === x && o.x === y) {
    //         arr.push(o);
    //     }
    // }
    // if (arr[0]) {
    //     return arr;
    // } else {
    //     return false;
    // }

    //keys
    // if (world.map.has(x + " " + y)) {
    let obj = game.map.get(x + " " + y);
    if (obj) {
        if (obj.length > 0) {
            return obj;
        }
    }
    // }
    return [];
    // return false;
};

world.recall = (p, x, y) => {
    let obj = p.remembers.get(p.x + x + " " + p.y + y);
    if (obj) {
        if (obj.length > 0) {
            return obj;
        }
    }
    // }
    return [];
    // return false;
};


world.remember = (p, x, y, obj) => {
    let k = p.x + x + " " + p.y + y;
    if (p.remembers.has(k)) {
        let i = p.remembers.get(k);
        i.push(obj);
        p.remembers.set(k, i);
    } else {
        p.remembers.set(k, [obj]);
    }
    obj.x = x;
    obj.y = y;
    obj.carrier = false;
};

world.forget = (p, x, y) => {
    let k = p.x + x + " " + p.y + y;
    p.remembers.delete(k);
};

world.inv = (obj) => {
    if (game.map.has(obj.id)) {
        let arr = game.map.get(obj.id);
        if (arr.length > 0) {
            return arr;
        }
    }
    return [];
    // return false;
};

world.findInPoint = (tp, x, y) => {
    let o = world.point(x, y);
    if (_.isArray(o)) {
        if (tp.length) {
            for (let item of o) {
                if (tp.includes(item.tp)) {
                    return item;
                }
            }
        } else {
            for (let item of o) {
                if (tp === item.tp) {
                    return item;
                }
            }
        }
    }

    return false;
};
world.find = (tp, x, y, first, last) => {
    if (first === undefined) {
        first = 0;
    }
    if (last === undefined) {
        last = 4;
    }
    // let arr = [];
    // for (let i = 0; i < world.obj.length; i++) {
    //     let dx = Math.abs(x - world.obj[i].x);
    //     let dy = Math.abs(y - world.obj[i].y);
    //     if (dx <= 4 && dy <= 4 && world.obj[i].tp === tp) {
    //         arr.push({obj: world.obj[i], dx, dy});
    //     }
    // }
    // arr.sort(function (a, b) {
    //     if (a.dx + a.dy > b.dx + b.dy) {
    //         return 1
    //     } else {
    //         return -1
    //     }
    // });
    //
    // if (arr.length === 0) {
    //     return false;
    // } else {
    //     return arr[0].obj;
    // }

    function findInSircle(a) {
        for (let xx = x - a; xx <= x + a; xx++) {
            for (let yy = y - a; yy <= y + a; yy++) {
                if (Math.abs(xx - x) === a || Math.abs(yy - y) === a) {
                    let f = world.findInPoint(tp, xx, yy);
                    if (f) return f;
                }
            }
        }
        return false;
    }

    for (let a = first; a <= last; a++) {
        let f = findInSircle(a);
        if (f) return f;
    }
    return false;
};

world.wid = () => {
    return Math.round(Math.sqrt(config.world.items * config.world.factor));
};

world.start = () => {
    let start = config.world.start;
    let arr = config.world.obj;
    // let f = config.world.factor;
    let items = config.world.items;
    let q = 0;
    for (let a of arr) {
        q += a.q;
    }
    let m = items / q;
    console.log("world size: " + world.wid());
    let wid = start + world.wid();
    for (let a of arr) {
        for (let i = 0; i < a.q * m; i++) {
            world.createObj(a.m, random(start, wid), random(start, wid));
        }
    }
    // let a = Math.round((wid - start) / 10);
    let p = 5;
    for (let w = start - q; w < wid + p; w++) {
        // for (let a = 1; a < p; a++) {
        //     // if(!random(10)){
        //     //     world.createObj('mermaid', w, start - a);
        //     //     world.createObj('mermaid', w, wid + a);
        //     //     world.createObj('mermaid', start - a, w);
        //     //     world.createObj('mermaid', wid + a, w);
        //     // }
        //     world.createObj('space', w, start - a);
        //     world.createObj('space', w, wid + a);
        //     world.createObj('space', start - a, w);
        //     world.createObj('space', wid + a, w);
        // }
        // for (let a = 0; a < p-1; a++) {
        //     world.createObj('deepspace', w, start - p - a);
        //     world.createObj('deepspace', w, wid + p + a);
        //     world.createObj('deepspace', start - p - a, w);
        //     world.createObj('deepspace', wid + p + a, w);
        // }
    }

};

module.exports = world;