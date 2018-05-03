/**
 * Created by igor on 16/02/2017.
 */

const world = require('./world');
const meta = require('./rule');
const direction = require('./util');
const exe = require('./execute');
const bot = require('./bot');

module.exports = () => {
    let testFail = false;
    let arrTest = [];

    function test(val, ok, text) {
        if (text == undefined) {
            text = "";
        }
        if (val === ok) {
            arrTest.push({status: "OK", text});
        } else {
            arrTest.push({status: "ERROR!!!", text: text + ". value: " + val + ", expected: " + ok});
            testFail = true;
        }
    }

    test(true, false,"Tests are working, they could be false");
    world.init("objArrInPoint");
    world.createObj(meta.test, 5, 5);
    world.createObj(meta.highgrass, 5, 5);
    test(world.objArrInPoint(5, 5)[0].tp, meta.test, "");
    test(world.objArrInPoint(5, 5)[1].tp, meta.highgrass, "");

    world.init("findInPoint");
    world.createObj(meta.test, 0, 0);
    test(world.findInPoint(meta.test, 0, 0).tp.img, "angel", "find in 0 0");
    world.createObj(meta.test, -5, -5);
    test(world.find(meta.test, -4, -4).y, -5, "find in negarive coor");
    world.addPlayer();
    test(world.findInPoint(meta.player, 0, 0).x, 0, "find player");

    world.init("find");
    world.createObj(meta.test, 0, 0);
    test(world.find(meta.test, 2, 2).x, 0, "find at 0 0");
    world.addPlayer();
    test(world.find(meta.player, 2, 2).y, 0, "find Player");
    test(world.find(meta.player, 3, 0).y, 0, "finding Player in 0 0 from 3 0");
    test(world.find(meta.player, 4, 0).y, 0, "finding Player in 0 0 from 4 0");
    test(world.find(meta.player, 5, 0), false, "finding Player in 0 0 from 5 0");
    test(world.find(meta.player, -3, 0).y, 0, "finding Player in 0 0 from -3 0");
    test(world.find(meta.player, 0, -3).y, 0, "finding Player in 0 0 from 0 -3");
    test(world.find(meta.player, -4, 0).y, 0, "finding Player in 0 0 from -4 0");
    test(world.find(meta.player, 0, -4).y, 0, "finding Player in 0 0 from 0 -4");
    world.createObj(meta.test, 5, 5);
    test(world.find(meta.test, 4, 4).y, 5);
    test(world.find(meta.test, 3, 7).y, 5);
    test(world.find(meta.test, 10, 10), false);
    test(world.find(meta.test, 5, 5).y, 5, "find same point");
    world.init();
    test(world.find(meta.test, 2, 2), false, "find nobody");

    world.init("apply");
    let p = world.addPlayer();
    exe.apply(direction.right, p);
    test(world.objArrInInv(p), false, "empty not get in inv");

    world.init("moveTo");
    let w = world.createObj(meta.wolf, -5, 0);
    exe.wrapper(w).moveTo(0, 0);
    test(w.x, -4, "wolf moveTo right");
    world.init("moveTo");
    w = world.createObj(meta.wolf, 5, 0);
    exe.wrapper(w).moveTo(0, 0);
    test(w.x, 4, "wolf moveTo left");
    world.init("moveTo");
    w = world.createObj(meta.wolf, 0, -5);
    exe.wrapper(w).moveTo(0, 0);
    test(w.y, -4, "wolf moveTo up");
    world.init("moveTo");
    w = world.createObj(meta.wolf, 0, 5);
    exe.wrapper(w).moveTo(0, 0);
    test(w.y, 4, "wolf moveTo down");
    world.init("wolf");
    world.addPlayer();
    w = world.createObj(meta.wolf, -4, 0);
    w.tp.onTurn(w.data, exe.wrapper(w));
    test(w.x, -3, "wolf goes right");
    world.init();
    world.addPlayer();
    w = world.createObj(meta.wolf, 4, 0);
    w.tp.onTurn(w.data, exe.wrapper(w));
    test(w.x, 3, "wolf goes left");
    world.init();
    world.addPlayer();
    w = world.createObj(meta.wolf, 0, 4);
    w.tp.onTurn(w.data, exe.wrapper(w));
    test(w.y, 3, "wolf goes up");
    world.init();
    world.addPlayer();
    w = world.createObj(meta.wolf, 0, -4);
    w.tp.onTurn(w.data, exe.wrapper(w));
    test(w.y, -3, "wolf goes down");

    if (testFail) {
        let text = "";
        for (let a of arrTest) {
            if (a.status == "ERROR!!!") {
                text = text + a.text + "\n";
            }
        }
        bot.sendMessage(30626617, "Server has been started. ");
        bot.sendMessage(30626617, text);
        // throw 'testFall';
    } else {
        bot.sendMessage(30626617, "Server has been started");
    }
};

