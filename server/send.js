/**
 * Created by igor on 18/02/2017.
 */
const _ = require('lodash');
const user = require('./user');
const bot = require('./bot');
const world = require('./world');
const config = require('./config');
const meta = require('./meta.js').meta;

const send = {};

send.web = (dtStartLoop) => {
    for (let p of world.player()) {
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
                    p.wound[x].describe = p.wound[x].img + " has no describe!"
                }
                data.wound.push({img: p.wound[x].img, describe: p.wound[x].describe});
                for (let y = 0; y < 9; y++) {
                    //         data.holst[x][y] = [];
                    for (let r of world.point(p.x + x - 4, p.y + y - 4)) {
                        let img =
                            _.isFunction(meta[r.tp].img) ?
                                meta[r.tp].img(r.data)
                                :
                                meta[r.tp].img;
                        if (!meta[r.tp].describe) {
                            meta[r.tp].describe = meta[r.tp].key + " has no describe!"
                        }
                        data.obj.push({
                            x,
                            y,
                            img,
                            id: r.id,
                            z: meta[r.tp].z,
                            describe: meta[r.tp].describe,
                            message: r.message
                        });
                        if (x === 4 && y === 4 && r.tp !== 'player') {
                            data.ground.push({img, id: r.id, describe: meta[r.tp].describe, isNailed: meta[r.tp].isNailed})
                        }
                    }
                }
            }
            for (let i of world.inv(p)) {
                let img =
                    _.isFunction(meta[i.tp].img) ?
                        meta[i.tp].img(i.data)
                        :
                        meta[i.tp].img;
                data.inv.push({img, id: i.id, describe: meta[i.tp].describe});
            }
            data.px = p.x;
            data.py = p.y;
            data.dir = p.data.dir;
            data.delay = Date.now() - dtStartLoop;
            data.connected = world.connected();
            data.time = world.time();
            data.tire = p.tire;
            data.died = p.data.died;
            if(p.socket.emit){
            p.socket.emit('updateState', data);
            }else{
            //     console.log(p.socket);
            }
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
