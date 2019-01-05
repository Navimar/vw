const os = require('os');
const meta = require('./meta.js').meta;


let objects = [
  // { m: 'beaver', q: 2 },
  // { m: 'key', q: 2 },
  // { m: 'potatoseed', q: 2 },
  // { m: 'potatoplant', q: 2 },
  // { m: 'skeleton', q: 5 },
  // { m: 'plant', q: 10 },
  // { m: 'crab', q: 2 },
  // { m: 'shovel', q: 5 },
  { m: 'wolf', q: 5 },
  // { m: 'door', q: 3 },
  // { m: 'pickaxe', q: 10 },
  // { m: 'stone', q: 2 },
  // { m: 'stick', q: 2 },
  // { m: 'tree', q: 30 },
  { m: 'wall', q: 300 },
  // { m: 'water', q: 50 },
  { m: 'zombie', q: 5 },
  // { m: 'highgrass', q: 200 },
  { m: 'carnivorous', q: 1 },
  { m: 'ant', q: 10 },
];

if (os.platform() == 'darwin' || os.platform() == 'win32') {
  module.exports = {
    ip: "127.0.0.1",
    port: "3000",
    botkey: '320938705:AAGpcdMe9oIhFYuu11MjU4djJnj1maijkpQ',
    savefrequency: 10000,
    statfrequency: 1000,
    world: {
      start: 5200,
      obj: objects,
      factor: 1,
      items: 50000,
      speed: 10,
    }
  }
} else {
  module.exports = {
    ip: "46.101.23.21",
    port: "80",
    botkey: '602673396:AAFHMT_6QTnuPnDBYNLKDGFiiVnwbvZYYHM',
    savefrequency: 864000,
    statfrequency: 5000,
    world: {
      start: 5200,
      obj: objects,
      factor: 0.5,
      items: 500000,
      speed: 10,
    }
  }
}