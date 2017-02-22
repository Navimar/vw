/**
 * Created by igor on 14/02/2017.
 */
const fs = require('fs');


const exe = require('./execute');
const user = require('./user');
const send = require('./send');
const config = require('./config');


const event = {};
let token;
module.exports = event;


event.tick = (val) => {
    saveEvent(val);
    exe.onLoop();
    send.web();
};

event.bot = (val) => {
    switch (val.event) {
        case '/login':
            token = user.setKey(val.msg.from.id);
            send.bot(val.msg.from.id, config.ip + ":" + config.port + "/?id=" + val.msg.from.id + "&key=" + token);
            break;
        case '/ntd':
            val.id = val.msg.from.id;
            saveEvent(val);
            token = user.setKey(val.msg.from.id);
            send.bot(val.msg.from.id, config.ip + ":" + config.port + "/ntd.html?id=" + val.msg.from.id + "&key=" + token);
            break;
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
        case 'login':
            user.login(val.msg.id, val.socket, val.msg.pass);
            break;
        case 'ntd-load':
            for (let u of user.list) {
                if (u.socket == val.socket) {
                    console.log('emit');
                    console.log(u.ntd);
                    val.socket.emit('model', JSON.stringify(u.ntd));
                }
            }
            break;
        case 'ntd-save':
            val.id = user.bySocket(val.socket).id;
            if (val.id) {
                saveEvent(val);
                exe.onNtdSave(val.id,val.msg);
            } else {
                val.socket.disconnect('unauthorized');
            }
            break;
    }
};

function saveEvent(val) {
    // val.date = Date.now();
    const data = {
        id: val.id,
        event: val.event,
        msg: val.msg,
        // socket:val.socket,
        date: Date.now()
    };
    fs.appendFile('data/log.txt', JSON.stringify(data) + "\n", function (err) {
        if (err !== null) {
            console.log(err);
            throw 'log writing error';
        }
    });
}

out = (dtStartLoop) => {

};

