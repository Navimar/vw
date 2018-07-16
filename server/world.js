const _ = require('lodash');
const util = require('./util');
const direction = util.dir;
const random = util.random;

const meta = require('./meta.js').meta;
const wound = require('./meta.js').wound;
const config = require('./config.js');
const zarr = require('./zarr.js');

let world = {};
let game = {};

let server = {
    connected: 0,
};

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
    // console.log('???');
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
    // p.img = meta.player.img;
    p.satiety = 100;
    p.wound = [];
    p.tire = 0;
    // p.died = false;
    // p.tool = {typ: "hand"};
    p.slct = 0;
    p.tp = 'player';
    let data = {};
    p.data = data;
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
    let obs = world.map.get(k);
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
    let data = {};
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
                        meta[o.tp].isSolid(o.data)
                        :
                        meta[o.tp].isSolid;
                if (solid) {
                    return o
                }
            }
            world.relocate(obj, x, y);
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
        let data = {};
        meta[obj.tp].onCreate(data);
        obj.data = data;
    }
    if (meta[tp].onTurn) {
        world.nextTurn(1, obj);
    }
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

world.start = () => {
    let start = config.world.start;
    let arr = config.world.obj;
    let f = config.world.factor;
    let items = config.world.items;
    let q = 0;
    for (let a of arr) {
        q += a.q;
    }
    let m = items / q;
    let wid = Math.round(Math.sqrt(items * f));
    console.log("world size: " + wid);
    wid += start;
    for (let a of arr) {
        for (let i = 0; i < a.q * m; i++) {
            world.createObj(a.m, random(start, wid), random(start, wid));
        }
    }
    let a = Math.round((wid - start) / 10);
    for (let w = start - a; w < wid + a; w++) {
        world.createObj('wall', w, start - a);
        world.createObj('wall', w, wid + a);
        world.createObj('wall', start - a, w);
        world.createObj('wall', wid + a, w);
    }

};

module.exports = world;