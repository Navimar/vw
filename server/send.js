/**
 * Created by igor on 18/02/2017.
 */
const user = require('./user');
const bot = require('./bot');

const config = require('./config');


const send = {};

send.web = () => {
    for (let theUser of user.list) {
        if (theUser.socket != null) {
            let data = {
                holst:[],
                obj:[],
                wound:[],
            };
            // for (let x = 0; x < 9; x++) {
            //     data.holst[x] = [];
            //     // data.wound.push(theUser.wound[x]);
            //     for (let y = 0; y < 9; y++) {
            //         data.holst[x][y] = [];
            //         let key = theUser.x + x - 4 + " ";
            //         key += theUser.y + y - 4;
            //         if (world.map.has(key)) {
            //             for (let r of world.map.get(key)) {
            //                 let img =
            //                     _.isFunction(r.tp.img) ?
            //                         r.tp.img(r.data)
            //                         :
            //                         r.tp.img;
            //                 data.obj.push({x: x, y: y, img, id: r.id});
            //             }
            //         } else {
            //             // send.holst[x][y] = ["grass"];
            //         }
            //     }
            // }
            data.inv = [];
            // if (world.map.has(theUser.id)) {
            //     for (let i of world.map.get(theUser.id)) {
            //         let img =
            //             _.isFunction(i.tp.img) ?
            //                 i.tp.img(i.data)
            //                 :
            //                 i.tp.img;
            //         data.inv.push({img, id: i.id});
            //     }
            // }
            // data.px = theUser.x;
            // data.py = theUser.y;
            // data.dirx = theUser.dirx;
            // data.diry = theUser.diry;
            // data.hand = theUser.hand;
            // data.message = theUser.message;
            // // send.delay = Date.now() - dtStartLoop;
            // data.cnMass = world.cnMass;
            // data.cnActive = world.cnActive;
            // data.error = world.error;
            // data.connected = world.connected;
            // data.time = world.time;
            // // send.dirx = p.dirx;
            // // send.diry = p.diry;
            theUser.socket.emit('updateState', data);
        }
    }
};
send.bot = (id,text) =>{
    bot.sendMessage(id, text);
};
send.login = (id) => {
    let token = user.setKey(id);
    send.bot(id, config.ip + ":" + config.port + "/?id=" + id + "&key=" + token);
};

module.exports = send;
