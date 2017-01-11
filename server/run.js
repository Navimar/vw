const _ = require('underscore');
const world = require('./world');
const meta = require('./rule');
const direction = require('./util');


let dtLoop = Date.now();

exports.main = function main(io) {
    onStart();
    // onTest();
    inputFromClients(io);
};


function onStart() {
    world.initWorld();
    let wid = 100;
    for (let a = 0; a < 250; a++) {
        world.createObj(meta.aphid, 5, 5);
    }
    for (let a = 0; a < 3000; a++) {
        world.createObj(meta.highgrass, _.random(-wid, wid), _.random(-wid, wid));
        // commands.push({name: "addobj", x: _.random(-wid, wid), y: _.random(-wid, wid), typ: "highgrass"});
        // commands.push({name: "addobj", x: _.random(-wid, wid), y: _.random(-wid, wid), typ: "box"});
        // commands.push({name: "addobj", x: _.random(-wid, wid), y: _.random(-wid, wid), typ: "tree"});
    }
    loop();
}

function onTest() {
    world.make([{name: "initworld"}]);
    world.make([{name: "addobj", x: 1, y: -1, typ: "mammunt"}]);
    world.make([{name: "addobj", x: 1, y: -2, typ: "aphid"}]);
    world.make([{name: "addobj", x: 1, y: -1, typ: "oio"}, false, 0, undefined, null]);
    world.make([{name: "addobj", x: 1, y: -1, typ: "tester"}]);
    let t = "text";
    world.make([{name: 'error', text: t}]);
    world.make([{name: 'error', text: t}]);

    for (let i = 0; i < 100; i++) {
        world.make([{name: "addobj", x: i, y: -2, typ: "highgrass"}]);
    }
    for (let p of world.read.player) {

    }

    loop();
}

function loop() {
    setInterval(function () {
        let dtNow = Date.now();
        if (dtNow >= dtLoop + 100) {
            dtLoop = dtNow;
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
                        let img =
                            _.isFunction(r.tp.img) ?
                                r.tp.img(r.data)
                                :
                                r.tp.img;
                        send.obj.push({x: x, y: y, img, id: r.id, solid: r.solid});
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
            let dir;
            switch (p.order.name) {
                case "move":
                    if (p.order.val == "up") {
                        dir = direction.up;
                        p.dirx = 0;
                        p.diry = -1;
                    }
                    if (p.order.val == "right") {
                        dir = direction.right;
                        p.dirx = 1;
                        p.diry = 0;
                    }
                    if (p.order.val == "left") {
                        dir = direction.left;
                        p.dirx = -1;
                        p.diry = 0;
                    }
                    if (p.order.val == "down") {
                        dir = direction.down;
                        p.dirx = 0;
                        p.diry = 1;
                    }
                    break;
                case "use":
                    if (p.order.val == "up") {
                        commands = commands.concat(apply(tool, p.x, p.y - 1, p));
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "right") {
                        commands = commands.concat(apply(tool, p.x + 1, p.y, p));
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "left") {
                        commands = commands.concat(apply(tool, p.x - 1, p.y, p));
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "down") {
                        commands = commands.concat(apply(tool, p.x, p.y + 1, p));
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
                world.move(p, dir);
                // world.make([k]);sd
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
    world.addPlayer(val, socket);
}


function logic(obj) {

    let commands = [];

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
            if (obj.new) {
                obj.satiety = 15;
                obj.solid = true;
                obj.img = "aphid";
                obj.new = false;
            }
            else {
                obj.satiety--;
                if (obj.satiety == 0) {
                    transform(obj, "highgrass");
                }
                else {
                    if (world.read.map.has(obj.id)) {
                        let i = world.read.map.get(obj.id)[0];
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
                            // commands.push({name: "put", carrier: obj});
                            // put(hg, obj);
                        } else {
                            if (_.random(1)) {
                                let plus = _.random(-1, 1);
                                commands.push(move(obj, obj.x + plus, obj.y));
                            } else {
                                let plus = _.random(-1, 1);
                                commands.push(move(obj, obj.x, obj.y + plus));
                            }
                        }
                    }
                }
            }
            commands.push({name: "tire", obj: obj, t: 15});
            break;
        case "mammunt":
            let actions = [];
            if (obj.new == true) {
                obj.solid = true;
                obj.img = obj.typ;
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
                obj.solid = false;
                obj.img = obj.typ;
            }
            // tire(100,obj);
            break;
        case "wall":
            if (obj.new == true) {
                obj.solid = true;
                obj.img = obj.typ;
            }
            // tire(100,obj);
            break;
        case "tree":
            if (obj.new == true) {
                obj.solid = true;
                obj.img = obj.typ;
            }
            // tire(100,obj);
            break;
    }
    world.make(commands);
}

function logic(me) {
    let wd = {
        me,
        has: (tp) => world.has(me, tp),
        isHere: (tp) => world.lay(me, tp),
        move: (dir) => world.move(me, dir),
        dirRnd: direction.dirs[_.random(3)],
        nextTurn: (time) => world.nextTurn(time, me),
        transform: (obj, tp) => world.transform(obj, tp)
    };
    if (me.tp.onTurn ) {
        if (me.needSkipTurn) {
            me.needSkipTurn = undefined;
        } else {
            me.tp.onTurn(me.data, wd);
        }
    }
}

function isHere(x, y, typ) {
    if (_.isFinite(x) && _.isFinite(y)) {
        let k = x + " " + y;
        if (world.read.map.has(k)) {
            for (let o of world.read.map.get(k)) {
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


function apply(tool, x, y, p) {
    if (tool == undefined) {
        tool = {};
        tool.typ = "hand";
    }
    let commands = [];
    let key;
    let o = world.read.map.get(x + " " + y);
    if (o && o.length > 0) {
        for (let obj of o) {
            key = tool.typ + " " + obj.typ;
            switch (key) {
                case "hand box":
                    commands.push({name: "put", obj: obj, carrier: p});
                    break;
                default:
                    commands.push({name: "error", text: key + " " + o});
                    break;
            }
        }
    } else {
        key = tool.typ + " space";
        if (key == "box space") {
            commands.push({name: "drop", obj: tool, x: x, y: y});
        }
        commands.push({name: "error", text: key});
    }
    return commands;
}