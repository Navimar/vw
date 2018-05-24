/**
 * Created by igor on 16/02/2017.
 */
const input = require('./input');
const test = require('./test');
const load = require('./load');
const fs = require('fs');
// const event = require('./event');


exports.main = function main(io) {
    test();
    fs.access('data/log.txt', fs.constants.F_OK, (err) => {
        // console.log(`${path} ${err ? 'does not exist' : 'exists'}`);
        if (err) {
            input.init();
        } else {
            load();
        }
    });
    input.socket(io);
    input.bot();
    input.tick();
};
