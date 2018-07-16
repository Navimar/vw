/**
 * Created by igor on 16/02/2017.
 */
// const exe = require('./execute');
// const user = require('./user');
// const read = require('./read');
const world = require('./world');
// const readline = require('readline');
const readline = require('read-each-line-sync');
const CircularJSON = require('circular-json');
// const fs = require('fs');

// module.exports = (path) => {
//     if (!path) {
//         path = 'data/log.txt'
//     }
//
//     const lineReader = readline.createInterface({
//         input: fs.createReadStream(path)
//     });
//     lineReader.on('line', function (line) {
//         let val = JSON.parse(line);
//         read(val.val);
//     });
// };
module.exports = (path) => {
    if (!path) {
        path = 'data/snap.txt'
    }
    readline(path, function (line) {
        world.loadgame(CircularJSON.parse(line));
    });
};
// module.exports = (path) => {
//     if (!path) {
//         path = 'data/log.txt'
//     }
//     readline(path, function (line) {
//         let val = JSON.parse(line);
//         read(val);
//     });
// };
