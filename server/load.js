/**
 * Created by igor on 16/02/2017.
 */
// const exe = require('./execute');
// const user = require('./user');
const read = require('./read');

module.exports = (path) => {
    if (!path) {
        path = 'data/log.txt'
    }
    const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(path)
    });
    lineReader.on('line', function (line) {
        let val = JSON.parse(line);
        read(val.val);
    });
};
