const os = require('os');
const meta = require('./meta.js');

if (os.platform() == 'darwin') {
    module.exports = {
        ip: "127.0.0.1",
        port: "3000",
        botkey: '320938705:AAGpcdMe9oIhFYuu11MjU4djJnj1maijkpQ',
        world: {
            start: 5000,
            obj: [
                {m: meta.wolf, q: 3000},
                {m: meta.orangetree, q: 60000},
                // {m: meta.water, q: 30000},
                {m: meta.plant, q: 2000},
                {m: meta.orange, q: 3000},
                {m: meta.ant, q: 3000},
                {m: meta.fire, q: 3000},
                {m: meta.aphid, q: 3000},
                {m: meta.crab, q: 3000},
                {m: meta.highgrass, q: 40000},
            ],
            factor: 1.2,
        }
    }
} else {
    module.exports = {
        ip: "46.101.23.21",
        port: "80",
        botkey: '602673396:AAFHMT_6QTnuPnDBYNLKDGFiiVnwbvZYYHM',
        world: {
            start: 5000,
            obj: [
                {m: meta.wolf, q: 3000},
                {m: meta.orangetree, q: 60000},
                // {m: meta.water, q: 30000},
                {m: meta.plant, q: 2000},
                {m: meta.orange, q: 3000},
                {m: meta.ant, q: 3000},
                {m: meta.fire, q: 3000},
                {m: meta.aphid, q: 3000},
                {m: meta.crab, q: 3000},
                {m: meta.highgrass, q: 40000},
            ],
            factor: 1.2,
        }
    }
}