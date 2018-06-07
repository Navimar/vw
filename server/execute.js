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
        move: (dir) => {
            return world.move(me, dir)
        },
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
        take: (obj) => {
            world.put(obj, me);
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
            let obj = world.map.get(me.id);
            if (obj) {
                while (obj[0])
                    world.drop(obj[0], me.x, me.y);
            }
        },
        transformdropAll: (tp) => {
            let obj = world.map.get(me.id);
            if (obj) {
                while (obj[0]) {
                    world.transform(obj[0], tp);
                    world.drop(obj[0], me.x, me.y);
                }
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
        dirFrom: (x, y) => {
            let o = dirTo(x, y, me);
            for (let a = 0; a < 1; a++) {
                if (o.dir[a] === direction.up) {
                    o.dir[a] = direction.down
                }else
                if (o.dir[a] === direction.down) {
                    o.dir[a] = direction.up
                }else
                if (o.dir[a] === direction.left) {
                    o.dir[a] = direction.right
                }else
                if (o.dir[a] === direction.right) {
                    o.dir[a] = direction.left
                }
            }
            return o;
        },
        dirTo: (x, y) => {
            return dirTo(x, y, me);
        },
        find: (target, first, last) => world.find(target, me.x, me.y, first, last),
    };
};

function dirTo(x, y, me) {
    let dir = [direction.here, direction.here];
    let xWant = Math.abs(x - me.x);
    let yWant = Math.abs(y - me.y);
    let dx;
    let dy;
    if (xWant > yWant) {
        dx = 0;
        dy = 1;
    } else {
        dx = 1;
        dy = 0;
    }
    if (x - me.x > 0) {
        dir[dx] = direction.right;
    } else if (x - me.x < 0) {
        dir[dx] = direction.left;
    } else {
        dir[dx] = direction.here
    }
    if (y - me.y > 0) {
        dir[dy] = direction.down;
    } else if (y - me.y < 0) {
        dir[dy] = direction.up;
    } else {
        dir[dy] = direction.here;
    }
    return {dir, xWant, yWant};
}

exe.onInit = () => {
    world.init();
    world.start();
    // let dtStartLoop = Date.now();
    // for (let a = 0; a < 10000; a++) {
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
                // case "move":
                //     if (p.order.val == "up") {
                //         moveLocal(direction.up);
                //         p.dirx = 0;
                //         p.diry = -1;
                //     }
                //     if (p.order.val == "right") {
                //         moveLocal(direction.right);
                //         p.dirx = 1;
                //         p.diry = 0;
                //     }
                //     if (p.order.val == "left") {
                //         moveLocal(direction.left);
                //         p.dirx = -1;
                //         p.diry = 0;
                //     }
                //     if (p.order.val == "down") {
                //         moveLocal(direction.down);
                //         p.dirx = 0;
                //         p.diry = 1;
                //     }
                //     break;
                case "move":
                    if (p.order.val === "point") {
                        p.data.order = {x: p.order.targetx, y: p.order.targety};
                        if (p.x !== p.order.targetx || p.y !== p.order.targety) {
                            p.tp.onTurn(p.data, exe.wrapper(p));
                            p.dirx = 0;
                            p.diry = 0;
                            p.tire = 7;
                        }
                    }
                    // if (p.order.val == "up") {
                    //     p.data.order = {x: p.x, y: p.y - 1};
                    //     p.tp.onTurn(p.data, exe.wrapper(p));
                    //     p.dirx = 0;
                    //     p.diry = -1;
                    //     p.tire = 7;
                    // }
                    // if (p.order.val == "right") {
                    //     p.data.order = {x: p.x + 1, y: p.y};
                    //     p.tp.onTurn(p.data, exe.wrapper(p));
                    //     p.dirx = 0;
                    //     p.diry = -1;
                    //     p.tire = 7;
                    // }
                    // if (p.order.val == "left") {
                    //     p.data.order = {x: p.x - 1, y: p.y};
                    //     p.tp.onTurn(p.data, exe.wrapper(p));
                    //     p.dirx = 0;
                    //     p.diry = -1;
                    //     p.tire = 7;
                    // }
                    // if (p.order.val == "down") {
                    //     p.data.order = {x: p.x, y: p.y + 1};
                    //     p.tp.onTurn(p.data, exe.wrapper(p));
                    //     p.dirx = 0;
                    //     p.diry = -1;
                    //     p.tire = 7;
                    // }
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
                                let inv = world.map.get(p.id);
                                if (inv === undefined) {
                                    world.put(take, p);
                                } else if (inv.length < 9) {
                                    world.put(take, p);
                                }
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
                        exe.wrapper(p).dropAll();
                        p.data.died = false;
                        world.relocate(p, p.x - 30, p.x + 30);
                        // p.x = _.random(p.x - 30, p.x + 30);
                        // p.y = _.random(p.y - 30, p.y + 30);
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
    // let go = world.logic.get(world.time);
    // if (go != undefined) {
    //     for (let me of go) {
    //         if (me.nextTurn === world.time) {
    //             if (me.tp.onTurn) {
    //                 let wd = exe.wrapper(me);
    //                 me.tp.onTurn(me.data, wd);
    //             }
    //         }
    //         m++;
    //     }
    // } else {
    //     // console.log('nobody is moving '+world.time);
    // }
    for (let o of world.obj) {
        // let o =world.obj[i];
        if (o.nextTurn === world.time) {
            if (o.tp.onTurn) {
                let wd = exe.wrapper(o);
                o.tp.onTurn(o.data, wd);
            }
        }
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



