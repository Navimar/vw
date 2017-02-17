/**
 * Created by igor on 16/02/2017.
 */
const _ = require('underscore');
const sha = require("sha256");
const fs = require('fs');

const config = require('./config');
const bot = require('./bot');
const world = require('./world');
const util = require('./util');
const direction = util.dir;

const exe = {};

let token = null;

exe.wrapper = (me) => {
    return {
        me,
        inv: (tp) => world.inv(tp, me),
        isHere: (tp) => world.lay(tp, me.x, me.y),
        move: (dir) => world.move(me, dir),
        dirRnd: util.dirs[_.random(3)],
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
            if (xWant > yWant) {
                goX();
            } else {
                goY();
            }
            world.move(me, dir);
        },
        find: (target) => world.find(target, me.x, me.y),
    };
};
exe.onLoop = () => {
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
                let wd = exe.wrapper(me);
                me.tp.onTurn(me.data, wd);
            }
            m++;
        }
    }
    world.cnActive = m;
    world.logic.delete(world.time);
    world.time++;
    return dtStartLoop;
};
exe.onOrder = (socket, val)=> {
    for (let p of world.player) {
        if (p.socket == socket) {
            p.order = val.order;
            p.targetx = val.targetx;
            p.targety = val.targety;
        }
    }
}
exe.onLogin = (val) => {
    val.socket.emit('login', l(val.msg.pass, val.socket, val.msg.name));

    function l(val, socket, name) {
        let key = sha(val);
        // console.log(key);
        let fl = true;
        for (let item of world.player) {
            // console.log("p");
            // console.log(item.key);
            // console.log("k");
            // console.log(key);
            if (item.key === key) {
                item.socket = socket;
                item.name = name;
                item.key = null;
                fl = false;
                return ("succecs loged in " + item.name);
            }
        }
        if (fl) {
            return ("authentication error");
        }
    }
};
exe.out = (dtStartLoop) => {
    let send = {};
    for (let p of world.player) {
        if (p.socket != null) {
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
};
exe.onLoginBot = (msg) => {
    login(msg);
    bot.sendMessage(msg.from.id, config.ip + ":" + config.port + "/?key=" + token);
};
exe.onNtdBot = (msg) => {
    login(msg);
    bot.sendMessage(msg.from.id, config.ip + ":" + config.port + "/ntd.html?key=" + token);
};
exe.onNtdLoad = (val) => {
    for (let p of world.player) {
        if (p.socket == val.socket) {
            fs.readFile("ntddata/" + sha(p.chatId + "") + ".txt", 'utf8', function (err, data) {
                if (err) {
                    return console.log("load error " + err);
                }
                // console.log(p.chatId);
                // console.log(sha(p.chatId+""));
                val.socket.emit('model', data);
            });
        }
    }
};
exe.onNtdSave = (val) => {
    let fl = true;
    for (let p of world.player) {
        if (p.socket == val.socket) {
            fs.writeFile("ntddata/" + sha(p.chatId + "") + ".txt", val.msg, function (err) {
                if (err) return console.log("save error " + err);
            });
            fl = false;
        }
    }
    if (fl) {
        val.socket.disconnect('unauthorized');
    }
};
exe.apply = (dir, p) => {
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
            return tool.tp.onApply(o[0], exe.wrapper(tool));
        }
    } else {
        if (_.isFunction(tool.tp.onApply)) {
            return tool.tp.onApply({tp: "space", x, y}, exe.wrapper(tool));
        } else {
            return wrapper(tool).getOut(x, y);
        }
    }
};
exe.connection = () => {
    world.connected++;
};
exe.disconnect = () => {
    world.connected--;
};

module.exports = exe;

function login(msg) {
    token = GenerateToken();
    let fl = true;
    for (let item of world.player) {
        if (item.chatId == msg.from.id) {
            item.key = sha(token);
            fl = false;
            // console.log("old player");
        }
    }
    if (fl) world.addPlayer(sha(token), null, "name", msg.from.id);
}
function GenerateToken(stringLength) {
    // set the length of the string
    if (stringLength == undefined) {
        stringLength = 35;
    }
    // list containing characters for the random string
    let stringArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '!', '?'];


    let rndString = "";

    // build a string with random characters
    for (let i = 1; i < stringLength; i++) {
        let rndNum = Math.ceil(Math.random() * stringArray.length) - 1;
        rndString = rndString + stringArray[rndNum];
    }
    return rndString;
}
