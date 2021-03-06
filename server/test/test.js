/**
 * Created by igor on 16/02/2017.
 */
const _ = require('lodash');
const fs = require('fs');
const world = require('../engine/world');
const wrapper = world.wrapper;
const meta = require('../logic/meta.js').meta;
const wound = require('../logic/meta.js').wound;
const util = require('../web/util');
const direction = util.dir;
const random = util.random;
const exe = require('../logic/execute');
const bot = require('../web/bot');
const event = require('../web/event');
const send = require('../web/send');
const user = require('../web/user');
const load = require('../web/load');
const handle = require('../web/handle');

module.exports = () => {
    let testFail = false;
    let arrTest = [];

    function test(val, ok, text) {
        if (text == undefined) {
            text = "";
        }
        if (val == ok) {
            arrTest.push({status: "OK", text});
        } else {
            arrTest.push({
                status: "ERROR!!!",
                text: text + ". value: " + JSON.stringify(val) + ", expected: " + JSON.stringify(ok)
            });
            testFail = true;
        }
    }

    // fs.unlink('data/testlog.txt', (err) => {
    //     if (err) throw err;
    // });
    event.path = "data/testlog.txt";

    // let socket = (nm,msg) => {
    //     return {
    //         nm,
    //         msg,
    //         emit: (nm,msg) => {
    //             console.log(nm+' '+msg);
    //         }
    //     }
    // };
    let o;

    //main tests
    test(true, false, "Tests are working, they could be false");
    test(random(100), 93, "random isn't random");

    //world
    world.init();
    o = world.createObj('test', 0, 0);
    test(o.tp, 'test', 'world.createObj');

    //wrapper
    world.init();
    o = world.createObj('test', 0, 0);
    wrapper().transform(o,'tree');
    test(o.tp, 'tree', 'wraper.transform');

    world.init();
    o = world.createObj('test', 0, 0);
    world.createObj('tree', -1, 0);
    world.createObj('potatoseed', 0, 1);
    world.createObj('skeleton', 1, 0);
    test(wrapper(o).isNear('tree').tp, 'tree', 'wraper.near(single)');
    test(wrapper(o).isNear(['potatoseed','skeleton']).tp, 'potatoseed', 'wraper.near([array])');


    world.init();
    let p = world.addPlayer(false, false, 371, 250);
    test(p.x, 371, 'player is creating in point where was created on x');
    test(p.y, 250, 'player is creating in point where was created on y');

    world.init();
    p = world.addPlayer();
    test(p.x, 0, 'player without params is creating in 0 0');
    test(p.y, 0, 'player without params is creating in 0 0');

    world.init();
    p = world.addPlayer();
    p.data.order = {x: 4, y: 0};
    meta[p.tp].onTurn(p.data, wrapper(p));
    test(p.x, 1, 'player onTurn dirTo right');
    test(p.y, 0, 'player onTurn dirTo right');
    world.init();
    p = world.addPlayer();
    p.data.order = {x: 0, y: 4};
    meta[p.tp].onTurn(p.data, wrapper(p));
    test(p.y, 1, 'player onTurn dirTo up');
    test(p.x, 0, 'player onTurn dirTo up');
    world.init();
    p = world.addPlayer();
    p.data.order = {x: 0, y: -4};
    meta[p.tp].onTurn(p.data, wrapper(p));
    test(p.y, -1, 'player onTurn dirTo down');
    test(p.x, 0, 'player onTurn dirTo down');
    world.init();
    p = world.addPlayer();
    p.data.order = {x: -4, y: 0};
    meta[p.tp].onTurn(p.data, wrapper(p));
    test(p.x, -1, 'player onTurn dirTo left');
    test(p.y, 0, 'player onTurn dirTo left');
    world.init();
    p = world.addPlayer();
    o = world.createObj('tree', 0, 1);
    p.data.order = {x: 1, y: 4};
    meta[p.tp].onTurn(p.data, wrapper(p));
    test(p.x, 1, 'player onTurn dirTo right when tree is on the pass');
    test(p.y, 0, 'player onTurn dirTo right when tree is on the pass');
    world.init();
    o = world.createObj('tree', 0, 0);
    let b = world.createObj('tree', 0, 1);
    test(wrapper(o).move(direction.down), b, 'move on solid');
    test(o.y, 0, 'cant pass solid');

    world.init();
    let m = {p: true};
    // world.createObj(m, 0, 0);
    o = wrapper({x: 0, y: 0}).isHereNear(m);
    test(o, false, 'isHereNear false');

    // world.init();
    //  m = {p: true};
    // world.createObj(m, 0, 0);
    // o = exe.wrapper({x: 0, y: 0}).isHereNear(m);
    // test(o.tp.p, true, 'isHereNear HERE');

    // world.init();
    // m = {p: true};
    // world.createObj(m,1, 0);
    // o = exe.wrapper({x: 0, y: 0}).isHereNear(m);
    // test(o.tp.p, true, 'isHereNear NEAR');

    // world.init("objArrInPoint");
    // world.createObj(meta.test, 5, 5);
    // world.createObj(meta.highgrass, 5, 5);
    // test(world.point(5, 5)[0].tp, meta.test, "");
    // test(world.point(5, 5)[1].tp, meta.highgrass, "");

    // world.init("findInPoint");
    // world.createObj(meta.test, 5, 5);
    // test(world.find(meta.test, 4, 4).y, 5);
    // test(world.find(meta.test, 3, 7).y, 5);
    // test(world.find(meta.test, 10, 10), false);
    // test(world.find(meta.test, 5, 5).y, 5, "find same point");
    // world.init();
    // test(world.find(meta.test, 2, 2), false, "find nobody");

    // world.init("apply");
    // let p = world.addPlayer();
    // exe.apply(direction.right, p);
    // test(world.objArrInInv(p), false, "empty doesn't get in inv");
    world.init();
    p = world.addPlayer();
    world.addWound(p, wound.hungry);
    test(p.wound[0], wound.hungry, 'worldAddWound');
    world.init();
    p = world.addPlayer();
    for (let i = 0; i < 5000; i++) {
        exe.onTick();
    }
    test(p.wound[3], wound.hungry, 'hungry after time');

    world.init();
    p = world.addPlayer();
    world.addWound(p, wound.hit);
    test(p.wound[0], wound.hit, 'worldAddWound');
    for (let i = 0; i < 1002; i++) {
        exe.onTick();
    }
    test(p.wound[0], wound.life, 'hit dissapears');

    // world.init();
    // p = world.addPlayer();
    // o = world.createObj(meta.orange, 0, 0);
    // event.order(p, {name: 'take', id: o.id});
    // exe.onTick();
    // test(world.map.get(p.id)[0].tp, meta.orange, 'take event');
    // world.init();
    // p = world.addPlayer(false,1);
    // o = world.createObj(meta.orange, 0, 0);
    // world.put(o, p);
    // event.order(p, {name: 'drop', id: o.id});
    // exe.onTick();
    // test(world.inv(p), false, 'drop event');
    // world.init();
    // p = world.addPlayer(false, false, 0, 0);
    // o = world.createObj(meta.orange, 0, 0);
    // exe.wrapper(o).getOut(p.x, p.y);
    // test(world.point(0,0).length, 2, 'getOut from ground');
    // user.list = [];
    // world.init();
    // p = world.addPlayer();
    // world.createObj(meta.kaka, 0, 0);
    // o = world.createObj(meta.orange, 0, 0);
    // // world.put(o, p);
    // world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // event.order(p, {name: 'use', from: "ground", id: o.id, targetX: p.x, targetY: p.y});
    // test(p.wound[0], wound.life, 'apply On myself From Ground with many kaka');
    // world.createObj(meta.kaka, 0, 0);
    // world.init();
    // p = world.addPlayer();
    // world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // o = world.createObj(meta.orange, 0, 0);
    // world.put(o, p);
    // world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // event.order(p, {name: 'use', from: "inv", id: o.id, targetX: p.x, targetY: p.y});
    // test(p.wound[0], 'life', 'apply On myself From INV with many kaka');
    // world.init();
    // p = world.addPlayer();
    // o = world.createObj(meta.orange, 0, 0);
    // // world.addWound(p, 'hungry');
    // p.order = {name: 'use', tool: o, target: p};
    // exe.onTick();
    // test(p.wound[0], 'glut', 'glut because of orange');
    // world.init();
    // p = world.addPlayer();
    // world.addWound(p, wound.glut);
    // for (let a = 0; a < 100; a++) {
    //     exe.onTick();
    // }
    // test(p.wound[0], 'life', 'cant be glut because of hungry');
    // test(p.wound[1], 'life', 'cant be hungry because of glut');
    // world.init();
    // p = world.addPlayer();
    // for (let a = 0; a < 11; a++) {
    //     world.addWound(p, wound.glut);
    // }
    // test(p.data.died, true, 'tens wound die');
    // test(meta[p.tp].img(p.data), 'rip', 'rip if died');
    // world.init();
    // o = world.createObj(meta.plant, 0, 0);
    // let k = world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // world.createObj(meta.kaka, 0, 0);
    // for (let a = 0; a < 8000; a++) {
    //     exe.onTick();
    // }
    // test(k.tp, meta.orange, 'tree makes oranges');
    // world.init();
    // o = world.createObj(meta.aphid, 0, 0);
    // k = world.createObj(meta.orange, 0, 0);
    // for (let a = 0; a < 250; a++) {
    //     exe.onTick();
    // }
    // test(k.tp, meta.kaka, 'aphid transform kaka');
    // test(k.carrier, false, 'aphid drops kaka');
    // for (let a = 0; a < 4000; a++) {
    //     exe.onTick();
    // }
    // test(o.tp, meta.bone, 'aphid dies without food');
    //
    // world.init();
    // o = world.createObj(meta.wolf, 0, 0);
    // k = world.createObj(meta.meat, 0, 0);
    // for (let a = 0; a < 100; a++) {
    //     exe.onTick();
    // }
    // test(k.tp, meta.wolf, 'wolf eats meat');

    // world.init();
    // p = world.addPlayer(false, 1, 0, 0);
    // o = [];
    // for (let a = 0; a < 9; a++) {
    //     o[a] = world.createObj({}, 0, 0);
    //     world.put(o[a], p);
    // }
    // exe.wrapper(p).dropAll();
    // test(world.inv(p), false, 'dropAll() drops everything');
    // world.init();
    // for (let a = 0; a < 200000; a++) {
    //     world.createObj(meta.test, _.random(-1000, 1000), _.random(-1000, 1000));
    // }
    // for (let a = 0; a < 10000; a++) {
    //     world.createObj(meta.wolf, _.random(-1000, 1000), _.random(-1000, 1000));
    // }
    //
    // for (let a = 0; a < 5; a++) {
    //     let dtStartLoop = Date.now();
    //     for (let b = 0; b < 100; b++) {
    //         exe.onTick();
    //     }
    //     console.log('wolfs finishes ' + (Date.now() - dtStartLoop));
    // }
    test(user.new("slon", 1));
    test(user.byId(1).id, 1, "userById");
    test(user.byName("slon").username, "slon", "userByName");
    user.new("baton", 2);
    user.new("makaron", 3);
    user.makeFriend(user.byId(1), user.byId(2));
    test(user.isFriend(user.byId(1), user.byId(2)), true, "isFriend");
    test(user.isFriend(user.byId(1), user.byId(3)), false, "isNotFriend");

    // event.bot({event: "/start", id: 10, username: "ivan"});
    // event.bot({event: "/start", id: 604944578, username: "testovec"});
    // event.bot({event: "/friend", id: 604944578, words: ["/friend", "@ivan"]});
    // event.bot({event: "/check", id: 604944578, words: ["/check", "@ivan"]});
    user.list = [];
    user.new("me", 1);
    user.new("friend2", 2);
    user.new("friend3", 3);
    user.new("friend4", 4);
    user.makeFriend(user.byId(1), user.byId(2));
    test(user.findway(user.byId(1), user.byId(2))[0][0], user.byId(1), "findway2");
    user.makeFriend(user.byId(2), user.byId(3));
    test(user.findway(user.byId(1), user.byId(3))[0][1], user.byId(2), "findway3");
    user.makeFriend(user.byId(3), user.byId(4));
    test(user.findway(user.byId(1), user.byId(4))[0][2], user.byId(3), "findway4");

    send.bot(604944578, "send.bot is working");

    user.list = [];
    event.bot({event: "/start", id: 30626617, username: "happycatfish"});
    send.login(30626617);

    fs.unlink('data/testlog.txt', (err) => {
        if (err) throw err;
    });
    event.path = 'data/log.txt';

    if (testFail) {
        let text = "";
        for (let a of arrTest) {
            if (a.status == "ERROR!!!") {
                text = text + a.text + "\n";
            }
        }
        bot.sendMessage(30626617, "Server has been started. ");
        bot.sendMessage(30626617, text);
        console.log(text);
        // throw 'testFall';
    } else {
        bot.sendMessage(30626617, "Tests are not working");
    }

};