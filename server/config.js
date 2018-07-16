const os = require('os');
const meta = require('./meta.js').meta;


let objects = [
    {m: 'beaver', q: 1},
    {m: 'potatoseed', q: 4},
    {m: 'potatoplant', q: 1},
    {m: 'skeleton', q: 5},
    {m: 'bone', q: 2},
    {m: 'tree', q: 40},
    {m: 'wall', q: 5},
    {m: 'highgrass', q: 100},
];

if (os.platform() == 'darwin') {
    module.exports = {
        ip: "127.0.0.1",
        port: "3000",
        botkey: '320938705:AAGpcdMe9oIhFYuu11MjU4djJnj1maijkpQ',
        world: {
            start: 5200,
            obj: objects,
            factor: 1,
            items: 1000,
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
            obj: objects,
            factor: 1,
            items: 200000,
            speed: 10,
        }
    }
}