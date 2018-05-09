/**
 * Created by igor on 16/02/2017.
 */
const input = require('./input');
const test = require('./test');
const read = require('./read');

const event = require('./event');


exports.main = function main(io) {
    test();
    // read();
    input.socket(io);
    input.bot();
    input.tick();
    event.init();
};
