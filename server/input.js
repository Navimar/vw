// const _ = require('underscore');
const event = require('./event');
const bot = require('./bot');

const input = {};

let dtLoop = Date.now();
// let token = GenerateToken();

input.tick = () => {
    setInterval(function () {
        let dtNow = Date.now();
        if (dtNow >= dtLoop + 100) {
            dtLoop = dtNow;
            event.tick({event:'tick'});
        }
    }, 0);
};

input.socket = (io) => {
    function makeEvent(socket, eventName, message) {
        let val = {};
        val.socket = socket;
        val.event = eventName;
        val.msg = message;
        event.emit(val);
    }

    io.on('connection', function (socket) {
        makeEvent(socket,'connection');

        socket.on('disconnect', function () {
            makeEvent(socket, 'disconnect');
        });

        socket.on('order', function (msg) {
            // onOrder(socket, val);
            makeEvent(socket, 'order', msg);

        });

        socket.on('login', function (msg) {
            makeEvent(socket, 'login', msg);

        });

        socket.on('ntd-load', function () {
            makeEvent(socket, 'ntd-load');
        });

        socket.on('ntd-save', function (msg) {
            makeEvent(socket, 'ntd-save', msg);

        });
        socket.on('ping', function () {
            // console.log('ping');
            socket.emit('ping');
        });
    });
};

input.bot = () => {
// Create a bot that uses 'polling' to fetch new updates

    bot.on('text', msg => {
        const words = msg.text.split(' ');
        let val = {};
        val.event = words[0];
        val.msg = msg;
        event.bot(val);
        // let fromId = msg.from.id;
        // // let firstName = msg.from.first_name;
        // // let reply = msg.message_id;
        // // return bot.sendMessage(fromId, `Welcome, ${ firstName }!`, { reply });
        // return bot.sendMessage(fromId, words[0]);
    });
    // bot.on('/help', msg => {
    //     return bot.sendMessage(msg.from.id, "/login to login\n/ntd to login in ntd");
    // });
    //
    // bot.on('/add', msg =>{
    //     // command.bot();
    //     bot.sendMessage(msg.from.id, "/login to login\n/ntd to login in ntd");
    // });

    // bot.on('/friend', msg => {
    //     const words = msg.text.split(' ');
    //     if (words[1] == undefined) {
    //         return bot.sendMessage(msg.from.id, "You should type a username after '/friend'");
    //     } else {
    //         let l = words[1].charAt(0);
    //         if (l != "@") {
    //             return bot.sendMessage(msg.from.id, "The first symbol of username should be @");
    //         } else {
    //             // let id = idFromName(words[1]);
    //             // let p = players.get(id);
    //             let p = players.get(msg.from.id);
    //             p.group.push(words[1]);
    //             return bot.sendMessage(msg.from.id, words[1] + " ");
    //         }
    //     }
    // });

    //
    // bot.on('/now', msg => {
    //     fs.readFile("ntddata/" + sha(msg.from.id + "") + ".txt", 'utf8', function (err, data) {
    //         if (err) {
    //             return console.log("load error " + err);
    //         }
    //         return bot.sendMessage(msg.from.id, data);
    //     });
    // });

};

module.exports = input;
