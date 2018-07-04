const exe = require('./execute');
const world = require('./world');
const user = require('./user');

let line =0;
let read = (val) => {
    console.log(line++);
    if (val.tick) {
        for (let t = 0;  t < val.tick;t++) {
            exe.onTick();
        }
    }
    let evt = val.val;
    switch (evt.event) {
        case 'init':
            exe.onInit(val);
            break;
        case 'login':
            if (!world.playerById(evt.user.id)) {
                    world.addPlayer(false, evt.user.id, world.center.x, world.center.x)
            }
            break;
        case '/start':
            exe.onBotStart(evt);
            break;
        case '/friend':
            exe.onBotFriend(evt);
            break;
        case 'order':
            let p = world.playerById(evt.p);
            let order = evt.order;
            exe.changeOrder(p, order);
            break;
        default:
            console.log("unknown scribe");
            console.log(evt.event);
            throw ('unknown scribe');
    }
};

module.exports = read;
