const _ = require('underscore');

let world = {};
world.player = [];
var dtLoop = Date.now();

function Pt(x, y) {
    if (!_.isFinite(x)) throw "x invalid";
    if (!_.isFinite(y)) throw "y invalid";
    this.x = x;
    this.y = y;
}

Pt.prototype.plus = function (pt) {
    return new Pt(this.x + pt.x, this.y + pt.y);
};

exports.main = function main(io) {
    onStart();
    inputFromClients(io);
    loop();
};

function onStart() {
    world.obj = [];
    world.time = 0;
    world.connected = 0;
    world.map = new Map();
    world.logic = new Map();
    world.cnMass = 0;
    world.cnId = 0;

    let wid = 1000;
    for (let a = 0; a < 25000; a++) {
        addobj(_.random(-wid, wid), _.random(-wid, wid), "mammunt");
    }
    for (let a = 0; a < 300000; a++) {
        addobj(_.random(-wid, wid), _.random(-wid, wid), "highgrass");
        addobj(_.random(-wid, wid), _.random(-wid, wid), "wall");
    }
}

function loop() {
    setInterval(function () {
        if (Date.now() >= dtLoop + 100) {
            dtLoop += 100;
            onLoop();
            out();
        }
    }, 0);
}

function out() {
    let send = {};
    for (let p of world.player) {
        send.holst = [];
        send.obj = [];
        send.wound = [];
        for (let x = 0; x < 9; x++) {
            send.holst[x] = [];
            send.wound.push(p.wound[x]);
            for (let y = 0; y < 9; y++) {
                send.holst[x][y] = [];
                let key = p.x + x - 4 + " ";
                key += p.y + y - 4;
                if (world.map.has(key)) {
                    for (let r of world.map.get(key)) {
                        send.obj.push({x: x, y: y, img: r.img, id: r.id, solid: r.solid, terrain: r.terrain});
                    }
                } else {
                    // send.holst[x][y] = ["grass"];
                }
            }
        }
        if (world.map.has(p.id)) {
            send.inv = world.map.get(p.id);
        } else {
            send.inv = [];
        }
        send.px = p.x;
        send.py = p.y;
        send.dirx = p.dirx;
        send.diry = p.diry;
        send.hand = p.hand;
        send.message = p.message;
        send.delay = Date.now() - world.dtStartLoop;
        send.cnMass = world.cnMass;
        send.cnActive = world.cnActive;
        send.error = world.error;
        send.connected = world.connected;
        send.time = world.time;
        // send.dirx = p.dirx;
        // send.diry = p.diry;
        p.socket.emit('updateState', send);
    }
}

function inputFromClients(io) {
    io.on('connection', function (socket) {
        world.connected++;
        socket.on('login', function (val) {
            socket.emit('login', onLogin(val, socket));
        });
        socket.on('ping', function (val) {
            socket.emit('ping');
        });
        socket.on('order', function (val) {
            onOrder(socket, val);
        });
        socket.on('disconnect', function () {
            world.connected--;
        });
    });
}

function onLoop() {
    world.dtStartLoop = Date.now();
    for (let p of world.player) {
        if (p.x == undefined || p.y == undefined) {
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
            addtoMap(p.x, p.y, p);
            for (let a = 0; a < 9; a++) {
                p.wound[a] = "life";
            }
        } else {
            let m = true;
            if (p.tire <= 0) {
                switch (p.order) {
                    case "up":
                        p.dirx = 0;
                        p.diry = -1;
                        break;
                    case "right":
                        p.dirx = 1;
                        p.diry = 0;
                        break;
                    case "left":
                        p.dirx = -1;
                        p.diry = 0;
                        break;
                    case "down":
                        p.dirx = 0;
                        p.diry = 1;
                        break;
                    case "useup":
                        apply(p.tool, p.x, p.y - 1);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "useright":
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "useleft":
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "usedown":
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "use":
                        // use(p);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "take":
                        take(p, 0);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    default:
                        p.dirx = 0;
                        p.diry = 0;
                        p.order = "stop";
                        m = false;
                        break;
                }
                if (m) {
                    p.tire = 7;
                    move(p, p.x + p.dirx, p.y + p.diry);
                }
            } else {
                p.tire -= 1;
            }
        }
        p.satiety--;
        if (p.satiety <= 0) {
            p.satiety = 1000;
            addWound(p, "hungry");
        }
    }
    let m = 0;
    let go = world.logic.get(world.time);
    if (go != undefined) {
        for (let o of go) {
            logic(o);
            m++;
        }
    }
    world.cnActive = m;
    world.logic.delete(world.time);
    world.time++;
}

function addWound(player, wound) {
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
}

function remWound(player, wound) {
    let ok = true;
    for (let x in player.wound) {
        if (player.wound[x] == wound && ok) {
            player.wound[x] = "life";
            ok = false;
        }
    }
    if (ok) {
        return false;
    } else return true;
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

function onOrder(socket, val) {
    for (let p of world.player) {
        if (p.socket == socket) {
            p.order = val.order;
            p.targetx = val.targetx;
            p.targety = val.targety;
        }
    }
}

function onLogin(val, socket) {
    let p = {socket: socket, key: val, id: makeid()};
    world.player.push(p);
    return p.id;
}

function logic(obj) {
    function transform(obj, typ) {
        obj.typ = typ;
        obj.new = true;
        tire(1, obj);
    }

    let s = obj.typ;
    switch (s) {
        case "test":
            if (obj.new) {
                obj.img = "angel";
                world.error = "1";
                obj.new = false;
                tire(10, obj);
            } else {
                transform(obj, "test2");
            }
            break;
        case "test2":
            if (obj.new) {
                obj.img = "meat";
                transform(obj, "test");
                world.error = "2";
            }
            break;
        case "aphid":
            if (obj.new == true) {
                obj.satiety = 15;
                obj.solid = true;
                obj.img = "aphid";
                obj.terrain = false;
                obj.new = false;
            }
            else {
                obj.satiety--;
                if (obj.satiety == 0) {
                    transform(obj, "highgrass");
                }
                else {
                    if (world.map.has(obj.id)) {
                        let i = world.map.get(obj.id)[0];
                        // console.log(obj.id+":");
                        // console.log(i);
                        // transform(i, "jelly");
                        // drop(i, obj.x, obj.y);
                        obj.img = "aphid";
                    }
                    else {
                        let hg = isHere(obj.x, obj.y, "highgrass");
                        if (hg != false) {
                            obj.satiety += 15;
                            obj.img = "aphid2";
                            put(hg, obj);
                        } else {
                            if (_.random(1)) {
                                let plus = _.random(-1, 1);
                                move(obj, obj.x + plus, obj.y);
                            } else {
                                let plus = _.random(-1, 1);
                                move(obj, obj.x, obj.y + plus);
                            }
                        }
                    }
                }

            }
            tire(15, obj);
            break;
        case "mammunt":
            if (obj.new == true) {
                obj.solid = true;
                obj.img = obj.typ;
                obj.terrain = false;
                obj.new = false;
            } else {
                if (_.random(1)) {
                    let plus = _.random(-1, 1);
                    move(obj, obj.x + plus, obj.y);
                } else {
                    let plus = _.random(-1, 1);
                    move(obj, obj.x, obj.y + plus);
                }
            }
            tire(15, obj);
            break;
        case "jelly":
            if (obj.new) {
                obj.terrain = true;
                obj.solid = false;
                obj.img = obj.typ;
                obj.img = "jelly";
                obj.new = false;
                tire(50, obj);
            } else {
                transform(obj, "aphid");
            }
            break;
        case "highgrass":
            if (obj.new == true) {
                obj.terrain = true;
                obj.solid = false;
                obj.img = obj.typ;
            }
            // tire(100,obj);
            break;
        case "wall":
            if (obj.new == true) {
                obj.terrain = true;
                obj.solid = true;
                obj.img = obj.typ;
            }
            // tire(100,obj);
            break;
    }
}


function isHere(x, y, typ) {
    if (_.isFinite(x) && _.isFinite(y)) {
        let k = x + " " + y;
        if (world.map.has(k)) {
            for (let o of world.map.get(k)) {
                if (o.typ == typ) {
                    return o;
                }
            }
        }
    } else {
        world.error("isHere x or y not finite");
    }
    return false;
}


function addtoMap(x, y, obj) {
    addto(x + " " + y, obj);
    obj.x = x;
    obj.y = y;
    obj.carrier = false;
}

function addtoInv(obj, carrier) {
    addto(carrier.id, obj);
    obj.x = false;
    obj.y = false;
    obj.carrier = carrier.id;

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

function removefromInv(obj) {
    remove(obj.carrier, obj);
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

function put(obj, carrier) {
    removefromMap(obj);
    addtoInv(obj, carrier);
}

function drop(obj, x, y) {
    removefromInv(obj);
    addtoMap(x, y, obj);
}

function moveForced(obj, x, y) {
    removefromMap(obj);
    addtoMap(x, y, obj)
}

function move(obj, x, y) {
    if (obj.x === false || obj.y === false) {
        world.error = "move (obj.x && obj.y) == false";
        return false;
    }
    let solid = false;
    if (world.map.has(x + " " + y)) {
        for (let o of world.map.get(x + " " + y)) {
            if (o.solid == true) {
                solid = true;
            }
        }
    }
    if (!solid) {
        moveForced(obj, x, y);
    } else {
        return false;
    }
    return true;

}

function addobj(x, y, typ) {
    let o = {x: x, y: y, id: makeid(), typ: typ, img: "loading", new: true, terrain: true};
    addtoMap(x, y, o);
    let t = world.time + _.random(100);
    addtologic(o, t);
    world.cnMass++;
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

function take(p, n) {
    let k = p.x + " " + p.y;
    if (world.map.has(k)) {
        let itm = world.map.get(k)[n];
        put(itm, p);
    } else {
        return false;
    }
}

function apply(tool, x, y) {
    let key;
    let o = world.map.get(x + " " + y);
    if (o !== undefined) {
        for (let obj of o) {
            key = tool.typ + " " + obj.typ;
        }
        if (key == "hand box") {
            world.error = "apply " + key;
        }
        world.error = "apply " + key+" " +obj;
    } else {
        world.error = "apply on space";
    }

}