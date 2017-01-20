const _ = require('underscore');
const world = require('./world');
const meta = require('./rule');
const direction = require('./util');
const fs = require('fs');

let dtLoop = Date.now();

exports.main = function main(io) {
    onStart();
    inputFromClients(io);
};

let makeTest = () => {
    function test(val, ok, text) {
        if (text == undefined) {
            text = "";
        }
        if (val === ok) {
            console.log("OK " + text);
        } else {
            console.log("ERROR!!! " + val + ", expected " + ok + " " + text);
            flTest = false;
        }
    }
    let flTest = true;
    world.initWorld("objArrInPoint");
    world.createObj(meta.test, 5, 5);
    world.createObj(meta.highgrass, 5, 5);
    test(world.objArrInPoint(5, 5)[0].tp, meta.test, "");
    test(world.objArrInPoint(5, 5)[1].tp, meta.highgrass, "");

    world.initWorld("findInPoint");
    world.createObj(meta.test, 0, 0);
    test(world.findInPoint(meta.test, 0, 0).tp.img, "angel", "find in 0 0");
    world.createObj(meta.test, -5, -5);
    test(world.find(meta.test, -4, -4).y, -5, "find in negarive coor");
    world.addPlayer();
    test(world.findInPoint(meta.player, 0, 0).x, 0, "find player");

    world.initWorld("find");
    world.createObj(meta.test, 0, 0);
    test(world.find(meta.test, 2, 2).x, 0, "find at 0 0");
    world.addPlayer();
    test(world.find(meta.player, 2, 2).x, 0, "find Player");
    world.createObj(meta.test, 5, 5);
    test(world.find(meta.test, 4, 4).y, 5);
    test(world.find(meta.test, 3, 7).y, 5);
    test(world.find(meta.test, 10, 10), false);
    test(world.find(meta.test, 5, 5).y, 5, "find same point");

    world.initWorld("apply");
    let p = world.addPlayer();
    apply(direction.right,p);
    test(world.objArrInInv(p),false,"empty not get in inv");

    return flTest;
};


function onStart() {
    if (makeTest()) {
        world.initWorld();
        world.createWorld();
        loop();
    }
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

function apply(dir, p) {
    let tool = world.map.get(p.id);
    if (tool == undefined) {
        handTool();
    } else {
        tool = tool[p.order.n - 1];
        if (tool == undefined) {
            handTool();
        }
    }
    function handTool() {
        tool = {};
        tool.tp = {
            onApply: (obj, wd) => {
                switch (obj.tp) {
                    case "space":
                        break;
                    default:
                        world.put(obj, p);
                        break;
                }
            }
        }
    }

    let x = p.x + dir.x;
    let y = p.y + dir.y;
    let o = world.map.get(x + " " + y);
    if (o && o.length > 0) {
        o.sort((a, b) => {
            return b.tp.z - a.tp.z;
        });
        if (_.isFunction(tool.tp.onApply)) {
            return tool.tp.onApply(o[0], wrapper(tool));
        }
    } else {
        if (_.isFunction(tool.tp.onApply)) {
            return tool.tp.onApply({tp: "space", x, y}, wrapper(tool));
        } else {
            return wrapper(tool).getOut(x, y);
        }
    }
}

function wrapper(me) {
    return {
        me,
        inv: (tp) => world.inv(tp, me),
        isHere: (tp) => world.lay(tp, me.x, me.y),
        move: (dir) => world.move(me, dir),
        dirRnd: direction.dirs[_.random(3)],
        nextTurn: (time) => world.nextTurn(time, me),
        transform: (obj, tp) => world.transform(obj, tp),
        pickUp: (tp) => world.pickUp(me, tp),
        drop: (obj) => world.drop(obj, me.x, me.y),
        getOut: (x, y) => world.drop(me, x, y),
        trade: (obj) => world.trade(me, obj),
        removeWound: (player, string) => world.removeWound(player, string),
        moveTo: (x, y) => {
            let dir;

            function goX() {
                if (me.x - x > 0) {
                    dir = direction.left;
                } else {
                    dir = direction.right;
                }
            }

            function goY() {
                if (me.y - y > 0) {
                    dir = direction.up;
                } else {
                    dir = direction.down;
                }
            }

            let xWant = Math.abs(me.x - x);
            let yWant = Math.abs(me.y - y);
            if (_.random(xWant) > _.random(yWant)) {
                goX();
            } else {
                goY();
            }
            world.move(me, dir);
        },
        find: (target) => world.find(target, me.x, me.y),
    };
}

function onLoop() {
    let dtStartLoop = Date.now();

    for (let p of world.player) {
        if (p.tire <= 0) {
            switch (p.order.name) {
                case "move":
                    if (p.order.val == "up") {
                        moveLocal(direction.up);
                        p.dirx = 0;
                        p.diry = -1;
                    }
                    if (p.order.val == "right") {
                        moveLocal(direction.right);
                        p.dirx = 1;
                        p.diry = 0;
                    }
                    if (p.order.val == "left") {
                        moveLocal(direction.left);
                        p.dirx = -1;
                        p.diry = 0;
                    }
                    if (p.order.val == "down") {
                        moveLocal(direction.down);
                        p.dirx = 0;
                        p.diry = 1;
                    }
                    break;
                case "use":
                    if (p.order.val == "up") {
                        apply(direction.up, p);
                        p.tire = 7;
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "right") {
                        apply(direction.right, p);
                        p.tire = 7;
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "left") {
                        apply(direction.left, p);
                        p.tire = 7;
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "down") {
                        apply(direction.down, p);
                        p.tire = 7;
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    if (p.order.val == "here") {
                        apply(direction.here, p);
                        p.tire = 7;
                        p.dirx = 0;
                        p.diry = 0;
                    }
                    break;
                default:
                    p.dirx = 0;
                    p.diry = 0;
                    p.order.name = "stop";
                    p.order.val = 0;
                    break;
            }
            function moveLocal(dir) {
                p.tire = 10;
                world.move(p, dir);
            }
        } else {
            p.tire -= 1;
        }
        p.satiety--;
        if (p.satiety <= 0) {
            p.satiety = 1000;
            world.addWound(p, "hungry");
        }
    }

    let m = 0;
    let go = world.logic.get(world.time);
    if (go != undefined) {
        for (let me of go) {
            if (me.tp.onTurn) {
                let wd = wrapper(me);
                me.tp.onTurn(me.data, wd);
            }
            m++;
        }
    }
    world.cnActive = m;
    world.logic.delete(world.time);
    world.time++;
    return dtStartLoop;
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
    world.addPlayer(val, socket);
    return ("success!");
}

function out(dtStartLoop) {
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
                        let img =
                            _.isFunction(r.tp.img) ?
                                r.tp.img(r.data)
                                :
                                r.tp.img;
                        send.obj.push({x: x, y: y, img, id: r.id});
                    }
                } else {
                    // send.holst[x][y] = ["grass"];
                }
            }
        }
        send.inv = [];
        if (world.map.has(p.id)) {
            for (let i of world.map.get(p.id)) {
                let img =
                    _.isFunction(i.tp.img) ?
                        i.tp.img(i.data)
                        :
                        i.tp.img;
                send.inv.push({img, id: i.id});
            }
        }
        send.px = p.x;
        send.py = p.y;
        send.dirx = p.dirx;
        send.diry = p.diry;
        send.hand = p.hand;
        send.message = p.message;
        send.delay = Date.now() - dtStartLoop;
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
        socket.on('ntd-load', function (val) {
            fs.readFile('data.txt', 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }
                socket.emit('model', data);
            });
        });

        socket.on('ntd-save', function (val) {
            fs.writeFile('data.txt', JSON.stringify(val), function (err) {
                if (err) return console.log(err);
            });
        });
        socket.on('disconnect', function () {
            world.connected--;
        });
    });
}