/**
 * Created by igor on 18/02/2017.
 */
const _ = require('underscore');
const user = require('./user');
const bot = require('./bot');
const world = require('./world');
const config = require('./config');
const meta = require('./meta.js').meta;

const send = {};

send.web = (dtStartLoop) => {
    for (let p of world.player) {
        if (p.socket) {
            let data = {
                holst: [],
                obj: [],
                wound: [],
                inv: [],
                ground: []
            };
            for (let x = 0; x < 9; x++) {
                if (!p.wound[x].describe) {
                    console.log(p.wound[x].img, "has no describe!!");
                    p.wound[x].describe = p.wound[x].img + " has no describe!"
                }
                data.wound.push({img: p.wound[x].img, describe: p.wound[x].describe});
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
                            if (!r.tp.describe) {
                                console.log(r.tp.name, "has no describe!!");
                                r.tp.describe = r.tp.name + " has no describe!"
                            }
                            data.obj.push({x, y, img, id: r.id, z: r.tp.z, describe: r.tp.describe});
                            if (x === 4 && y === 4 && r.tp !== meta.player) {
                                data.ground.push({img, id: r.id, describe: r.tp.describe})
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
                    data.inv.push({img, id: i.id, describe: i.tp.describe});
                }
            }
            data.px = p.x;
            data.py = p.y;
            data.dir = p.data.dir;
            data.delay = Date.now() - dtStartLoop;
            data.connected = world.connected;
            data.time = world.time;
            data.tire = p.tire;
            data.died = p.data.died;
            p.socket.emit('updateState', data);
        }
        // }
    }
};

send.error = (id, socket, text) => {
    socket.emit('errorr', text);
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
