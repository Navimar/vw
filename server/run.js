/**
 * Created by igor on 16/02/2017.
 */
const input = require('./input');
const test = require('./test');
const load = require('./load');
const fs = require('fs');
// const path = require('path');


// const event = require('./event');


exports.main = function main(io) {
    test();

    if (fs.existsSync('data/log.txt')) {
        load();
    }else{
        input.init();
    }

    input.socket(io);
    input.bot();
    input.tick();
};
