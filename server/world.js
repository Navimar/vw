const _ = require('underscore');
const util = require('./util.js');
const direction = util.dir;
const meta = require('./meta.js');
const config = require('./config.js');

let world = {};

world.init = () => {
    world.player = [];
    world.time = 0;
    world.connected = 0;
    world.map = new Map();
    world.logic = new Map();
    world.cnMass = 0;
    world.cnId = 0;
    world.cnError = 1;
    world.willgo = [];
    world.center = {x: 0, y: 0};


    world.obj = [];
    // world.box.test = true;
    // world.box.error = "everything is fine";
    // world.box.testfail = false;
};

function removefromMap(obj) {
    if (obj.x === false || obj.y === false) {
        world.error = "removefromMap error";
        return false;
    }
    remove(obj.x + " " + obj.y, obj);
}

function remove(k, obj) {
    if (world.map.has(k)) {
        let m = world.map.get(k);
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
    p.tp = meta.player;
    let data = {};
    p.data = data;
    p.tp.onCreate(data);
    for (let a = 0; a < 9; a++) {
        p.wound[a] = "life";
    }
    addtoMap(p.x, p.y, p);
    world.player.push(p);
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
        for (let p of world.player) {
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
    if (world.logic.has(t)) {
        let i = world.logic.get(t);
        i.push(obj);
        world.logic.set(t, i);
    } else {
        world.logic.set(t, [obj]);
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
    world.cnId++;
    return world.cnId;
}

function addtoMap(x, y, obj) {
    addkey(x + " " + y, obj);
    obj.x = x;
    obj.y = y;
    obj.carrier = false;
}

function addkey(k, obj) {
    if (world.map.has(k)) {
        let i = world.map.get(k);
        i.push(obj);
        world.map.set(k, i);
    } else {
        world.map.set(k, [obj]);
    }
}

world.createObj = (tp, x, y) => {
    let data = {};
    if (tp.onCreate) {
        tp.onCreate(data);
    }
    let o = {x: x, y: y, id: makeid(), tp, data};


    addtoMap(x, y, o);
    world.obj.push(o);

    if (tp.onTurn) {
        let t = world.time + _.random(99);

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
    let inv = world.map.get(key);
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

world.move = function (obj, dir) {
    if (_.isFinite(obj.x) && _.isFinite(obj.y)) {
        let x = obj.x + (dir.x);
        let y = obj.y + (dir.y);
        // if (obj.x === false || obj.y === false) {
        //     world.error = "move (obj.x && obj.y) == false";
        //     return false;
        // }

        // if (world.map.has(x + " " + y)) {
        if (!_.any(world.map.get(x + " " + y), (e) => {
            return e.tp.isSolid;
        })) {
            world.relocate(obj, x, y);
        }
        // }
    }
    return false;
};

world.addWound = (player, wound) => {
    if (!player.data.died) {
        let ok = true;
        for (let x in player.wound) {
            if (player.wound[x] == "life" && ok) {
                player.wound[x] = wound;
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

world.removeWound = (player, wound) => {
    if (wound) {
        for (let x in player.wound) {
            if (player.wound[x] === wound) {
                player.wound[x] = "life";
                return true;
            }
        }
    } else {
        for (let x in player.wound) {
            if (player.wound[x] !== 'life') {
                player.wound[x] = "life";
                return true;
            }
        }
    }
};
world.isInInv = (obj, carrier) => {
    let arr = world.objArrInInv(carrier);
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
    let t = world.time + time;
    addtologic(obj, t);
};

world.transform = (obj, tp) => {
    obj.tp = tp;
    if (tp.onCreate) {
        let data = {};
        obj.tp.onCreate(data);
        obj.data = data;
    }
    if (tp.onTurn) {
        world.nextTurn(1, obj);
    }
};

world.objArrInPoint = (x, y) => {
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
    let obj = world.map.get(x + " " + y);
    if (obj) {
        if (obj.length > 0) {
            return obj;
        }
    }
    // }
    return [];
    // return false;
};

world.objArrInInv = (obj) => {
    if (world.map.has(obj.id)) {
        let arr = world.map.get(obj.id);
        if (arr.length > 0) {
            return arr;
        }
    }
    return false;
};

world.findInPoint = (tp, x, y) => {
    let o = world.objArrInPoint(x, y);
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
            world.createObj(a.m, _.random(start, wid), _.random(start, wid));
        }
    }
};

module.exports = world;