const _ = require('underscore');

let world = {};

function make(commands) {
    commands = _.compact(commands);
    commands.forEach(function (item, i, arr) {
        switch (item.name) {
            case "initworld":
                world.player = [];
                world.obj = [];
                world.time = 0;
                world.connected = 0;
                world.map = new Map();
                world.logic = new Map();
                world.cnMass = 0;
                world.cnId = 0;
                world.error = "everything is fine";
                break;
            case "addobj":
                addobj(item.typ, item.x, item.y);
                break;
            case "move":
                relocate(item.obj, item.x, item.y);
                break;
            case "addPlayer":
                addPlayer(item.val, item.socket);
                break;
            case "tire":
                tire(item.t, item.obj);
                break;
            case "take":
                take(item.player, 0);
                break;
            case "put":
                put(item.obj, item.carrier);
                break;
            case "drop":
                drop(item.obj, item.x, item.y);
                break;
            case "error":
                world.error = item.text;
                break;
            default:
                world.error = "unknown command " + item.name;
        }
    });

    function addobj(typ, x, y) {
        let o = {x: x, y: y, id: makeid(), typ: typ, img: "loading", new: true, terrain: true};
        addtoMap(x, y, o);
        let t = world.time + _.random(100);
        addtologic(o, t);
        world.cnMass++;
    }

    function addtoMap(x, y, obj) {
        addto(x + " " + y, obj);
        obj.x = x;
        obj.y = y;
        obj.carrier = false;
    }

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

    function relocate(obj, x, y) {
        removefromMap(obj);
        addtoMap(x, y, obj)
    }


    function addPlayer(val, socket) {
        p = {socket: socket, key: val, id: makeid()};
        p.x = 0;
        p.y = 0;
        p.solid = true;
        p.dirx = 0;
        p.diry = 0;
        p.order = "stop";
        p.img = "hero";
        p.satiety = 1000;
        p.wound = [];
        p.tire = 0;
        p.tool = {typ: "hand"};
        p.slct = 0;
        p.typ = "player";
        for (let a = 0; a < 9; a++) {
            p.wound[a] = "life";
        }
        addtoMap(p.x, p.y, p);
        world.player.push(p);

    }

    function take(p, n) {
        let k = p.x + " " + p.y;
        let itm = world.map.get(k)[n];
        if (itm != undefined && itm.typ != "player") {
            // console.log(itm);
            put(itm, p);
        } else {
            return false;
        }
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

    function makeid() {
        // let text = "";
        // let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        //
        // for (let i = 0; i < 12; i++)
        //     text += possible.charAt(Math.floor(Math.random() * possible.length));
        world.cnId++;
        return world.cnId;
    }

    function addtologic(obj, t) {
        if (world.logic.has(t)) {
            let i = world.logic.get(t);
            i.push(obj);
            world.logic.set(t, i);
        } else {
            world.logic.set(t, [obj]);
        }
    }

    function tire(time, obj) {
        let t = world.time + time;
        addtologic(obj, t);
    }

    function put(obj, carrier) {
        removefromMap(obj);
        addtoInv(obj, carrier);
    }

    function drop(obj, x, y) {
        removefromInv(obj);
        addtoMap(x, y, obj);
    }

    function addtoInv(obj, carrier) {
        addto(carrier.id, obj);
        obj.x = false;
        obj.y = false;
        obj.carrier = carrier.id;

    }

    function removefromInv(obj) {
        remove(obj.carrier, obj);
    }

}

module.exports.make = make;
module.exports.read = world;