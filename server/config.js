const os = require('os');
const meta = require('./meta.js').meta;

if (os.platform() == 'darwin') {
    module.exports = {
        ip: "127.0.0.1",
        port: "3000",
        botkey: '320938705:AAGpcdMe9oIhFYuu11MjU4djJnj1maijkpQ',
        world: {
            start: 5200,
            obj: [
                {m: meta.zebra, q: 20},
                {m: meta.wolf, q: 20},
                {m: meta.shovel, q: 20},
                {m: meta.zombie, q: 60},
                {m: meta.tree, q: 3000},
                {m: meta.bone, q: 60},
                {m: meta.plant, q: 70},
                {m: meta.stone, q: 30},
                {m: meta.orange, q: 50},
                {m: meta.ant, q: 50},
                {m: meta.aphid, q: 3000},
                {m: meta.crab, q: 70},
                {m: meta.highgrass, q: 3000},
            ],
            factor: 1,
            items: 30000,
            speed: 10,
        }
    }
} else {
    module.exports = {
        ip: "46.101.23.21",
        port: "80",
        botkey: '602673396:AAFHMT_6QTnuPnDBYNLKDGFiiVnwbvZYYHM',
        world: {
            start: 5200,
            obj: [
                {m: meta.wolf, q: 200},
                {m: meta.tree, q: 40000},
                {m: meta.bone, q: 6000},
                {m: meta.plant, q: 550},
                {m: meta.orange, q: 300},
                // {m: meta.ant, q: 3000},
                // {m: meta.fire, q: 3000},
                {m: meta.aphid, q: 300},
                {m: meta.crab, q: 2000},
                {m: meta.highgrass, q: 30000},
            ],
            factor: 1,
            items: 250000,
            speed: 10,
        }
    }
}