/**
 * Created by igor on 16/02/2017.
 */
const input = require('./input');
const test = require('../test/test');
const load = require('./load');
const fs = require('fs');
// const path = require('path');


// const event = require('./event');

let seedrandom = require('seedrandom');


exports.main = function main(io) {
    seedrandom('hello.', {global: true});
    // console.log(Math.random());
    test();

    // if (fs.existsSync('data/log.txt')) {
    //     load();
    // }else{
    //     input.init();
    // }
    input.init(true);
    if (fs.existsSync('data/snap.txt')) {
        load();
    }
    input.socket(io);
    input.bot();
    input.tick();
};
