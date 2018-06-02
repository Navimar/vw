/**
 * Created by igor on 14/02/2017.
 */
const fs = require('fs');
const exe = require('./execute');
const user = require('./user');
const send = require('./send');
const world = require('./world');

const event = {};

let tick = 0;
module.exports = event;


event.init = () => {
    let val = {
        event: 'init',
    };
    saveEvent(val);
    exe.onInit();
    // send.web();
};

event.tick = (val) => {
    saveEvent(val);
    send.web(exe.onTick());
};

event.bot = (val) => {
    switch (val.event) {
        case '/start':
            exe.onBotStart(val);
            send.bot(val.id, "Hello, you are registered now");
            saveEvent(val);
            break;
        case '/login':
            // exe.onBotLogin(val);
            send.login(val.id);
            // saveEvent(val);
            break;
        case '/friend':
            let msg = exe.onBotFriend(val);
            send.bot(val.id, msg);
            saveEvent(val);
            break;
        case '/check':
            exe.onBotCheck(val);


            break;
        // case '/ntd':
        //     val.id = val.msg.from.id;
        //     saveEvent(val);
        //     token = user.setKey(val.msg.from.id);
        //     send.bot(val.msg.from.id, config.ip + ":" + config.port + "/ntd.html?id=" + val.msg.from.id + "&key=" + token);
        //     break;
    }
};

event.login = (u, socket, pass) => {
    user.login(u, socket, pass);
};
event.unregistered=(id,socket)=>{
    send.error(id,socket,id+' is unregistered, please type /start to bot');
};

event.order = (p, order) => {
    if (!p.data.died) {
        // if (p.lastorder.name !== order.name || p.lastorder.val.id !== order.val.id) {
        //     console.log(p.lastorder);
        //     console.log(order);
        // p.lastorder = order;
        if (order.name == "move" || order.name == "stop") {
            p.order = order;
        }
        if (order.name == 'take') {
            let obj = world.objArrInPoint(p.x, p.y);
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
            let inv = world.map.get(p.id);
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
        if (order.name === 'use') {
            // if (Math.abs(order.val.targetX - p.x) < 1 && Math.abs(order.val.targetY - p.y) < 1) {
            let targetArr = world.objArrInPoint(order.targetX, order.targetY);
            if (targetArr) {
                targetArr.sort((a, b) => {
                    if (a.tp.z > b.tp.z) {
                        return -1;
                    } else return 1;
                });
                order.target = targetArr[0];
                // console.log('target');
                // console.log(order.target);
                if (order.from === 'ground') {
                    let obj = world.objArrInPoint(p.x, p.y);
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
                    let inv = world.map.get(p.id);
                    let f = true;
                    if (inv) {
                        for (let i of inv) {
                            if (i.id === order.id) {
                                // console.log('tool ');
                                // console.log(i);
                                order.tool = i;
                                f = false;
                                break;
                            }
                        }
                    } else {
                        // console.log('wrong tool from inv place');
                    }
                    if (f) {
                        // console.log('wrong tool from inv id');
                    } else {
                        p.order = order;
                    }
                }
            }
        }
    }else{
        p.order.name = 'respawn';
    }
};

event.emit = (val) => {
    switch (val.event) {
        case 'connection':
            saveEvent(val);
            exe.connection();
            break;
        case 'disconnect':
            saveEvent(val);
            exe.disconnect();
            break;
        // case 'ntd-load':
        //     for (let u of user.list) {
        //         if (u.socket == val.socket) {
        //             // console.log('emit');
        //             // console.log(u.ntd);
        //             val.socket.emit('model', JSON.stringify(u.ntd));
        //         }
        //     }
        //     break;
        // case 'ntd-save':
        //     val.id = user.bySocket(val.socket).id;
        //     if (val.id) {
        //         saveEvent(val);
        //         exe.onNtdSave(val.id, val.msg);
        //     } else {
        //         val.socket.disconnect('unauthorized');
        //     }
        //     break;
    }
};

function saveEvent(val) {
    if (val.event != 'tick') {
        // val.date = Date.now();
        // const data = {
        //     id: val.id,
        //     event: val.event,
        //     msg: val.msg,
        //     // socket:val.socket,
        //     date: Date.now()
        // };
        const data = {
            val,
            date: Date.now()
        };
        if (tick > 0) {
            data.tick = tick;
            tick = 0;
        }
        // console.log(data);
        fs.appendFile(event.path, JSON.stringify(data) + "\n", function (err) {
            if (err !== null) {
                console.log(err);
                throw 'log writing error';
            }
        });

    } else {
        tick++;
    }
}

// out = (dtStartLoop) => {
//
// };

