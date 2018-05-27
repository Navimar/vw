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
    exe.onTick();
    send.web();
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

event.order = (p, order) => {
    if (order.name == "move" || order.name == "stop") {
        p.order = order;
    }
    if (order.name == 'take') {
        let obj = world.objArrInPoint(p.x, p.y);
        let f = true;
        for (let o of obj) {
            if (o.id == order.val.id) {
                order.take = o;
                f = false;
                break;
            }
        }
        if (f) {
            console.log('wrong take id');
        } else {
            p.order = order;
        }

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

