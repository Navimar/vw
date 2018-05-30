/**
 * Created by igor on 16/02/2017.
 */
const _ = require('underscore');

const user = require('./user');
const world = require('./world');
const util = require('./util');
const direction = util.dir;

const send = require('./send');


const exe = {};

let token = null;

exe.wrapper = (me) => {
    return {
        me,
        findinInv: (tp) => {
            if (Array.isArray(tp)) {
                for (let t of tp) {
                    let i = world.inv(t, me);
                    if (i) return i;
                }
            } else {
                return world.inv(tp, me)
            }
        },
        inv: () => {
            let i = world.map.get(me.id);
            if (i) {
                return i.length
            } else {
                return 0
            }
        },
        isHere: (tp) => {
            if (!Array.isArray(tp)) tp = [tp];
            for (let t of tp) {
                let i = world.lay(t, me.x, me.y);
                if (i) return i;
            }
        },
        move: (dir) => world.move(me, dir),
        movetrought: (dir) => {
            let x = me.x + dir.x;
            let y = me.y + dir.y;
            world.relocate(me, x, y)
        },
        relocate: (x, y) => world.relocate(me, x, y),
        dirRnd: util.dirs[_.random(3)],
        nextTurn: (time) => world.nextTurn(time, me),
        transform: (obj, tp) => world.transform(obj, tp),
        pickUp: (tp) => {
            if (!Array.isArray(tp)) tp = [tp];
            for (let t of tp) {
                let i = world.pickUp(me, t);
                if (i) return i;
            }
        },
        drop: (obj) => {
            if (!obj) {
                obj = world.map.get(me.id);
                if (obj) obj = obj[0];
            }
            if (obj) {
                world.drop(obj, me.x, me.y);
            } else {
                return false
            }
        },
        dropAll: () => {
            let a = world.map.get(me.id);
            if (a)
                for (let o of a) {
                    world.drop(o, me.x, me.y)
                }
        },
        getOut: (x, y) => {
            if (me.carrier) {
                world.drop(me, x, y)
            }
        },
        trade: (obj) => world.trade(me, obj),
        removeWound: (player, string) => {
            return world.removeWound(player, string)
        },
        addWound: (player, string) => {
            return world.addWound(player, string)
        },
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
            return {xWant, yWant};
        },
        find: (target) => world.find(target, me.x, me.y),
    };
};
exe.onInit = () => {
    world.init();
    world.start();
    // let dtStartLoop = Date.now();
    // for (let a = 0; a < 50000; a++) {
    //     exe.onTick();
    //     console.log(a);
    // }
    // console.log('finish ' + (Date.now() - dtStartLoop));
};
exe.onTick = () => {
    let dtStartLoop = Date.now();
    for (let p of world.player) {
        if (p.tire <= 0) {
            // console.log()
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
                    let tool = p.order.tool;
                    if (_.isFunction(tool.tp.onApply)) {
                        tool.tp.onApply(p.order.target, exe.wrapper(tool));
                    } else {
                        console.log("can not apply " + JSON.stringify(tool.tp));
                    }
                    p.order = {};
                    break;
                case "take":
                    let take = p.order.take;
                    if (take.x == p.x && take.y == p.y) {
                        if (_.isFunction(take.tp.onTake)) {
                            take.tp.onTake(p, exe.wrapper(take));
                        } else {
                            if (!take.tp.isSolid && !take.tp.isNailed) {
                                world.put(take, p);
                                // console.log('PUT');
                            }
                        }
                        p.order = {};
                    } else {
                        console.log("cant take from another cell");
                    }
                    break;
                case "drop":
                    let drop = world.isInInv(p.order.drop, p);
                    if (drop) {
                        if (_.isFunction(drop.tp.onDrop)) {
                            drop.tp.onDrop(p, exe.wrapper(drop));
                        } else {
                            world.drop(drop, p.x, p.y);
                        }
                    }
                    break;
                case "respawn":
                    p.tire = 7;
                    if (!world.removeWound(p)) {
                        p.data.died = false;
                        p.x = _.random(p.x - 30, p.x + 30);
                        p.y = _.random(p.y - 30, p.y + 30);
                        p.dirx = 0;
                        p.diry = 0;
                        p.order.name = "stop";
                        p.order.val = 0;
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
            if (world.removeWound(p, 'glut')) {
                p.satiety = 300;
            } else {
                p.satiety = 1000;
                world.addWound(p, "hungry");
                world.removeWound(p, "bite");
            }
        }
    }

    let m = 0;
    let go = world.logic.get(world.time);
    if (go != undefined) {
        for (let me of go) {
            if (me.nextTurn === world.time) {
                if (me.tp.onTurn) {
                    let wd = exe.wrapper(me);
                    me.tp.onTurn(me.data, wd);
                }
            }
            m++;
        }
    } else {
        // console.log('nobody is moving '+world.time);
    }
    world.cnActive = m;
    world.logic.delete(world.time);
    world.time++;
    return dtStartLoop;
};

exe.onLoginBot = (val) => {
    token = user.setKey(val.msg.from.id);
    send.bot(val.msg.from.id, config.ip + ":" + config.port + "/?id=" + val.msg.from.id + "&key=" + token);
};
//
// exe.onNtdBot = (msg) => {
//     login(msg);
//     bot.sendMessage(msg.from.id, config.ip + ":" + config.port + "/ntd.html?key=" + token);
// };

// exe.onNtdSave = (id, data) => {
//     let u = user.byId(id);
//     // console.log(u);
//     if (data.delete) {
//         // console.log('splice:');
//         // console.log(data);
//         for (let t in u.ntd) {
//             if (u.ntd[t].id == data.id) {
//                 u.ntd.splice(t, 1);
//             }
//         }
//     } else {
//         if (data.update) {  //
//             // console.log('upd:');
//             // console.log(data);
//             for (let t in u.ntd) {
//                 if (u.ntd[t].id == data.id) {
//                     u.ntd[t] = data;
//                 }
//             }
//         }
//         else {
//             u.ntd.push(data);
//         }
//     }

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
// }
// ;
// exe.apply = (dir, p) => {
//     let tool = world.map.get(p.id);
//     if (tool == undefined) {
//         handTool();
//     } else {
//         tool = tool[p.order.n - 1];
//         if (tool == undefined) {
//             handTool();
//         }
//     }
//
//     function handTool() {
//         tool = {};
//         tool.tp = {
//             onApply: (obj, wd) => {
//                 switch (obj.tp) {
//                     case "space":
//                         break;
//                     default:
//                         world.put(obj, p);
//                         break;
//                 }
//             }
//         }
//     }
//
//     let x = p.x + dir.x;
//     let y = p.y + dir.y;
//     let o = world.map.get(x + " " + y);
//     if (o && o.length > 0) {
//         o.sort((a, b) => {
//             return b.tp.z - a.tp.z;
//         });
//         if (_.isFunction(tool.tp.onApply)) {
//             return tool.tp.onApply(o[0], exe.wrapper(tool));
//         }
//     } else {
//         if (_.isFunction(tool.tp.onApply)) {
//             return tool.tp.onApply({tp: "space", x, y}, exe.wrapper(tool));
//         } else {
//             return wrapper(tool).getOut(x, y);
//         }
//     }
// };
exe.connection = () => {
    world.connected++;
    // user.player = (world.addPlayer()
    //show player
};
exe.disconnect = () => {
    world.connected--;
    //hide player
};

exe.onBotStart = (val) => {
    user.new(val.username, val.id);
};

exe.onBotFriend = (val) => {
    let friend = user.byName(val.words[1].substr(1));
    if (friend) {
        user.makeFriend(user.byId(val.id), friend);
        return (val.words[1] + " is your friend now");
    } else {
        return ("User with name " + val.words[1] + " is not registered");
    }
};

exe.onBotCheck = (val) => {
    let way = user.findway(user.byId(val.id), user.byName(val.words[1].substr(1)));
    let txt = "";
    if (!way) {
        send.bot(val.id, val.words[1] + " is nobody");
    } else {
        for (let w of way) {
            for (let person of w) {
                txt += "@" + person.username + " => ";
            }
        }
        txt += val.words[1];
    }
    send.bot(val.id, txt);
};

module.exports = exe;



