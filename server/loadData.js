/**
 * Created by igor on 16/02/2017.
 */
const exe = require('./execute');
const user = require('./user');

module.exports = () => {
const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('data/log.txt')
});

lineReader.on('line', function (line) {
    // console.log(line);
    let val = JSON.parse(line);
    switch(val.event){
        case 'tick':
            exe.onLoop();
            break;
        case '/login':
            exe.onLoginBot(val.msg);
            break;
        case '/ntd':
            user.setKey(val.msg.from.id);
            ///?????
            break;
        case 'ntd-load':
            ///?????
            break;
        case 'ntd-save':
            // console.log('load '+val.id);
            exe.onNtdSave(val.id,val.msg);
            break;
        case 'connection':
            exe.connection();
            break;
        case 'login':
            // exe.onLogin(val);
            break;
        case 'disconnect':
            exe.disconnect();
            break;
        case 'order':
            break;
        default:
            console.log(val);
            throw 'unknown scribe';
    }
});
};
