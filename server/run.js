const _ = require('underscore');

let world = {};
world.player = [];

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
    world.logic.set(0, []);
    world.cnMass=0;
    world.cnId=0;
    // for (let a = 0; a < 500; a++) {
    //     addobj(_.random(-50, 50), _.random(-50, 50), "aphid");
    // }
    let wid = 150;
    for (let a = 0; a < 30000; a++) {
        addobj(_.random(-wid, wid), _.random(-wid, wid), "highgrass");
    }
    for (let a = 0; a < 1; a++) {
        addobj(1, 1, "jelly");
    }

    // world.terrain = [];
    // for (let x = -1000; x < 1000; x++) {
    //     world.terrain[x] = [];
    //     for (let y = -1000; y < 1000; y++) {
    //         if (_.random(1)) {
    //             world.terrain[x][y] = "highgrass";
    //         } else {
    //             // world.terrain[x][y] = "grass";
    //         }
    //     }
    // }
}

function loop() {
    setInterval(function () {
        onLoop();
        out();
    }, 1000 / 10);
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
                        send.obj.push({x: x, y: y, img: r.img, id: r.id, terrain: r.terrain});
                    }
                } else {
                    // send.holst[x][y] = ["grass"];
                }
            }
        }
        if (world.map.has(p.id)) {
            send.inv = world.map.get(p.id);
        } else {
            send.inv = [{img: "meat"}, {img: "bottle"}, {img: "highgrass"}];
        }
        send.px = p.x;
        send.py = p.y;
        send.dirx = p.dirx;
        send.diry = p.diry;
        send.hand = p.hand;
        send.message = p.message;
        send.delay = Date.now() - world.dtStartLoop;
        send.cnMass = world.cnMass;
        send.cnActive =world.active;
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
            // for (i of input){
            //     if(input[i].socket==socket){
            //         splice(input,1,i);
            //     }
            // }
            world.connected--;
            // console.log("disconnect " + Global_connected);
        });
    });
}

function onLoop() {
    world.dtStartLoop = Date.now();
    for (let p of world.player) {
        if (p.x == undefined || p.y == undefined) {
            p.x = 0;
            p.y = 0;
            p.dirx = 0;
            p.diry = 0;
            p.order = "stop";
            p.img = "hero";
            p.satiety = 1000;
            p.wound = [];
            p.tire = 0;
            p.hand = "hand";
            p.slct = 0;
            addtoMap("0 0", p);
            for (let a = 0; a < 9; a++) {
                p.wound[a] = "life";
            }
        } else {
            if (p.tire <= 0 || !_.isFinite(p.tire)) {
                // console.log(p.tire);
                let t = true;
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
                        apply(ofp(p.x, p.y - 1), p);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "useright":
                        apply(ofp(p.x + 1, p.y), p);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "useleft":
                        apply(ofp(p.x - 1, p.y), p);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "usedown":
                        apply(ofp(p.x, p.y + 1), p);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "use":
                        // use(p);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    case "take":
                        // take(p.x, p.y, p);
                        p.dirx = 0;
                        p.diry = 0;
                        break;
                    default:
                        p.dirx = 0;
                        p.diry = 0;
                        p.order = "stop";
                        t = false;
                }
                // if (p.x == p.targetx && p.y == p.targety) {
                //
                // }
                if (t) {
                    p.tire = 7;
                }
                move(p, p.x + p.dirx, p.y + p.diry);
                // let hg = isHere(p.x, p.y, "highgrass");
                // if (hg != false) {
                //     moveInv(hg, p);
                // }
            } else {
                p.tire -= 1;
            }
        }
        p.satiety--;
        if (p.satiety <= 0) {
            p.satiety = 1000;
            // addWound(p, "hungry");
        }
        //     if (condition[h] != undefined) {
        //         if (condition[h].time + 60000 < new Date().getTime()) {
        //             condition[h].connected = false;
        //         } else condition[h].connected = true;
        //         condition[h].order = input[h].order;
        //         condition[h].pt = move(condition[h].pt, input[h].order);
        //     }
        //     else {
        //         condition[h] = input[h];
        //     }
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
        function m() {
            if (_.random(1)) {
                let plus = _.random(-1, 1);
                move(obj, obj.x + plus, obj.y);
            } else {
                let plus = _.random(-1, 1);
                move(obj, obj.x, obj.y + plus);
            }
        }

            if (obj.new == true) {
                obj.satiety = 15;
                obj.solid = true;
                obj.img = "aphid";
                obj.terrain = false;
                obj.new = false;
            } else {
                obj.satiety--;
                if (obj.satiety == 0) {
                    obj.mass--;
                }
                let mass = obj.mass;
                switch (mass) {
                    case 0:
                        transform(obj, "highgrass");
                        break;
                    case 1:
                        let hg = isHere(obj.x, obj.y, "highgrass");
                        if (hg != false) {
                            obj.mass += 1;
                            obj.satiety += 15;
                            obj.img = "aphid2";
                            moveInv(hg, obj);
                        } else {
                            m();
                        }
                        break;
                    case 2:
                        if (obj.satiety < 10) {
                            let i = world.map.get(obj.id)[0];
                            transform(i, "jelly");
                            drop(obj.x, obj.y, i);
                            obj.mass--;
                            obj.img = "aphid";
                            world.error= i.id;
                        }
                        m();
                        break;
                    default:
                        break;
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
    }
}
function tire(time, obj) {
    let t = world.time + time;
    if (world.logic.has(t)) {
        let i = world.logic.get(t);
        i.push(obj);
        world.logic.set(t, i);
    } else {
        world.logic.set(t, [obj]);
    }
}

function isHere(x, y, typ) {
    let k = x + " " + y;
    if (world.map.has(k)) {
        for (let o of world.map.get(k)) {
            if (o.typ == typ) {
                return o;
            }
        }
    }
    return false;
}

function addtoMap(k, obj) {
    // let k = x + " " + y;
    if (world.map.has(k)) {
        let i = world.map.get(k);
        i.push(obj);
        world.map.set(k, i);
    } else {
        world.map.set(k, [obj]);
    }
}

function drop(x, y, obj) {
    obj.x = x;
    obj.y = y;
    removeMap(obj.id, obj);
    addtoMap(x + " " + y, obj);
}

function removeMap(key, obj) {
    if (world.map.has(key)) {
        let m = world.map.get(key);
        for (let i in m) {
            if (obj === m[i]) {
                // itm.img = "meat";
                m.splice(i, 1);
            }
        }
    }
}

function addobj(x, y, typ) {
    let o = {x: x, y: y, id: makeid(), typ: typ, img: typ, new: true, mass: 1};
    addlogic(x, y, o);
    world.cnMass++;
}

// function addter(x, y, typ) {
//     let o = {x: x, y: y, id: makeid(), typ: typ, img: typ, new: true, mass: 1, terrain: true};
//     addlogic(x, y, o);
// }

function addlogic(x, y, o) {
    addtoMap(x + " " + y, o);
    let i = world.logic.get(world.time);
    i.push(o);
    world.logic.set(world.time, i);
}

function move(obj, x, y) {
    let solid = false;
    let key = obj.x + " " + obj.y;
    if (world.map.has(key)) {
        if (world.map.has(x + " " + y)) {
            for (let o of world.map.get(x + " " + y)) {
                if (o.solid == true) {
                    solid = true;
                }
            }
        }
        if (!solid) {
            removeMap(key, obj);
            addtoMap(x + " " + y, obj);
            obj.x = x;
            obj.y = y;
        } else {
            return false;
        }
    } else {
        world.error = "wrong from " + key;
    }
    return true;
}

function moveInv(itm, obj) {
    let key = itm.x + " " + itm.y;
    if (world.map.has(key)) {
        // let m = world.map.get(key);
        // for (let i in m) {
        //     if (itm === m[i]) {
        //         // itm.img = "meat";
        //         m.splice(i, 1);
        //     }
        // }
        removeMap(key, itm);
        let k = obj.id;
        if (world.map.has(k)) {
            let i = world.map.get(k);
            i.push(itm);
            world.map.set(k, i);
        } else {
            world.map.set(k, [itm]);
        }
        itm.x = false;
        itm.y = false;
    } else {
        world.error = "wrong from itm" + key;
    }
}

function apply(obj, p) {
    // if (obj.typ == "aphid") {
    //     if (p.itm == "hand") {
    //         p.message = "привет " + obj.satiety;
    //     }
    // }
}

// function take(x, y, p) {
//     let itm = oip(x, y)[p.slct];
//     if (itm != undefined) {
//         let id = itm.id;
//         if (p.hand.typ != null) {
//             addobj(x, y, p.hand.typ);
//         }
//         p.hand = {img: itm.img || itm.typ, typ: itm.typ};
//         for (let o in world.obj) {
//             if (world.obj[o].id == id) {
//                 world.obj.splice(o, 1);
//             }
//         }
//     } else {
//         if (p.hand.typ != null) {
//             addobj(x, y, p.hand.typ);
//             p.hand = "hand";
//         }
//     }
// }

function use(p) {
    if (p.hand.typ == "jelly") {
        if (remWound(p, "hungry")) {
            p.hand = "hand";
            p.message = "Вы съели желейный кубик, он довольно вкусный если не думать о его происхождении";
        }
    }
}