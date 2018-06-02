const event = require('./event');
const user = require('./user');
const exe = require('./execute');
const world = require('./world');

let handle = {};

handle.socket = (socket, eventName, msg) => {

    if (eventName == 'login') {
        let u = user.byId(msg.id);
        if (u) {
            return event.login(u, socket, msg.pass);
        } else {
            return event.unregistered(msg.id, socket);
        }
    }
    if (eventName == 'connection') {
        // let u = user.bySocket(socket);
        // exe.connection(u);
    }
    if (eventName == 'order') {
        let p = world.playerBySocket(socket);
        if (p) {
            // console.log(msg.val);
            let name = msg.name;
            switch (name) {
                case 'move':
                    event.order(p, {name, val: msg.val, targetx: msg.targetx, targety: msg.targety,});
                    break;
                case 'stop':
                    event.order(p, {name, val: msg.val});
                    break;
                case'use':
                    event.order(p, {
                        name,
                        id: msg.val.id,
                        from: msg.val.from,
                        targetX: msg.val.targetX,
                        targetY: msg.val.targetY,
                    });
                    break;
                case 'take':
                    event.order(p, {name, id: msg.val});
                    break;
                case 'drop':
                    event.order(p, {name, id: msg.val});
                    break;
            }
        }

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
