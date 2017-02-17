const _ = require('underscore');
const util = require('./util.js');
const direction = util.dir;
const meta = require('./rule.js');

let world = {};

world.init = function () {
    world.player = [];
    world.time = 0;
    world.connected = 0;
    world.map = new Map();
    world.logic = new Map();
    world.cnMass = 0;
    world.cnId = 0;
    world.cnError = 1;
    world.test = true;
    world.error = "everything is fine";
    world.testfail = false;
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


world.addPlayer = (key, socket, name, chatId) => {
    let p = {
        socket,
        name,
        key,
        chatId,
        id: makeid()
    };
    p.x = 0;
    p.y = 0;
    p.solid = true;
    p.dirx = 0;
    p.diry = 0;
    p.order = "stop";
    p.order.n = 0;
    p.img = "hero";
    p.satiety = 1000;
    p.wound = [];
    p.tire = 0;
    p.tool = {typ: "hand"};
    p.slct = 0;
    p.tp = meta.player;
    for (let a = 0; a < 9; a++) {
        p.wound[a] = "life";
    }
    addtoMap(p.x, p.y, p);
    world.player.push(p);
    return p;
};

world.pickUp = (objTaker, tp) => {
    let k = objTaker.x + " " + objTaker.y;
    for (let o of world.map.get(k)) {
        if (o.tp === tp) {
            world.put(o, objTaker);
        }
    }
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
    addto(carrier.id, obj);
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
    addto(x + " " + y, obj);
    obj.x = x;
    obj.y = y;
    obj.carrier = false;
}

function addto(k, obj) {
    if (world.map.has(k)) {
        let i = world.map.get(k);
        i.push(obj);
        world.map.set(k, i);
    } else {
        world.map.set(k, [obj]);
    }
}

world.createObj = function (tp, x, y) {
    let data = {};
    if (tp.onCreate) {
        tp.onCreate(data);
    }
    let o = {x: x, y: y, id: makeid(), tp, data};
    addtoMap(x, y, o);
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
                return true
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
        let x = obj.x + dir.x;
        let y = obj.y + dir.y;
        // if (obj.x === false || obj.y === false) {
        //     world.error = "move (obj.x && obj.y) == false";
        //     return false;
        // }

        // if (world.map.has(x + " " + y)) {
        if (!_.any(world.map.get(x + " " + y), (e) => {
                return e.tp.isSolid;
            })) {
            relocate(obj, x, y);
        }
        // }
    }
    return false;
};

world.addWound = (player, wound) => {
    let ok = true;
    for (let x in player.wound) {
        if (player.wound[x] == "life" && ok) {
            player.wound[x] = wound;
            ok = false;
        }
    }
    if (ok) {
        player.message = ("Вы погибли");
    }
};

world.removeWound = (player, wound) => {
    let ok = true;
    for (let x in player.wound) {
        if (player.wound[x] == wound && ok) {
            player.wound[x] = "life";
            ok = false;
        }
    }
    return ok;
};

function relocate(obj, x, y) {
    removefromMap(obj);
    addtoMap(x, y, obj)
}

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

world.start = () => {
    let wid = 20;
    for (let a = 0; a < 25; a++) {
        world.createObj(meta.aphid, _.random(-wid, wid), _.random(-wid, wid));
    }
    for (let a = 0; a < 300; a++) {
        world.createObj(meta.highgrass, _.random(-wid, wid), _.random(-wid, wid));
        world.createObj(meta.tree, _.random(-wid, wid), _.random(-wid, wid));
    }
    for (let a = 0; a < 50; a++) {
        world.createObj(meta.wolf, _.random(-wid, wid), _.random(-wid, wid));

    }
};

world.objArrInPoint = (x, y) => {
    if (world.map.has(x + " " + y)) {
        let obj = world.map.get(x + " " + y);
        if (obj.length > 0) {
            return obj;
        }
    }
    return false;
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
    if (Array.isArray(o)) {
        for (let item of o) {
            if (tp === item.tp) {
                return item;
            }
        }
    }
    return false;
};
world.find = (tp, x, y) => {
    function findInSircle(a) {
        for (let xx = x - a; xx <= x + a; xx++) {
            for (let yy = y - a; yy <= y + a; yy++) {
                // if (Math.abs(xx - x + yy - y) == a) {
                let f = world.findInPoint(tp, xx, yy);
                if (f) return f;
                // }
            }
        }
        return false;
    }


    for (let a = 0; a < 5; a++) {
        let f = findInSircle(a);
        if (f) return f;
    }
    return false;
};

module.exports = world;