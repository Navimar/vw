/**
 * Created by igor on 16/02/2017.
 */
const _ = require('lodash');

const user = require('./user');
const world = require('./world');
const util = require('./util');
const direction = util.dir;
const random = util.random;
const config = require('./config.js');

const fs = require('fs');
const CircularJSON = require('circular-json');

const send = require('./send');
const wound = require('./meta').wound;
const meta = require('./meta').meta;
const load = require('./load');

const exe = {};

let token = null;
let laststatarr = [];

exe.wrapper = (me, theWound) => {
    return {
        me,
        wound,
        center: {
            x: world.center.x,
            y: world.center.y,
        },
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
        inv: (obj) => {
            if (!obj) {
                obj = me;
            }
            return world.inv(obj);
        },
        isHere: (tp) => {
            if (tp) {
                if (!Array.isArray(tp)) tp = [tp];
                for (let t of tp) {
                    let i = world.lay(t, me.x, me.y);
                    if (i && i !== me) return i;
                }
            } else {
                let a = world.point(me.x, me.y);
                if (a) {
                    if (a[0] !== me) {
                        return a[0];
                    } else {
                        if (a[1]) {
                            return a[1];
                        }
                    }
                }
            }
            return false;
        },
        objHere: (x, y) => {
            if (!x || !y) {
                x = me.x;
                y = me.y;
            }
            return world.objArrInPoint(x, y);
        },
        move: (dir) => {
            if (!dir) {
                dir = exe.wrapper().dirRnd;
            }
            return world.move(me, dir);
        },
        goTo: (d) => {
            if (_.isFinite(d.x) && _.isFinite(d.y)) {
                d = dirTo(d.x, d.y, me).dir;
            }
            let ox = me.x;
            let oy = me.y;
            let m = false;
            if (d[0] !== direction.here) {
                m = world.move(me, d[0]);
                if (ox === me.x && oy === me.y && d[1] !== direction.here) {
                    m = world.move(me, d[1]);
                }
            }
            return m;
        },
        isNear: (tp) => {
            if (!Array.isArray(tp)) tp = [tp];
            for (let t of tp) {
                let i;
                i = world.lay(t, me.x + 1, me.y);
                if (i && i !== me) return i;
                i = world.lay(t, me.x, me.y + 1);
                if (i && i !== me) return i;
                i = world.lay(t, me.x, me.y - 1);
                if (i && i !== me) return i;
                i = world.lay(t, me.x - 1, me.y);
                if (i && i !== me) return i;
            }
            return false;
        },
        isHereNear: (tp) => {
            let f = exe.wrapper(me).isHere(tp);
            if (!f) {
                f = exe.wrapper(me).isNear(tp);
            }
            return f;
        },
        movetrought: (dir) => {
            let x = me.x + dir.x;
            let y = me.y + dir.y;
            world.relocate(me, x, y)
        },
        relocate: (x, y) => world.relocate(me, x, y),
        dirRnd: util.dirs[random(3)],
        nextTurn: (time) => world.nextTurn(time, me),
        nextAct: (time) => {
            me.wounds.push({time: world.time() + time, wound: theWound, first: false});
        },
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
        put: (obj, to) => {
            world.put(obj, to);
        },
        drop: (obj) => {
            if (!obj) {
                obj = world.inv(me);
                if (obj) obj = obj[0];
            }
            if (obj) {
                world.drop(obj, me.x, me.y);
            } else {
                return false
            }
        },
        dropAll: () => {
            let obj = world.inv(me);
            if (obj) {
                while (obj[0])
                    world.drop(obj[0], me.x, me.y);
            }
        },
        transformdropAll: (tp) => {
            let obj = world.inv(me);
            while (obj[0]) {
                world.transform(obj[0], tp);
                world.drop(obj[0], me.x, me.y);
            }
        },
        getOut: (x, y) => {
            if (me.carrier) {
                world.drop(me, x, y)
            }
        },
        // trade: (obj) => world.trade(me, obj),
        removeWound: (player, string) => {
            return world.removeWound(player, string)
        },
        addWound: (player, string) => {
            return world.addWound(player, string)
        },
        fillWound: (player, string) => {
            for (let w of player.wound) {
                if (w === wound.life) {
                    return world.addWound(player, string);
                }
            }
        },
        dirFrom: (x, y) => {
            let o = dirTo(x, y, me);
            for (let a = 0; a < 1; a++) {
                if (o.dir[a] === direction.up) {
                    o.dir[a] = direction.down
                } else if (o.dir[a] === direction.down) {
                    o.dir[a] = direction.up
                } else if (o.dir[a] === direction.left) {
                    o.dir[a] = direction.right
                } else if (o.dir[a] === direction.right) {
                    o.dir[a] = direction.left
                }
            }
            return o;
        },
        dirTo: (x, y) => {
            return dirTo(x, y, me);
        },
        find: (target, first, last) => {
            return world.find(target, me.x, me.y, first, last)
        },
        findFrom: (x, y, target, first, last) => {
            return world.find(target, x, y, first, last)
        },
        say: (text, obj, color) => {
            if (_.isArray(text)) {
                text = text[random(text.length - 1)];
            }
            if (obj.message && obj.message.text === text) {
                text += " ";
            }
            obj.message = {text, color};
        }
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
    // for (let a = 0; a < 100000; a++) {
    //     exe.onTick();
    //     console.log(a);
    // }
    // console.log('finish ' + (Date.now() - dtStartLoop));
};
exe.onTick = (isMain) => {
    let dtStartLoop = Date.now();
    for (let p of world.player()) {
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
                            meta[p.tp].onTurn(p.data, exe.wrapper(p));
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
                    if (_.isFunction(meta[tool.tp].onApply)) {
                        meta[tool.tp].onApply(p.order.target, exe.wrapper(tool), p);
                    } else {
                        console.log("can not apply " + tool.tp);
                    }
                    p.order = {};
                    break;
                case "useinv":
                    let tlfi = p.order.tool;
                    if (_.isFunction(meta[tlfi.tp].onApply)) {
                        meta[tlfi.tp].onApply(p.order.target, exe.wrapper(tlfi), p);
                    } else {
                        console.log("can not apply " + tlfi.tp);
                    }
                    p.order = {};
                    break;
                case "take":
                    let take = p.order.take;
                    if (take.x == p.x && take.y == p.y) {
                        if (_.isFunction(meta[take.tp].onTake)) {
                            meta[take.tp].onTake(take.data, exe.wrapper(take), p);
                        }
                        // else {
                        if (!meta[take.tp].isNailed) {
                            if (world.inv(p).length < 9) {
                                world.put(take, p);
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
                        if (_.isFunction(meta[drop.tp].onDrop)) {
                            meta[drop.tp].onDrop(p, exe.wrapper(drop));
                        } else {
                            world.drop(drop, p.x, p.y);
                        }
                    }
                    break;
                case "respawn":
                    p.tire = 7;
                    if (!world.removeWound(p)) {
                        exe.wrapper(p).dropAll();
                        p.data.died = 'newborn';
                        let r = random(0, 3);
                        switch (r) {
                            case 0:
                                world.relocate(p, random(config.world.start, config.world.start + world.wid()), config.world.start - 1);
                                break;
                            case 1:
                                world.relocate(p, random(config.world.start, config.world.start + world.wid()), config.world.start + world.wid() + 1);
                                break;
                            case 2:
                                world.relocate(p, config.world.start + world.wid() + 1, random(config.world.start, config.world.start + world.wid()));
                                break;
                            case 3:
                                world.relocate(p, config.world.start - 1, random(config.world.start, config.world.start + world.wid()));
                                break;
                        }
                        p.dirx = 0;
                        p.diry = 0;
                        p.order.name = "stop";
                        p.order.val = 0;
                        p.data.dir = direction.here;
                    }
                    break;
                default:
                    p.dirx = 0;
                    p.diry = 0;
                    p.order.name = "stop";
                    p.order.val = 0;
                    break;
            }

            // function moveLocal(dir) {
            //     world.move(p, dir);
            // }
        } else {
            p.tire -= 1;
        }
        p.satiety--;
        if (p.satiety <= 0) {
            if (world.removeWound(p, wound.glut)) {
                p.satiety = 300;
            } else {
                p.satiety = 1000;
                world.addWound(p, wound.hungry);
                // world.removeWound(p, "hit");
            }
        }

        p.wounds.sort((a, b) => {
            if (a.time > b.time) {
                return 1;
            } else {
                return -1;
            }
        });
        if (p.wounds[0]) {
            while (p.wounds[0].time == world.time()) {
                let i = 0;
                for (let w of p.wound) {
                    if (w === p.wounds[0].wound) {
                        i++;
                    }
                }
                if (i > 0) {
                    if (p.wounds[0].first && _.isFunction(p.wounds[0].wound.firstAct)) {
                        p.wounds[0].wound.firstAct(p, i, exe.wrapper(p, p.wounds[0].wound));
                    } else {
                        if (_.isFunction(p.wounds[0].wound.act)) {
                            p.wounds[0].wound.act(p, i, exe.wrapper(p, p.wounds[0].wound));
                        }
                    }
                }
                p.wounds.shift();
                if (!p.wounds[0]) {
                    break;
                }
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
    for (let o of world.obj()) {
        // let o =world.obj[i];
        if (o.nextTurn === world.time()) {
            if (meta[o.tp].onTurn) {
                let wd = exe.wrapper(o);
                meta[o.tp].onTurn(o.data, wd);
            }
        }
    }

    world.cnActive = m;
    world.logic().delete(world.time());
    world.timeplus();

    function isInt(num) {
        return parseInt(num) === parseFloat(num)
    }

    let save = () => {
        // fs.writeFile('data/snap.txt', CircularJSON.stringify(world.snap()), 'utf8');
        fs.writeFile('data/snap.txt', CircularJSON.stringify(world.snap()), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    };
    let stat = () => {
        let sum = 0;
        let arr = [];
        for (let o of world.obj()) {
            let ok = true;
            for (let a of arr) {
                if (a.meta === o.tp) {
                    a.q++;
                    sum++;
                    ok = false;
                    break;
                }
            }
            if (ok) {
                arr.push({meta: o.tp, q: 1})
            }
        }
        for (let a of arr) {
            a.p = Math.round((a.q / sum) * 100 * 100) / 100;
        }
        let str = "world statistic:\n";
        str += "world time: " + world.time() + "\n";
        str += "online: " + world.connected() + "\n";
        arr.sort((a, b) => {
            if (a.q > b.q) {
                return -1;
            } else {
                return 1;
            }
        });
        for (let a in arr) {
            let smile = "";
            if (laststatarr[a]) {
                if (arr[a].p > laststatarr[a].p) {
                    smile = "🔼";
                } else if (arr[a].p < laststatarr[a].p) {
                    smile = "🔻";
                }
            }
            str += arr[a].meta;
            str += " " + arr[a].p + "% " + smile + "\n";
        }
        laststatarr = arr;
        return str;
    };

    // let i = 0;
    // let x = 0;
    // let y = 0;
    // for (let p of world.player()) {
    //     i++;
    //     x += p.x;
    //     y += p.y;
    // }
    // x += config.world.start;
    // y += config.world.start;
    // i++;
    // x = Math.round(x / i);
    // y = Math.round(y / i);
    // world.center.x = x;
    // world.center.y = y;

    if ((isInt(world.time() / config.statfrequency) || world.time() === 1) && isMain) {
        send.bot(30626617, stat());
    }
    if (isInt(world.time() / config.savefrequency) && isMain) {
        // let d = new Date;
        save();
        // let a = new Date;
        // console.log(a-d);
    }
    return dtStartLoop;
};

// exe.onLoginBot = (val) => {
//     token = user.setKey(val.msg.from.id);
//     send.bot(val.msg.from.id, config.ip + ":" + config.port + "/?id=" + val.msg.from.id + "&key=" + token);
// };

exe.changeOrder = (p, order) => {
    if (p.data.died === false || p.data.died === 'newborn') {
        // if (p.lastorder.name !== order.name || p.lastorder.val.id !== order.val.id) {
        //     console.log(p.lastorder);
        //     console.log(order);
        // p.lastorder = order;
        if (order.name == "move" || order.name == "stop") {
            p.order = order;
        }
        if (order.name == 'take') {
            let obj = world.point(p.x, p.y);
            let f = true;
            if (obj) {
                for (let o of obj) {
                    if (o.id === order.id) {
                        order.take = o;
                        f = false;
                        break;
                    }
                }
            } else {
                console.log('wrong take place');
            }
            if (f) {
                console.log('wrong take id');
            } else {
                p.order = order;
            }
        }
        if (order.name == 'drop') {
            let inv = world.inv(p);
            // let inv = world.map.get(p.id);
            let f = true;
            if (inv) {
                for (let i of inv) {
                    if (i.id === order.id) {
                        order.drop = i;
                        f = false;
                        break;
                    }
                }
            } else {
                console.log('wrong drop place');
            }
            if (f) {
                console.log('wrong drop id');
            } else {
                p.order = order;
            }
        }
        if (order.name === 'useinv') {
            let check = false;
            for (let o of world.inv(p)) {
                if (o.id === order.target) {
                    order.target = o;
                    check = true;
                    break;
                }
            }
            if (check) {
                if (order.from === 'inv') {
                    let f = true;
                    for (let i of world.inv(p)) {
                        if (i.id === order.id) {
                            // console.log('tool ');
                            // console.log(i);
                            order.tool = i;
                            f = false;
                            break;
                        }
                    }
                    if (f) {
                        // console.log('wrong tool from inv id');
                    } else {
                        p.order = order;
                    }
                }
            }
        }
        if (order.name === 'use') {
            // if (Math.abs(order.val.targetX - p.x) < 1 && Math.abs(order.val.targetY - p.y) < 1) {
            let targetArr = world.point(order.targetX, order.targetY);
            if (targetArr.length > 0) {
                targetArr.sort((a, b) => {
                    if (meta[a.tp].z > meta[b.tp].z) {
                        return -1;
                    } else return 1;
                });
                order.target = targetArr[0];
                // console.log('target');
                // console.log(order.target);
                if (order.from === 'ground') {
                    let obj = world.point(p.x, p.y);
                    let f = true;
                    if (obj) {
                        for (let o of obj) {
                            if (o.id === order.id) {
                                // console.log('tool ');
                                // console.log(o);
                                order.tool = o;
                                f = false;
                                break;
                            }
                        }
                    } else {
                        // console.log('wrong tool from ground place');
                    }
                    if (f) {
                        // console.log('wrong tool from ground id');
                    } else {
                        p.order = order;
                    }
                }
                if (order.from === 'inv') {
                    let f = true;
                    for (let i of world.inv(p)) {
                        if (i.id === order.id) {
                            // console.log('tool ');
                            // console.log(i);
                            order.tool = i;
                            f = false;
                            break;
                        }
                    }
                    if (f) {
                        // console.log('wrong tool from inv id');
                    } else {
                        p.order = order;
                    }
                }
            }
        }
    } else {
        p.order.name = 'respawn';
    }
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
    world.connection();
    // world.connected++;
    //show player
};
exe.disconnect = () => {
    world.disconnect();
    // world.connected--;
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



