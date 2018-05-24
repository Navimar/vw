const exe = require('./execute');

let read = (val) => {
    switch (val.event) {
        case 'init':
            exe.onInit(val);
            break;
        case 'login':
            break;
        case '/start':
            exe.onBotStart(val);
            break;
        case '/friend':
            exe.onBotFriend(val);
            break;
        default:
            console.log(val.event);
            throw ('unknown scribe');
    }
};

module.exports = read;
