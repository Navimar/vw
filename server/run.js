/**
 * Created by igor on 16/02/2017.
 */
const input = require('./input');
const test = require('./test');
const read = require('./loadData');

exports.main = function main(io) {
    read();
    input.socket(io);
    input.bot();
    input.tick();
    test();
};
