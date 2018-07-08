const os = require('os');
const meta = require('./meta.js').meta;


let obects = [
    {m: meta.beaver, q: 1},
    {m: meta.potatoseed, q: 4},
    {m: meta.skeleton, q: 5},
    {m: meta.bone, q: 2},
    {m: meta.tree, q: 32},
    {m: meta.highgrass, q: 100},
    {m: meta.wall, q: 8},
];

if (os.platform() == 'darwin') {
    module.exports = {
        ip: "127.0.0.1",
        port: "3000",
        botkey: '320938705:AAGpcdMe9oIhFYuu11MjU4djJnj1maijkpQ',
        world: {
            start: 5200,
            obj: obects,
            factor: 1,
            items: 50000,
            speed: 1000,
        }
    }
} else {
    module.exports = {
        ip: "46.101.23.21",
        port: "80",
        botkey: '602673396:AAFHMT_6QTnuPnDBYNLKDGFiiVnwbvZYYHM',
        world: {
            start: 5200,
            obj: obects,
            factor: 1,
            items: 200000,
            speed: 10,
        }
    }
}