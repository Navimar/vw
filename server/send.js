/**
 * Created by igor on 18/02/2017.
 */
const user = require('./user');
const bot = require('./bot');

const send = {};

send.web = () => {
    // for (let theUser of user.list) {
    //     if (theUser.socket != null) {
    //         let send = {
    //             holst:[],
    //             obj:[],
    //             wound:[],
    //         };
    //         for (let x = 0; x < 9; x++) {
    //             send.holst[x] = [];
    //             send.wound.push(p.wound[x]);
    //             for (let y = 0; y < 9; y++) {
    //                 send.holst[x][y] = [];
    //                 let key = p.x + x - 4 + " ";
    //                 key += p.y + y - 4;
    //                 if (world.map.has(key)) {
    //                     for (let r of world.map.get(key)) {
    //                         let img =
    //                             _.isFunction(r.tp.img) ?
    //                                 r.tp.img(r.data)
    //                                 :
    //                                 r.tp.img;
    //                         send.obj.push({x: x, y: y, img, id: r.id});
    //                     }
    //                 } else {
    //                     // send.holst[x][y] = ["grass"];
    //                 }
    //             }
    //         }
    //         send.inv = [];
    //         if (world.map.has(p.id)) {
    //             for (let i of world.map.get(p.id)) {
    //                 let img =
    //                     _.isFunction(i.tp.img) ?
    //                         i.tp.img(i.data)
    //                         :
    //                         i.tp.img;
    //                 send.inv.push({img, id: i.id});
    //             }
    //         }
    //         send.px = p.x;
    //         send.py = p.y;
    //         send.dirx = p.dirx;
    //         send.diry = p.diry;
    //         send.hand = p.hand;
    //         send.message = p.message;
    //         // send.delay = Date.now() - dtStartLoop;
    //         send.cnMass = world.cnMass;
    //         send.cnActive = world.cnActive;
    //         send.error = world.error;
    //         send.connected = world.connected;
    //         send.time = world.time;
    //         // send.dirx = p.dirx;
    //         // send.diry = p.diry;
    //         p.socket.emit('updateState', send);
    //     }
    // }
};
send.bot = (id,text) =>{
    bot.sendMessage(id, text);
};
module.exports = send;
