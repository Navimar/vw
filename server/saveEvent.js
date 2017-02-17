/**
 * Created by igor on 14/02/2017.
 */

const exe = require('./execute');

const event = {};
module.exports = event;


event.tick = () => {
    saveEvent('loop');
    exe.onLoop();
    exe.out();
};

event.bot = (val) => {
    if (saveEvent('bot', val)) {
        switch (val.event) {
            case '/login':
                exe.onLoginBot(val.msg);
                break;
            case '/ntd':
                exe.onNtdBot(val.msg);
                break;
        }
    }
};

event.emit = (val) => {
    if (saveEvent('emit', val)) {
        switch (val.event) {
            case 'connection':
                exe.connection();
                break;
            case 'disconnect':
                exe.disconnect();
                break;
            case 'login':
                exe.onLogin(val);
                break;
            case 'ntd-load':
                exe.onNtdLoad(val);
                break;
            case 'ntd-save':
                exe.onNtdSave(val);
                break;
        }
    }
};

function saveEvent() {
    return true;
}

// const lineReader = require('readline').createInterface({
//     input: require('fs').createReadStream('file.in')
// });
//
// lineReader.on('line', function (line) {
//     console.log('Line from file:', line);
// });