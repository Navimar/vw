/**
 * Created by igor on 18/02/2017.
 */
const _ = require('underscore');
const user = require('./user');
const bot = require('./bot');
const world = require('./world');
const config = require('./config');
const meta = require('./meta');

const send = {};

send.web = (dtStartLoop) => {
    for (let p of world.player) {
        let data = {
            holst: [],
            obj: [],
            wound: [],
            inv: [],
            ground: []
        };
        for (let x = 0; x < 9; x++) {
            // data.holst[x] = [];
            data.wound.push(p.wound[x]);
            // console.log(p.wound[x]);
            for (let y = 0; y < 9; y++) {
                //         data.holst[x][y] = [];
                let key = p.x + x - 4 + " ";
                key += p.y + y - 4;
                if (world.map.has(key)) {
                    for (let r of world.map.get(key)) {
                        let img =
                            _.isFunction(r.tp.img) ?
                                r.tp.img(r.data)
                                :
                                r.tp.img;
                        data.obj.push({x: x, y: y, img, id: r.id});
                        if (x === 4 && y === 4 && r.tp !== meta.player) {
                            data.ground.push({img, id: r.id})
                        }
                    }
                }
            }
        }

        if (world.map.has(p.id)) {
            for (let i of world.map.get(p.id)) {
                let img =
                    _.isFunction(i.tp.img) ?
                        i.tp.img(i.data)
                        :
                        i.tp.img;
                data.inv.push({img, id: i.id});
            }
        }
        data.px = p.x;
        data.py = p.y;
            data.dirx = p.dirx;
            data.diry = p.diry;
        //     // data.hand = theUser.hand;
        //     // data.message = theUser.message;
        data.delay = Date.now() - dtStartLoop;
        //     // data.cnMass = world.cnMass;
        //     // data.cnActive = world.cnActive;
        //     // data.error = world.error;
        //     // data.connected = world.connected;
        data.time = world.time;
        data.tire = p.tire;
        data.died = p.data.died;
        p.socket.emit('updateState', data);
        // }
    }
};
send.bot = (id, text) => {
    bot.sendMessage(id, text);
};
send.login = (id) => {
    // console.log("hi");
    let token = user.setKey(id);
    send.bot(id, config.ip + ":" + config.port + "/?id=" + id + "&key=" + token);
};

module.exports = send;
