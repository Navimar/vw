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
                // {m: meta.zebra, q: 20},
                // {m: meta.wolf, q: 20},
                {m: meta.beaver, q: 20},
                {m: meta.shovel, q: 60},
                {m: meta.skeleton, q: 120},
                {m: meta.tree, q: 1000},
                // {m: meta.bone, q: 60},
                // {m: meta.stick, q: 30},
                // {m: meta.plant, q: 70},
                // {m: meta.stone, q: 30},
                {m: meta.potato, q: 30},
                {m: meta.potatoplant, q: 30},
                // {m: meta.orange, q: 50},
                // {m: meta.ant, q: 50},
                // {m: meta.aphid, q: 3000},
                // {m: meta.crab, q: 70},
                {m: meta.highgrass, q: 2000},
            ],
            factor: 1,
            items: 200000,
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
                // {m: meta.zebra, q: 20},
                // {m: meta.wolf, q: 20},
                {m: meta.beaver, q: 20},
                {m: meta.shovel, q: 60},
                {m: meta.zombie, q: 240},
                {m: meta.tree, q: 1000},
                // {m: meta.bone, q: 60},
                // {m: meta.stick, q: 30},
                // {m: meta.plant, q: 70},
                // {m: meta.stone, q: 30},
                {m: meta.potato, q: 30},
                {m: meta.potatoplant, q: 30},
                // {m: meta.orange, q: 50},
                // {m: meta.ant, q: 50},
                // {m: meta.aphid, q: 3000},
                // {m: meta.crab, q: 70},
                {m: meta.highgrass, q: 2000},
            ],
            factor: 1,
            items: 200000,
            speed: 10,
        }
    }
}