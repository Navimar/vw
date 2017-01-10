const _ = require('underscore');
const world = require('./world');

let dtLoop = Date.now();

exports.main = function main(io) {
    onStart();
    // onTest();
    inputFromClients(io);
};


function onStart() {
    let commands = [];
    commands.push({name: "initworld"});
    let wid = 100;
    for (let a = 0; a < 250; a++) {
        commands.push({name: "addobj", x: _.random(-wid, wid), y: _.random(-wid, wid), typ: "mammunt"});
    }
    for (let a = 0; a < 3000; a++) {
        commands.push({name: "addobj", x: _.random(-wid, wid), y: _.random(-wid, wid), typ: "highgrass"});
        commands.push({name: "addobj", x: _.random(-wid, wid), y: _.random(-wid, wid), typ: "box"});
    }
    world.make(commands);
    loop();
}

function onTest() {
    world.make([{name: "initworld"}]);
    world.make([{name: "addobj", x: 1, y: -1, typ: "mammunt"}]);
    world.make([{name: "addobj", x: 1, y: -1, typ: "oio"}, false, 0, undefined, null]);
    world.make([{name: "addobj", x: 1, y: -1, typ: "tester"}]);

    for (let i = 0; i < 100; i++) {
        world.make([{name: "addobj", x: i, y: -2, typ: "highgrass"}]);
    }
    for (let p of world.read.player) {

    }

    loop();
}

function loop() {
    setInterval(function () {
        if (Date.now() >= dtLoop + 100) {
            dtLoop += 100;
            out(onLoop());
        }
    }, 0);
}


function out(dtStartLoop) {
    let send = {};
    for (let p of world.read.player) {
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
                if (world.read.map.has(key)) {
                    for (let r of world.read.map.get(key)) {
                        send.obj.push({x: x, y: y, img: r.img, id: r.id, solid: r.solid, terrain: r.terrain});
                    }
                } else {
                    // send.holst[x][y] = ["grass"];
                }
            }
        }
        send.inv = world.read.map.get(p.id);
        if (send.inv == undefined) send.inv = [];
        send.px = p.x;
        send.py = p.y;
        send.dirx = p.dirx;
        send.diry = p.diry;
        send.hand = p.hand;
        send.message = p.message;
        send.delay = Date.now() - dtStartLoop;
        send.cnMass = world.read.cnMass;
        send.cnActive = world.read.cnActive;
        send.error = world.read.error;
        send.connected = world.read.connected;
        send.time = world.read.time;
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
    let dtStartLoop = Date.now();
    let commands = [];
    for (let p of world.read.player) {
        let m = true;
        if (p.tire <= 0) {
            let tool = world.read.map.get(p.id);
            if (tool == undefined) {
                tool = {};
                tool.typ = "hand";
            } else {
                tool = tool[p.order.n - 1];
            }
            switch (p.order.name) {
                case "move":
                    if (p.order.val == "up") {
                        p.dirx = 0;
                        p.diry = -1;
                    }
                    if (p.order.val == "right") {
                        p.dirx = 1;
                        p.diry = 0;
                    }
                    if (p.order.val == "left") {
                        p.dirx = -1;
                        p.diry = 0;
                    }
                    if (p.order.val == "down") {
                        p.dirx = 0;
                        p.diry = 1;
                    }
                    break;
                case "use":
                    if (p.order.val == "up") {
                        apply(tool, p.x, p.y - 1, p);
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "right") {
                        apply(tool, p.x + 1, p.y, p);
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "left") {
                        apply(tool, p.x - 1, p.y, p);
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "down") {
                        apply(tool, p.x, p.y + 1, p);
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    break;
                case "take":
                    commands.push({name: "take", player: p});
                    // take(p, 0);
                    p.dirx = 0;
                    p.diry = 0;
                    break;
                default:
                    p.dirx = 0;
                    p.diry = 0;
                    p.order.name = "stop";
                    p.order.val = 0;
                    m = false;
                    break;
            }
            if (m) {
                p.tire = 7;
                // let k = move(p, p.x + p.dirx, p.y + p.diry);
                let k = move(p, p.x + p.dirx, p.y + p.diry);
                world.make([k]);
            }
        } else {
            p.tire -= 1;
        }
        p.satiety--;
        if (p.satiety <= 0) {
            p.satiety = 1000;
            addWound(p, "hungry");
        }
    }
    let m = 0;
    let go = world.read.logic.get(world.read.time);
    if (go != undefined) {
        for (let o of go) {
            logic(o);
            m++;
        }
    }
    world.read.cnActive = m;
    world.read.logic.delete(world.time);
    world.read.time++;
    world.make(commands);
    return dtStartLoop;
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
    return ok;
}


function onOrder(socket, val) {
    for (let p of world.read.player) {
        if (p.socket == socket) {
            p.order = val.order;
            p.targetx = val.targetx;
            p.targety = val.targety;
        }
    }
}

function onLogin(val, socket) {
    world.make([{name: "addPlayer", socket: socket, val: val}]);

    // return p.id;
}

function logic(obj) {
    let commands = [];

    function transform(obj, typ) {
        obj.typ = typ;
        obj.new = true;
        // tire(1, obj);
        commands.push({name: "tire", obj: obj, t: 1});
    }

    let s = obj.typ;
    switch (s) {
        case "tester":
            if (obj.new) {
                obj.img = "angel";
                world.error = "1";
                obj.new = false;
                commands.push({name: "tire", obj: obj, t: 10});
                // tire(10, obj);
            } else {
                transform(obj, "test2");
            }
            break;
        case "test2":
            if (obj.new) {
                obj.img = "meat";
                transform(obj, "tester");
                world.error = "2";
            }
            break;
        case "box":
            if (obj.new == true) {
                obj.solid = true;
                obj.img = obj.typ;
                obj.new = false;
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
            // tire(15, obj);
            commands.push({name: "tire", obj: obj, t: 15});
            break;
        case "mammunt":
            let actions = [];
            if (obj.new == true) {
                obj.solid = true;
                obj.img = obj.typ;
                obj.terrain = false;
                obj.new = false;
            } else {
                if (_.random(1)) {
                    let plus = _.random(-1, 1);
                    commands.push(move(obj, obj.x + plus, obj.y));
                } else {
                    let plus = _.random(-1, 1);
                    commands.push(move(obj, obj.x, obj.y + plus));
                }
            }
            // tire(15, obj);
            commands.push({name: "tire", obj: obj, t: 15});
            break;
        case "jelly":
            if (obj.new) {
                obj.terrain = true;
                obj.solid = false;
                obj.img = obj.typ;
                obj.img = "jelly";
                obj.new = false;
                // tire(50, obj);
                commands.push({name: "tire", obj: obj, t: 50});
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
    world.make(commands);
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


function move(obj, x, y) {
    if (obj.x === false || obj.y === false) {
        world.error = "move (obj.x && obj.y) == false";
        return false;
    }
    let solid = false;
    if (world.read.map.has(x + " " + y)) {
        for (let o of world.read.map.get(x + " " + y)) {
            if (o.solid == true) {
                solid = true;
            }
        }
    }
    if (solid) {
    } else {
        // moveForced(obj, x, y);
        return {name: "move", obj: obj, x: x, y: y}
    }
}


function apply(tool, x, y, p) {
    if (tool == undefined) {
        tool = {};
        tool.typ = "hand";
    }
    let commands = [];
    let key;
    let o = world.read.map.get(x + " " + y);
    if (o !== undefined) {
        for (let obj of o) {
            key = tool.typ + " " + obj.typ;
            switch (key) {
                case "hand box":
                    commands.push({name: "put", obj: obj, carrier: p});
                    break;
                default:
                    commands.push({name:"error",text:key});
                    break;
            }
        }
    } else {
        key = tool.typ + " space";
        if (key == "box space") {
            commands.push({name: "drop", obj: tool, x:x,y:y});
        }
        commands.push({name:"error",text:key});
    }
    world.make(commands);
}