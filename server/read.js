const exe = require('./execute');
const world = require('./world');
const user = require('./user');

let read = (val) => {
    console.log(val);
    if (val.tick) {
        for (let t = 0; t++; t < val.tick) {
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
                world.addPlayer(false, evt.user.id, 5200, 5200)
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
