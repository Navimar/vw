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

    let wid = 200;
    for (let a = 0; a < 250; a++) {
        world.createObj(meta.aphid, _.random(-wid, wid), _.random(-wid, wid));
    }
    for (let a = 0; a < 30000; a++) {
        world.createObj(meta.highgrass, _.random(-wid, wid), _.random(-wid, wid));
        world.createObj(meta.tree, _.random(-wid, wid), _.random(-wid, wid));
    }
    for (let a = 0; a < 5000; a++) {
        // world.createObj(meta.stone, _.random(-wid, wid), _.random(-wid, wid));
         world.createObj(meta.wolf, _.random(-wid, wid), _.random(-wid, wid));

    }

        loop();
}

function onTest() {
    world.initWorld();
    world.createObj(meta.aphid, 5, 5);
    world.createObj(meta.jelly, -1, -1);
    for (let a = 0; a < 30; a++) {
        for (let b = 0; b < 30; b++) {

            world.createObj(meta.highgrass, a, b);
        }
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
                        send.obj.push({x: x, y: y, img, id: r.id});
                    }
                } else {
                    // send.holst[x][y] = ["grass"];
                }
            }
        }
        send.inv = [];
        if (world.read.map.has(p.id)) {
            for (let i of world.read.map.get(p.id)) {
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
            removeWound:(player, string) => world.removeWound(player, string),
    }
        ;
    }

    function apply(dir, p) {
        let tool = world.read.map.get(p.id);
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
                        default:
                            world.put(obj, p);
                            break;
                    }
                }
            }
        }

        let x = p.x + dir.x;
        let y = p.y + dir.y;
        let o = world.read.map.get(x + " " + y);
        if (o && o.length > 0) {
            o.sort((a, b) => {
                return b.tp.z - a.tp.z;
            });
            if(_.isFunction(tool.tp.onApply)){
                tool.tp.onApply(o[0], wrapper(tool));
            }
        } else {
            if(_.isFunction(tool.tp.onApply)) {
                tool.tp.onApply({tp: "space", x, y}, wrapper(tool));
            }else{
                wrapper(tool).getOut(x, y);
            }
        }
    }


    for (let p of world.read.player) {
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
                p.tire = 7;
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
    let go = world.read.logic.get(world.read.time);
    if (go != undefined) {
        for (let me of go) {
            if (me.tp.onTurn) {
                let wd = wrapper(me);
                me.tp.onTurn(me.data, wd);
            }
            m++;
        }
    }
    world.read.cnActive = m;
    world.read.logic.delete(world.time);
    world.read.time++;
    return dtStartLoop;
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


