// const _ = require('underscore');
const event = require('./event');
const bot = require('./bot');
const config = require('../logic/config');
const handle = require('./handle');

const input = {};

let dtLoop = Date.now();
// let token = GenerateToken();

input.init =()=>{
  event.init();
};

// input.tick = () => {
//     setInterval(function () {
//         let dtNow = Date.now();
//         if (dtNow >= dtLoop + 100) {
//             dtLoop = dtNow;
//             event.tick({event: 'tick'});
//         }
//     }, 0);
// };
/**
 Length of a tick in milliseconds. The denominator is your desired framerate.
 e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
 */
let tickLengthMs = 1000 / config.world.speed;


/* gameLoop related variables */
// timestamp of each loop
let previousTick = Date.now();
// number of times gameLoop gets called
let actualTicks = 0;


var update = function(delta) {
    aVerySlowFunction(10)
};

/**
 A function that wastes time, and occupies 100% CPU while doing so.
 Suggested use: simulating that a complex calculation took time to complete.
 */
var aVerySlowFunction = function(milliseconds) {
    // waste time
    let start = Date.now();
    while (Date.now() < start + milliseconds) { }
};

input.tick = () => {
    tickLengthMs = 1000 / config.world.speed;
    let now = Date.now();
    actualTicks++;
    if (previousTick + tickLengthMs <= now) {
        let delta = (now - previousTick) / 1000;
        previousTick = now;

        // update(delta);
        event.tick();

        // console.log('delta', delta, '(target: ' + tickLengthMs +' ms)', 'node ticks', actualTicks);
        actualTicks = 0;
    }

    if (Date.now() - previousTick < tickLengthMs - 16) {
        setTimeout(input.tick);
    } else {
        setImmediate(input.tick);
    }
};

input.socket = (io) => {

    io.on('connection', function (socket) {
        handle.socket(socket, 'connection');

        socket.on('disconnect', function () {
            handle.socket(socket, 'disconnect');
        });

        socket.on('order', function (msg) {
            handle.socket(socket, 'order', msg);

        });

        socket.on('login', function (msg) {
            handle.socket(socket, 'login', msg);

        });

        // socket.on('ntd-load', function () {
        //     handle.socket(socket, 'ntd-load');
        // });

        // socket.on('ntd-save', function (msg) {
        //     handle.socket(socket, 'ntd-save', msg);
        //
        // });
        socket.on('ping', function () {
            // console.log('ping');
            // socket.emit('ping');
        });
    });
};

input.bot = () => {
// Create a bot that uses 'polling' to fetch new updates

    bot.on('text', msg => {
        const words = msg.text.split(' ');
        let val = {};
        val.event = words[0];
        // val.msg = msg;
        val.words = words;
        val.username = msg.from.username;
        val.id = msg.from.id;
        // let fromId = msg.from.id;
        // // let firstName = msg.from.first_name;
        // // let reply = msg.message_id;
        // // return bot.sendMessage(fromId, `Welcome, ${ firstName }!`, { reply });
        // return bot.sendMessage(fromId, words[0]);
        event.bot(val);
        console.log(bot.meesages);
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
