const event = require('./event');
const user = require('./user');
const exe = require('./execute');
const world = require('./world');

let handle = {};

handle.socket = (socket, eventName, msg) => {

    if (eventName == 'login') {
        let u = user.byId(msg.id);
        event.login(u, socket, msg.pass);
    }
    if (eventName == 'connection') {
        // let u = user.bySocket(socket);
        // exe.connection(u);
    }
    if (eventName == 'order') {
        let p = world.playerBySocket(socket);
        event.order(p, {name: msg.name, val: msg.val})
    }

    // let val = {};
    // val.socket = socket;
    // val.event = eventName;
    // val.msg = message;
    // event.emit(val);
};

handle.bot = () => {

};

module.exports = handle;
