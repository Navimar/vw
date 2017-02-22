/**
 * Created by igor on 16/02/2017.
 */
const _ = require('underscore');

const user = require('./user');
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
exe.onOrder = (socket, val) => {
    for (let p of world.player) {
        if (p.socket == socket) {
            p.order = val.order;
            p.targetx = val.targetx;
            p.targety = val.targety;
        }
    }
}

exe.onLoginBot = (msg) => {
};
exe.onNtdBot = (msg) => {
    login(msg);
    bot.sendMessage(msg.from.id, config.ip + ":" + config.port + "/ntd.html?key=" + token);
};

exe.onNtdSave = (id, data) => {
    let u = user.byId(id);
    // console.log(u);
    if (data.delete) {
        // console.log('splice:');
        // console.log(data);
        for (let t in u.ntd) {
            if (u.ntd[t].id == data.id) {
                u.ntd.splice(t, 1);
            }
        }
    } else {
        if (data.update) {  //
            // console.log('upd:');
            // console.log(data);
            for (let t in u.ntd) {
                if (u.ntd[t].id == data.id) {
                    u.ntd[t] = data;
                }
            }
        }
        else {
            u.ntd.push(data);
        }
    }

// }
//
// let fl = true;
// for (let p of world.player) {
//     if (p.socket == val.socket) {
//         fs.writeFile("ntddata/" + sha(p.chatId + "") + ".txt", val.msg, function (err) {
//             if (err) return console.log("save error " + err);
//         });
//         fl = false;
//     }
// }
// if (fl) {
//     val.socket.disconnect('unauthorized');
// }
}
;
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



