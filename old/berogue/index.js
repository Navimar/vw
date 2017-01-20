const grafio = initGrafio();

const item_slot = {name: "slot", text: "Мешочек, его можно заполнить полезными предметами."};

const item_stone = {
    name: "stone",
    text: "Кусок камня, метните его во врага или используйте в строительстве или делайте с ним что хотите!"
};
const item_brick = {
    name: "brick",
    text: "Семена стеницы, уроните семечко у себя за спиной и там выростет настоящая стена."
};
const item_stick = {name: "stick", text: "Палка, хорошо подходит, чтобы что-нибудь сломать"};
const item_pickaxe = {name: "pickaxe", text: "Кирка, крушит стены и черепа."};
const item_speedpotion = {name: "speedpotion", text: "Это зелье ускорит героя в три раза, правда лишь на мгновение."};
const item_funpotion = {name: "funpotion", text: "Это зелье наполняет радостью и придает смысл жизни."};
const item_bottle = {name: "bottle", text: "Пустая склянка, подойдет чтобы налить туда любую жидкость."};
const item_brokenglass = {name: "brokenglass", text: "Битое стекло, лучше по не ходить..."};
const item_molotov = {name: "molotov", text: "Бутылка с горючим"};
const item_fireberry = {name: "fireberry", text: "Бутылка с горючим"};
const item_meat = {
    name: "meat",
    text: "Сырое мясо, очень рекомендую пожарить прежде чем есть, ведь в нем могут быть паразиты!"
};
const item_flinders = {
    name: "flinders",
    text: "Щепки, подойдут разве что для розжига или как наполнитель, путного из них точно ничего не выйдет."
};
const item_ash = {name: "ash", text: "Уголек"};


const wound_bite = {name: "bite", text: "Серьезный укус, нужно забинтовать рану."};
const wound_void = {name: "void", text: "Пустота поселилась в сердце героя, только радость может заполнить ее"};
const wound_life = {name: "life", text: "Уголок сердца Героя, его можно заполнить болью и страданиями."};
const wound_notfun = {
    name: "notfun",
    text: "Ваш герой изрядно соскучился по веселящему зелью и это причиняет боль. И да, он не признает зависимости."
};
const wound_hungry = {name: "hungry", text: "Герой так голоден что готов проглотить кота!"};
const wound_helminth = {
    name: "helminth",
    text: "У героя поселились паразиты, теперь он слабее и у него хуже усваивается пища"
};


const item_burdock = {
    name: "burdock", text: "Пристал репей, не думаю что стоит бросать его на землю..."
};
const item_redburdock = {name: "redburdock", text: "Репей главного хищного растения."};
const wound_drawn = {
    name: "drawn",
    text: "Тухлая вода залилась за шиворот и в карманы, нужно срочно на сушу!"
};
const item_bandage = {name: "bandage", text: "Бинт подойдет чтобы забинтовать рану"};
const item_grill = {name: "grill", text: "Бинт подойдет чтобы забинтовать рану"};
const item_redkey = {name: "redkey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_goldenkey = {name: "goldenkey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_whitekey = {name: "whitekey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_blackkey = {name: "blackkey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_greenkey = {name: "greenkey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_bluekey = {name: "bluekey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_rainkey = {name: "rainkey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_magentakey = {name: "magentakey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};
const item_miragekey = {name: "miragekey", text: "Один из девяти ключей открывающих портал домой", typ: "key"};


var game = {};
var dh = 0;
const vision = 9;

var gameovered = false;
var add_monster = 0;
var logictimer = 0;
var allKeys = [];
var rndItem = [];
var rndItemCounter = 0;
var funaddict = false;
var funless = 0;
var starve = 0;
var fires = [];
var helminth = false;

var stamp = 0;
var cmd = null;
var codeOld = null;

const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');

window.onkeydown = function (e) {
    // if(codeOld == e.code){
    //     cmd = null;
    //     return;
    // }
    // console.log(e.code);
    codeOld = e.code;
    if (e.code == "ArrowLeft") {
        cmd = {tp: "use", dir: "left"};
    }
    if (e.code == "ArrowUp") {
        cmd = {tp: "use", dir: "up"};
    }
    if (e.code == "ArrowRight") {
        cmd = {tp: "use", dir: "right"};
    }
    if (e.code == "ArrowDown") {
        cmd = {tp: "use", dir: "down"};
    }
    if (e.code == "Delete") {
        cmd = {tp: "use", dir: "sleep"};
    }
    if (e.code == "KeyA") {
        cmd = {tp: "move", dir: "left"};
    }
    if (e.code == "KeyW") {
        cmd = {tp: "move", dir: "up"};
    }
    if (e.code == "KeyD") {
        cmd = {tp: "move", dir: "right"};
    }
    if (e.code == "KeyS") {
        cmd = {tp: "move", dir: "down"};
    }
    if (e.code == "Space") {
        cmd = {tp: "move", dir: "sleep"};
    }
    if (e.code == "Enter") {
        cmd = {tp: "pick", dir: "sleep"};
    }
    if (e.code == "Digit1") {
        game.select = 0;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit2") {
        game.select = 1;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit3") {
        game.select = 2;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit4") {
        game.select = 3;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit5") {
        game.select = 4;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit6") {
        game.select = 5;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit7") {
        game.select = 6;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit8") {
        game.select = 7;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
    if (e.code == "Digit9") {
        game.select = 8;
        text(game.wound[game.select].text);
        text("Состояние:");
        text(game.inv[game.select].text);
        text("Предмет:");
    }
}
window.onkeyup = function (e) {
    // cmd = null;
    // codeOld = null;
}

window.onload = function () {
    game = init();
    var oldtime = 0;

    function loop(time) {
        var frame = time - oldtime;
        oldtime = time;
        run(frame);
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

function init() {
    game.map = [];
    for (x = -10; x < 60; x++) {
        game.map[x] = [];
        for (y = -10; y < 60; y++) {
            game.map[x][y] = [];
            for (z = 0; z < 3; z++) {
                game.map[x][y][z] = "empty";
            }
        }
    }
    game.fow = [];
    for (x = -1; x < 10; x++) {
        game.fow[x] = [];
        for (y = -1; y < 10; y++) {
            game.fow[x][y] = true;
        }
    }
    return newgame();
}

function generateMonster(name, x, y) {
    game.enemy[add_monster] = {name, x, y, fromx: x, fromy: y, tax: x, tay: y, alive: true};
    add_monster++;
}

function newgame() {
    gameovered = false;
    funaddict = false;
    funless = 0;
    starve = 0;
    add_monster = 0;
    game.speedup = 0;
    rndItemCounter = 0;
    allKeys = [];
    fires = [];
    helminth = false;

    for (var y = 0; y < 50; y++) {
        for (var x = 0; x < 50; x++) {
            for (var z = 0; z < 3; z++) {
                game.map[x][y][z] = "empty";
            }
        }
    }
    for (var y = 0; y < 50; y++) {
        for (var x = 0; x < 50; x++) {
            if (y < 25 || x > 25) {
                game.map[x][y][0] = "floor";
            } else {
                if (rndint(0, 99) < 20) {
                    game.map[x][y][0] = "floor";
                    if (x > 1 && y > 1) {
                        game.map[x - 1][y][0] = "floor";
                        game.map[x][y - 1][0] = "floor";
                        game.map[x - 1][y - 1][0] = "floor";
                    }
                } else {
                    game.map[x][y][0] = "water";
                }
            }
            // if (rndint(0, 4) == 0) {
            //     game.map[x][y][1] = "wall";
            // }

            if (x < 5 || x >= 45) {
                game.map[x][y][1] = "rock";
            }
            if (y < 5 || y >= 45) {
                game.map[x][y][1] = "rock";
            }
        }
    }

    for (var z = 0; z < 150; z++) {
        a = rndint(7, 42);
        b = rndint(7, 42);
        genPat("tower", a, b);
        console.log(a, b);
    }
    game.map[15][15][1] = "gusstation";

    game.enemy = [];

    // var ghosts = 15;
    // for (let j = 0; j < 45; j++) {
    //     var a = rndint(5, 45);
    //     var b = rndint(5, 45);
    //     if (game.map[a][b][0] == "floor") {
    //         generateMonster("mummy", a, b);
    //     } else {
    //         generateMonster("fish", a, b);
    //     }
    // }
    // for (let j = 0; j < 45; j++) {
    //     var a = rndint(5, 45);
    //     var b = rndint(5, 45);
    //     if (game.map[a][b][0] == "floor") {
    //         generateMonster("hedgehog", a, b);
    //     } else {
    //         generateMonster("fish", a, b);
    //     }
    // }
    // for (let j = 0; j < ghosts; j++) {
    //     var a = rndint(0, 6);
    //     var b = rndint(1, 49);
    //     generateMonster("ghost", a, b);
    // }
    // for (let j = 0; j < ghosts; j++) {
    //     var a = rndint(1, 49);
    //     var b = rndint(0, 6);
    //     generateMonster("ghost", a, b);
    // }
    // for (let j = 0; j < ghosts; j++) {
    //     var a = rndint(45, 49);
    //     var b = rndint(1, 49);
    //     generateMonster("ghost", a, b);
    // }
    // for (let j = 0; j < ghosts; j++) {
    //     var a = rndint(1, 49);
    //     var b = rndint(45, 49);
    //     generateMonster("ghost", a, b);
    // }
    // var a = rndint(11, 39);
    // var b = rndint(11, 39);
    // generateMonster("motherplant", a, b);
    // a = rndint(11, 39);
    // b = rndint(11, 39);
    // generateMonster("motherplant", a, b);
    // a = rndint(11, 39);
    // b = rndint(11, 39);
    // generateMonster("motherplant", a, b);

    for (let y = 5; y < 11; y++) {
        for (var x = 5; x < 11; x++) {
            game.map[x][y][1] = "empty";
        }
    }
    for (let y = 0; y < 12; y++) {
        for (var x = 0; x < 12; x++) {
            killEnemy(x, y);
        }
    }
    a = rndint(6, 44);
    b = rndint(6, 44);
    game.pos = {x: a, y: b};

    generateMonster("hedgehog", a + 7, b + 7);

    genPat("tower", game.pos.x, game.pos.y);
    var emptyarr = [{x: a, y: b}, {x: a - 1, y: b - 1}, {x: a - 1, y: b}, {x: a - 1, y: b + 1}, {
        x: a,
        y: b - 1
    }, {x: a, y: b + 1}, {x: a + 1, y: b - 1}, {x: a + 1, y: b}, {x: a + 1, y: b + 1}, {x: a, y: b + 2}, {
        x: a,
        y: b + 3
    }, {x: a - 3, y: b}, {x: a - 2, y: b}, {x: a, y: b - 2}, {x: a, y: b - 3}, {x: a + 2, y: b}, {x: a + 3, y: b}];
    for (w in emptyarr) {
        killEnemy(emptyarr[w].x, emptyarr[w].y);
    }
    text("Началась новая игра. WASD чтобы ходить. ENTER чтобы подбирать предметы, Цифры, чтобы выбирать предметы в инветаре. Стрелки чтобы использовать предметы. SPACE чтобы стоять на месте")
    fow();

    game.select = 0;
    game.inv = [];
    game.wound = [];

    for (var y = 6; y < 45; y++) {
        for (var x = 6; x < 45; x++) {
            rndItem[rndItemCounter] = {a: x, b: y};
            rndItemCounter++;
        }
    }

    for (var iv = 0; iv < vision; iv++) {
        game.inv[iv] = item_slot;
        game.wound[iv] = wound_life;
    }
    game.inv[0] = item_pickaxe;

    // generateItem(item_gusstaion);
    for (var p = 0; p < 44; p++) {
        generateItem(item_pickaxe);
        generateItem(item_fireberry);
    }
    for (var p = 0; p < 14; p++) {
        generateItem(item_speedpotion);
    }
    for (var p = 0; p < 14; p++) {
        // generateItem(item_brick);
        generateItem(item_funpotion);
    }
    generateItem(item_goldenkey);
    generateItem(item_whitekey);
    generateItem(item_blackkey);
    generateItem(item_greenkey);
    generateItem(item_redkey);
    generateItem(item_bluekey);
    generateItem(item_magentakey);
    generateItem(item_miragekey);
    generateItem(item_rainkey);

    function generateItem(item) {
        var m = rndint(0, rndItem.length);
        var a = rndItem[m].a;
        var b = rndItem[m].b;
        rndItem.splice(m, 1);
        game.map[a][b][2] = item;
        if (item.typ == "key") {
            allKeys[allKeys.length] = {x: a, y: b, name: item.name};
            // console.log("addkey");
        }
        generateItemCounter = 0;
    }

    return game;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (canvas.width > canvas.height) {
        dh = canvas.height / vision;
    } else {
        dh = canvas.width / (vision + 4);
    }
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawimg(name, x, y) {
    var img = grafio(name);
    if (name == "empty") return;
    if (name == undefined || name == null) img = "undefined";
    if (img) ctx.drawImage(img, x * dh + dh + 200, y * dh, dh, dh);
}

function imfp(x, y, z) {
    if (game.map[x][y][z] != "empty") {
        if (z < 2) {
            return game.map[x][y][z];
        } else {
            return game.map[x][y][z].name;
        }
    } else return "empty";
}

function killNotAlive() {
    for (var e in game.enemy) {
        if (!game.enemy[e].alive) {
            game.enemy.splice(e, 1);
            add_monster--;
        }
    }
}

function draw(frame) {
    function animate(i, x, y, fx, fy, p) {
        var dx = fx + (x - fx) * p / 100;
        var dy = fy + (y - fy) * p / 100;
        drawimg("from", x, y);
        drawimg(i, dx, dy);
    }

    resize();
    if (stamp <= 100) {
        stamp += frame / 10;
    } else {
        killNotAlive();
    }
    var posx = game.pos.x - (vision - 1) / 2;
    var posy = game.pos.y - (vision - 1) / 2;

    for (let z = 0; z < 3; z++) {
        for (var y = 0; y < 9; y++) {
            for (var x = 0; x < 9; x++) {
                i = imfp(posx + x, posy + y, z, game);
                drawimg(i, x, y);
            }
        }
    }
    for (let e of game.enemy) {
        if (e.x - posx < vision && e.x - posx >= 0) {
            if (e.y - posy <= vision && e.y - posy >= 0) {
                if (!game.fow[e.x - posx][e.y - posy] || !game.fow[e.fromx - posx][e.fromy - posy]) {
                    animate(e.name, e.x - posx, e.y - posy, e.fromx - posx, e.fromy - posy, stamp)
                    // drawimg(e.name,e.x-posx,e.y-posy);
                    // drawimg("from",e.fromx-posx,e.fromy-posy);
                }
            }
        }
    }
    for (let e of fires) {
        if (e.x - posx < vision && e.x - posx >= 0) {
            if (e.y - posy <= vision && e.y - posy >= 0) {
                if (!game.fow[e.x - posx][e.y - posy]) {
                    // animate(e.name, e.x - posx, e.y - posy, e.fromx - posx, e.fromy - posy, stamp)
                    drawimg("fire", e.x - posx, e.y - posy);
                }
            }
        }
    }

    if (!gameovered) {
        drawimg("hero", 4, 4);
    } else {
        drawimg("beheaded", 4, 4)
    }


    //inventory
    for (l = 0; l < vision; l++) {
        drawimg(game.inv[l].name, -1, l);
    }
    drawimg("select", -1, game.select);

    //wounds
    for (l = 0; l < vision; l++) {
        drawimg(game.wound[l].name, vision, l);
    }
    drawimg("select", vision, game.select);


    //fow
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            if (game.fow[x][y]) {
                drawimg("fow", x, y);
            }
        }
    }

    if (game.arrow == "left") {
        drawimg("left", 3, 4);
    }
    if (game.arrow == "right") {
        drawimg("right", 5, 4);
    }
    if (game.arrow == "down") {
        drawimg("down", 4, 5);
    }
    if (game.arrow == "up") {
        drawimg("up", 4, 3);
    }

}

function run(frame) {
    logic(frame);
    draw(frame);
}


function logic(frame) {
    // if(logictimer<1000){
    // console.log("waiting"+logictimer);
    // logictimer+=frame;
    // return;
    // }
    logictimer = 0;
    if (cmd == null) {
        // action(0, 0, "move");
        return;
    }
    if (!gameovered) {
        let act = null;
        if (cmd.tp == "use") {
            act = game.inv[game.select].name;
        }
        if (cmd.tp == "move") {
            act = "move";
        }
        if (cmd.tp == "pick") {
            act = "pick";
        }
        if (cmd.dir == "left") {
            action(-1, 0, act);
        }
        if (cmd.dir == "up") {
            action(0, -1, act);
        }
        if (cmd.dir == "right") {
            action(1, 0, act);
        }
        if (cmd.dir == "down") {
            action(0, 1, act);
        }
        if (cmd.dir == "sleep") {
            action(0, 0, act);
        }
    } else {
        if (cmd.tp == "pick") {
            newgame(game);
        }
    }
    cmd = null;

    var min = 0;
    if (allKeys.length != 0) {
        for (var n in allKeys) {
            if (Math.abs(game.pos.x - allKeys[n].x + game.pos.y - allKeys[n].y) < Math.abs(game.pos.x - allKeys[min].x + game.pos.y - allKeys[min].y)) {
                min = n;
            }
        }
        if (Math.abs(allKeys[min].x - game.pos.x) > Math.abs(allKeys[min].y - game.pos.y)) {
            if (allKeys[min].x - game.pos.x < 0) {
                game.arrow = "left";
            } else {
                game.arrow = "right";
            }
        } else {
            if (allKeys[min].y - game.pos.y < 0) {
                game.arrow = "up";
            } else {
                game.arrow = "down";
            }
        }
    }


    function canMove(a, b) {
        if (game.map[game.pos.x + a][game.pos.y + b][1] != "empty") {
            text("Препятствие!");
            return false;
        }
        for (var e of game.enemy) {
            if (game.pos.x + a == e.x && game.pos.y + b == e.y) {
                text("Нельзя наступать на ёжиков!");
                return false;
            }
        }
        return true;
    }

    function action(a, b, act) {
        var x = game.pos.x;
        var y = game.pos.y;
        var here = game.map[x + a][y + b];

        if (act === "move") {
            if (canMove(a, b)) {
                var ok = true;
                game.pos.x += a;
                game.pos.y += b;
                if (game.map[game.pos.x][game.pos.y][0] == "stairs") {
                    gameover(game, true);
                }
                if (game.map[game.pos.x][game.pos.y][0] == "water") {
                    text("Если и не утону, то точно задохнусь от этого зловония!");
                    addWound(wound_drawn, false);
                }
                if (game.map[game.pos.x][game.pos.y][0] == "floor") {
                    var drawntext = true;
                    for (var i in game.inv) {
                        if (game.wound[i].name == "drawn") {
                            if (drawntext) {
                                text("Герой обсох и обветрился, готов к еще одному заплыву!");
                                drawntext = false;
                            }
                            game.wound[i] = wound_life;
                        }
                    }
                }

                enemyturn();

                justmoved = true;
            }
        }
        if (act === "pick") {
            if (game.map[game.pos.x][game.pos.y][2] != "empty") {
                if (game.map[game.pos.x][game.pos.y][2].typ == "key") {
                    for (k in allKeys) {
                        if (allKeys[k].name == game.map[game.pos.x][game.pos.y][2].name) {
                            allKeys.splice(k, 1);
                        }
                    }
                }
                if (addItem(game.map[game.pos.x][game.pos.y][2], true)) {
                    game.map[game.pos.x][game.pos.y][2] = "empty";
                    // enemyturn();
                } else {
                    text("Герой не может нести больше вещей!");
                }
            }
        }
        if (act === "pickaxe") {
            if (here[1] == "wall") {
                game.map[game.pos.x + a][game.pos.y + b][1] = "empty";
                drop(x + a, y + b, item_stone);
                game.inv[game.select] = item_stick;
            }
            if (enemyInPos(x + a, y + b)) {
                killEnemy(x + a, y + b);
                text("Ломай, убивай!!!");
                game.inv[game.select] = item_stick;
            }
            if (here[2] == item_funpotion || here[2] == item_speedpotion || here[2] == item_bottle) {
                here[2] = item_brokenglass;
            }
            if (here[2] == item_fireberry) {
                fire(x + a, y + b, 2, 1);
                here[2] = "empty";
            }
            enemyturn();
        }
        if (act === "stick") {
            if (here[2] == item_funpotion || here[2] == item_speedpotion || here[2] == item_bottle) {
                here[2] = item_brokenglass;
                enemyturn();
            } else if (here[1] == "empty" && enemyInPos(x + a, y + b) == false) {
                drop(x + a, y + b, item_stick);
                game.inv[game.select] = item_slot;
                text("Герой разбил бутылку в дребезги!");
            } else {
                killEnemy(x + a, y + b);
                game.inv[game.select] = item_slot;
                drop(x, y, item_flinders);
                text("Палка разлетелась на щепки!");
                enemyturn();
            }

        }
        if (act === "flinders") {
            if (here[1] == "empty" && enemyInPos(x + a, y + b) == false) {
                drop(x + a, y + b, item_flinders);
                game.inv[game.select] = item_slot;
            } else {
                drop(x, y, item_flinders);
                game.inv[game.select] = item_slot;
            }
        }
        if (act === "bottle") {
            if (here[1] == "empty" && enemyInPos(x + a, y + b) == false) {
                drop(x, y, item_bottle);
                game.inv[game.select] = item_slot;
            }
            if (here[1] == "gusstation") {
                game.inv[game.select] = item_molotov;
            }
            if (here[1] == "wall") {
                drop(x, y, item_brokenglass);
                game.inv[game.select] = item_slot;
            }
        }
        if (act === "fireberry") {
            if (here[2] == item_flinders) {
                fire(x + a, y + b, 3, 2);
                game.inv[game.select] = item_slot;
                here[2] = "empty";
            } else {
                drop(x, y, item_fireberry);
                game.inv[game.select] = item_slot;
            }
            enemyturn();
        }

        if (act === "meat") {
            if (fireInPos(x + a, y + b)) {
                game.inv[game.select] = item_grill;

            } else {
                var ok = true;
                for (var i in game.wound) {
                    if (game.wound[i] == wound_hungry && ok) {
                        game.wound[i] = wound_life;
                        ok = false;
                        text("Герой поел, ему стало лучше.");
                        game.inv[game.select] = item_slot;
                    }
                }
                if (!helminth) {
                    addWound(wound_helminth);
                    helminth = true;
                }
            }
            enemyturn();
        }
        if (act === "grill") {
            if (fireInPos(x + a, y + b)) {
                game.inv[game.select] = item_slot;
                fire(x + a, x + b, 1, 1);
            } else {
                var ok = true;
                for (var i in game.wound) {
                    if (game.wound[i] == wound_hungry && ok) {
                        game.wound[i] = wound_life;
                        ok = false;
                        text("Герой поел, ему стало лучше.");
                        game.inv[game.select] = item_slot;
                    }
                }
            }
            enemyturn();
        }
        if (act === "burdock") {
            if (game.map[game.pos.x + a][game.pos.y + b][1] == "empty" && (a != 0 || b != 0)) {
                killEnemy(game.pos.x + a, game.pos.y + b);
                generateMonster("plant", game.pos.x + a, game.pos.y + b);
                text("Растет как на дрожащ!");
                game.inv[game.select] = item_slot;
                // enemyturn();
            } else {
                text("Некуда тут");
            }
        }
        if (act === "redburdock") {
            if (game.map[game.pos.x + a][game.pos.y + b][1] == "empty" && (a != 0 || b != 0)) {
                killEnemy(game.pos.x + a, game.pos.y + b);
                generateMonster("motherplant", game.pos.x + a, game.pos.y + b);
                text("Растет как на дрожащ!");
                game.inv[game.select] = item_slot;
                game.select = 0;
                enemyturn();
            } else {
                text("Некуда тут");
            }
        }
        if (act === "stone") {
            if (a == 0 && b == 0) {
                text("Копье слишком длинное для харакири!")
            } else {
                var ok = true;
                for (var i = 1; i < 5; i++) {
                    if (enemyInPos(x + a * i, y + b * i) != 0 && ok) {
                        drop(x + a * i, y + b * i, item_ash);
                        killEnemy(x + a * i, y + b * i);
                        text("Вы пронзили врага копьем!");
                        game.inv[game.select] = item_slot;
                        ok = false;
                        // game.select = 0;
                    }
                    if ((game.map[x + a * (i + 1)][y + b * (i + 1)][1] != "empty" || i == 4) && ok) {
                        drop(x + a * i, y + b * i, item_stone);
                        game.inv[game.select] = item_slot;
                        ok = false;
                    }
                }
                enemyturn();
            }
        }
        if (act === "bandage") {
            var ok = true;
            for (var i in game.inv) {
                if (game.wound[i].name == "bite" && ok) {
                    game.wound[i] = wound_life;
                    ok = false;
                    text("Герой перебинтовал рану, ему стало лучше.");
                    game.inv[game.select] = item_slot;
                }
            }
            if (ok) {
                text("У героя нет ран, которые можно перебинтовать.");
            }
        }
        if (act === "funpotion") {
            var ok = true;
            funaddict = true;
            if (here[1] == "gusstation") {
                game.inv[game.select] = item_molotov;
            }
            if (here[1] == "wall") {
                drop(x, y, item_brokenglass);
                game.inv[game.select] = item_slot;
            } else for (var i in game.inv) {
                if (game.wound[i].name == "void" || game.wound[i].name == "notfun") {
                    game.wound[i] = wound_life;
                    game.inv[game.select] = item_slot;
                    ok = false;
                }
            }
            if (ok) {
                text("Герой не видит причин пить это, он же не алкаш какой-нибудь.");
            } else {
                text("Герой повеселел, хорошее зелье может поборать любой недуг.");
                drop(x, y, item_bottle);
            }
        }
        if (act == "brick") {
            if (!(a == 0 && b == 0)) {
                if (canMove(a, b)) {
                    text("Пожалуй приберегу несколько на строительство дома.");
                    game.map[x][y][1] = "wall";
                    action(a, b, "move");
                    game.inv[game.select] = item_slot;
                }
            } else {
                text("Даже не хочу думать, что будет если съесть эти семена.");
            }
        }

        if (act == "speedpotion") {
            if (here[1] == "gusstation") {
                game.inv[game.select] = item_molotov;
            }
            if (here[1] == "wall") {
                drop(x, y, item_brokenglass);
                game.inv[game.select] = item_slot;
            } else {
                game.speedup += 3;
                text("Герой видит как все замедляется на его глазах");
                drop(x, y, item_bottle);
                game.inv[game.select] = item_slot;
            }
        }
        key = false;
        // return "none";
    }

    function enemyturn() {
        for (f in fires) {
            if (enemyInPos(fires[f].x, fires[f].y)) {
                killEnemy(fires[f].x, fires[f].y, "fire");
            }
        }
        for (f in fires) {
            fires[f].duration -= 1;
            text(f + " " + fires[f].mass);
            if (fires[f].duration == 0) {
                for (var c = 0; c < fires[f].mass; c++) {
                    drop(fires[f].x, fires[f].y, item_ash);
                }
                fires.splice(f, 1);
            }
        }
        killNotAlive();
        if (funaddict) {
            funless++;
            if (funless >= 40) {
                addWound(wound_notfun);
                funless = 0;
                text("Что-то кошки на душе скребут...")
            }
        }
        starve++;
        var lvl = 40;
        if (helminth) {
            lvl = 25;
        }
        if (starve >= lvl) {
            starve = 0;
            addWound(wound_hungry);
        }


        function move(a, b, monster) {
            var wound = wound_bite;
            var item = item_slot;
            if (monster.name == "plant") {
                item = item_burdock;
            }
            if (monster.name == "ghost" || monster.name == "mummy") {
                wound = wound_void;
            }
            if (monster.name == "motherplant") {
                item = item_redburdock;
            }

            var nx = enemy.x + a;
            var ny = enemy.y + b;

            for (var e of game.enemy) {
                if (nx == e.x && ny == e.y && e.alive) {
                    if (monster.name == "plant" || monster.name == "motherplant") {
                        killEnemy(nx, ny);
                        text("Хрум-хрум-хрум");
                    } else {
                        nx = enemy.x;
                        ny = enemy.y;
                    }
                }
            }
            enemy.x = nx;
            enemy.y = ny;
            if (enemy.x == game.pos.x && enemy.y == game.pos.y) {
                text("Героя серьезно укусили");
                killEnemy(enemy.x, enemy.y);
                addItem(item);
                addWound(wound);
            }
            if (game.map[enemy.x][enemy.y][0] == "trap") {
                text("Кто-то попался в капкан");
                killEnemy(enemy.x, enemy.y);
                game.map[enemy.x][enemy.y][0] = "floor";
            }

            stamp = 0;
        }

        function near(x, y, a, b) {
            if (x == a - 1 && y == b) {
                return {a: -1, b: 0};
            }
            if (x == a + 1 && y == b) {
                return {a: 1, b: 0};
            }
            if (y == b + 1 && x == a) {
                return {a: 0, b: 1};
            }
            if (y == b - 1 && x == a) {
                return {a: 0, b: -1};
            }
            return {a: 0, b: 0};
        }

        if (game.speedup <= 0) {
            for (var enemy of game.enemy) {
                var px = enemy.x - game.pos.x + 4;
                var py = enemy.y - game.pos.y + 4;
                enemy.fromx = enemy.x;
                enemy.fromy = enemy.y;
                fow();
                if (px >= 0 && py >= 0 && px <= 8 && py <= 8) {
                    if (!game.fow[px][py]) {
                        // text("Тебя нашел еж!");
                        enemy.tax = game.pos.x;
                        enemy.tay = game.pos.y;
                        // text(enemy.tax+" "+enemy.tay);
                        // text(px+" "+py);
                        // text(game.pos.x+" "+game.pos.y);
                    } else {
                        // text("Еж тебя не видит!");
                        // text(enemy.tax+" "+enemy.tay);
                        //    text(px+" "+py);
                        //    text(game.pos.x+" "+game.pos.y);
                    }
                }
                if (enemy.alive) {
                    if (px >= 0 && py >= 0 && px <= 9 && py <= 9) {
                        if (enemy.name == "motherplant") {
                            var a = rndint(enemy.x - 9, enemy.x + 9);
                            var b = rndint(enemy.y - 9, enemy.y + 9);
                            if (!((a == game.pos.x || a == game.pos.x - 1 || a == game.pos.x + 1) && (b == game.pos.y || b == game.pos.y - 1 || b == game.pos.y + 1))) {
                                if (game.map[a][b][1] == "empty" && enemyInPos(a, b) == 0) {
                                    generateMonster("plant", a, b);
                                    text("Герой слышит вой новорожденного плотоядного растения ");
                                }
                            }

                            var okkk = true;
                            for (eka of game.enemy) {
                                var n = near(eka.x, eka.y, enemy.x, enemy.y);
                                if (n.a != 0 || n.b != 0 && okkk == true) {
                                    text("Хищный цветок кого-то заживал!")
                                    move(n.a, n.b, enemy);
                                    okkk = false;
                                }
                            }
                            if (okkk) {
                                var n = near(game.pos.x, game.pos.y, enemy.x, enemy.y);
                                if (n.a != 0 || n.b != 0) {
                                    move(n.a, n.b, enemy);
                                }
                            }
                        }

                        if (enemy.name == "plant") {
                            var n = near(game.pos.x, game.pos.y, enemy.x, enemy.y);
                            if (n.a != 0 || n.b != 0) {
                                move(n.a, n.b, enemy);
                            }

                        }
                        if (enemy.name == "hedgehog" || enemy.name == "fish" || enemy.name == "mummy") {
                            if (enemy.name == "fish") {
                                var fear = "floor";
                            } else {
                                var fear = "water";
                            }
                            var xmot = enemy.x - enemy.tax;
                            if (game.map[enemy.x - Math.sign(xmot)][enemy.y][1] != "empty" || game.map[enemy.x - Math.sign(xmot)][enemy.y][0] == fear || fireInPos(enemy.x - Math.sign(xmot), enemy.y)) {
                                xmot = 0;
                            }
                            var ymot = enemy.y - enemy.tay;
                            if (game.map[enemy.x][enemy.y - Math.sign(ymot)][1] != "empty" || game.map[enemy.x][enemy.y - Math.sign(ymot)][0] == fear || fireInPos(enemy.x, enemy.y - Math.sign(ymot))) {
                                ymot = 0;
                            }
                            if (Math.abs(xmot) < 6 && Math.abs(ymot) < 6) {
                                let rnd = Math.abs(xmot) + Math.abs(ymot);
                                rnd = rndint(1, rnd);
                                if (xmot == 0 && ymot == 0) {
                                } else {
                                    if (rnd <= Math.abs(xmot)) {
                                        if (xmot < 0) {
                                            move(1, 0, enemy);
                                        } else {
                                            move(-1, 0, enemy);
                                        }
                                    } else {
                                        if (ymot < 0) {
                                            move(0, 1, enemy);
                                        } else {
                                            move(0, -1, enemy);
                                        }
                                    }
                                }
                            }
                            fow();
                            px = enemy.x - game.pos.x + 4;
                            py = enemy.y - game.pos.y + 4;
                            if (px >= 0 && py >= 0 && px <= 8 && py <= 8) {
                                if (!game.fow[px][py]) {
                                    // text("Тебя нашел еж после хода!");
                                    enemy.tax = game.pos.x;
                                    enemy.tay = game.pos.y;
                                    // text(enemy.tax+" "+enemy.tay);
                                    // text(px+" "+py);
                                    // text(game.pos.x+" "+game.pos.y);
                                } else {
                                    // text("Еж тебя не видит после хода!");
                                    // text(enemy.tax+" "+enemy.tay);
                                    //    text(px+" "+py);
                                    //    text(game.pos.x+" "+game.pos.y);
                                }
                            }
                        }
                        if (enemy.name == "ghost") {
                            if (px >= 0 && py >= 0 && px <= 9 && py <= 9) {
                                enemy.tax = game.pos.x;
                                enemy.tay = game.pos.y;
                            }
                            var xmot = enemy.x - enemy.tax;
                            var ymot = enemy.y - enemy.tay;
                            if (Math.abs(xmot) < 6 && Math.abs(ymot) < 6) {
                                var rnd = Math.abs(xmot) + Math.abs(ymot);
                                rnd = rndint(1, rnd);
                                if (xmot == 0 && ymot == 0) {
                                } else {
                                    if (rnd <= Math.abs(xmot)) {
                                        if (xmot < 0) {
                                            move(1, 0, enemy);
                                        } else {
                                            move(-1, 0, enemy);
                                        }
                                    } else {
                                        if (ymot < 0) {
                                            move(0, 1, enemy);
                                        } else {
                                            move(0, -1, enemy);
                                        }

                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            game.speedup--;
            text(game.speedup);
        }
    }

    fow();
    text("--------------");
}

function killEnemy(x, y, wound) {
    for (var e in game.enemy) {
        if (game.enemy[e].x == x && game.enemy[e].y == y) {
            game.enemy[e].alive = false;
            if (game.enemy[e].name == "hedgehog") {
                if (!wound) {
                    drop(game.enemy[e].x, game.enemy[e].y, item_meat);
                }
                if (wound == "fire") {
                    drop(game.enemy[e].x, game.enemy[e].y, item_grill);
                }
            }

            if (game.enemy[e].name == "mummy") {
                if (!wound) {
                    drop(game.enemy[e].x, game.enemy[e].y, item_bandage);
                }
                if (wound == "fire") {
                    fire(x, y, 3, 1);
                }
            }
        }
    }
}
function fire(x, y, d, m) {
    var ok = true;
    for (f of fires) {
        if (f.x == x && f.y == y) {
            f.duration += d;
            f.mass += m;
            ok = false;
        }
    }
    if (ok) {
        fires[fires.length] = {x: x, y: y, duration: d, mass: m};
        text(fires[fires.length - 1].mass);
    }
}

function rndint(min, max) {
    var rand = min + Math.random() * (max - min)
    rand = Math.round(rand);
    return rand;
}
function drop(x, y, item) {
    var a = 0;
    var b = 0;
    var ok = false;
    var mass = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [-2, 0], [0, -2], [0, 2]];
    for (var r = 0; r < mass.length; r++) {
        if (!ok) {
            if (game.map[x + a][y + b][2] == "empty" && game.map[x + a][y + b][1] == "empty") {
                game.map[x + a][y + b][2] = item;
                ok = true;
            } else {
                a = mass[r][0];
                b = mass[r][1];
            }
        }
    }
}

function gameover(win) {
    if (win) {
        text("Вы выиграли!!! Нажмите ENTER чтобы играть снова!");
    } else {
        text("Вы проиграли. Нажмите ENTER чтобы начать сначала.");
    }
    gameovered = true;
}

// function text(string) {
//     $('#console').prepend("<br><br>");
//     $('#console').prepend(string);
//
//     var txt = $('#console').html().substring(0, 600);
//     $('#console').html(txt);
// }

function enemyInPos(x, y) {
    var r = 0;
    for (var e of game.enemy) {
        if (e.x == x && e.y == y) {
            r = e;
        }
    }
    return r;
}

function fireInPos(x, y) {
    var r = 0;
    for (var e of fires) {
        if (e.x == x && e.y == y) {
            r = e;
        }
    }
    return r;
}

function addWound(item) {
    var ok = true;
    for (var i in game.inv) {
        if (game.wound[i].name == "life" && ok) {
            game.wound[i] = item;
            ok = false;
        }
    }
    if (ok) {
        text("Слишком много ран...");
        gameover(false);
    }
}

function addItem(item) {
    var ok = true;
    var okkey = true;
    if (item.typ == "key") {
        text("Вы нашли КЛЮЧ!");
        text(allKeys.length);
        if (allKeys.length == 0) {
            gameover(true);
        }
    } else {
        for (var i in game.inv) {
            if (game.inv[i].name == "slot" && ok) {
                game.inv[i] = item;
                ok = false;
            }
        }
        if (ok) {
            return false;
        }
    }
    return true;
}

function fow() {
    //fow
    var posx = game.pos.x - (vision - 1) / 2;
    var posy = game.pos.y - (vision - 1) / 2;
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            game.fow[x][y] = false;
        }
    }
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            if (imfp(posx + x, posy + y, 1, game) == "wall") {
                if (x < 4 && y == 4) {
                    var a = x;
                    while (a > 0) {
                        a--;
                        game.fow[a][4] = true;
                        game.fow[a][5] = true;
                        game.fow[a][3] = true;
                    }
                }
                if (x > 4 && y == 4) {
                    var a = x;
                    while (a < 8) {
                        a++;
                        game.fow[a][4] = true;
                        game.fow[a][5] = true;
                        game.fow[a][3] = true;
                    }
                }
                if (x == 4 && y < 4) {
                    var a = y;
                    while (a > 0) {
                        a--;
                        game.fow[4][a] = true;
                        game.fow[5][a] = true;
                        game.fow[3][a] = true;
                    }
                }
                if (x == 4 && y > 4) {
                    var a = y;
                    while (a < 8) {
                        a++;
                        game.fow[4][a] = true;
                        game.fow[5][a] = true;
                        game.fow[3][a] = true;
                    }
                }
                if (x >= 4 && y >= 4) {
                    var a = x;
                    var b = y;
                    while (a < 8 && b < 8) {
                        a++;
                        b++;
                        game.fow[a][b] = true;
                        if (x <= y) {
                            game.fow[a - 1][b] = true
                        }
                        ;
                        if (x >= y) {
                            game.fow[a][b - 1] = true
                        }
                        ;
                    }
                }
                if (x >= 4 && y <= 4) {
                    var a = x;
                    var b = y;
                    while (a > 0 && a < 8 && b > 0 && b < 8) {
                        a++;
                        b--;
                        game.fow[a][b] = true;
                        if (x + y <= 8) {
                            game.fow[a - 1][b] = true
                        }
                        ;
                        if (x + y >= 8) {
                            game.fow[a][b + 1] = true
                        }
                        ;
                    }
                }
                if (x <= 4 && y <= 4) {
                    var a = x;
                    var b = y;
                    while (a > 0 && a < 8 && b > 0 && b < 8) {
                        a--;
                        b--;
                        game.fow[a][b] = true;
                        if (x >= y) {
                            game.fow[a + 1][b] = true
                        }
                        ;
                        if (x <= y) {
                            game.fow[a][b + 1] = true
                        }
                        ;
                    }
                }
                if (x <= 4 && y >= 4) {
                    var a = x;
                    var b = y;
                    while (a > 0 && a < 8 && b > 0 && b < 8) {
                        a--;
                        b++;
                        game.fow[a][b] = true;
                        if (x + y >= 8) {
                            game.fow[a + 1][b] = true
                        }
                        if (x + y <= 8) {
                            game.fow[a][b - 1] = true
                        }
                    }
                }
            }
        }
    }
}

function genPat(pattern, a, b) {
    var wallarr = [{x: a - 2, y: b - 2}, {x: a - 1, y: b - 2}, {x: a + 1, y: b - 2}, {x: a + 2, y: b - 2}, {
        x: a - 2,
        y: b - 1
    }, {x: a - 2, y: b + 1}, {x: a - 2, y: b + 2}, {x: a - 1, y: b + 2}, {x: a + 1, y: b + 2}, {
        x: a + 2,
        y: b + 2
    }, {x: a + 2, y: b + 1}, {x: a + 2, y: b - 1}];
    for (w in wallarr) {
        game.map[wallarr[w].x][wallarr[w].y][1] = "wall";
    }
    var emptyarr = [{x: a, y: b}, {x: a - 1, y: b - 1}, {x: a - 1, y: b}, {x: a - 1, y: b + 1}, {
        x: a,
        y: b - 1
    }, , {x: a, y: b + 1}, {x: a + 1, y: b - 1}, {x: a + 1, y: b}, {x: a + 1, y: b + 1}, {x: a, y: b + 2}, {
        x: a,
        y: b + 3
    }, , {x: a - 3, y: b}, {x: a - 2, y: b}, {x: a, y: b - 2}, {x: a, y: b - 3}, {x: a + 2, y: b}, {x: a + 3, y: b}];
    for (w in emptyarr) {
        game.map[emptyarr[w].x][emptyarr[w].y][1] = "empty";
    }
    // game.map[a][b][2] = "undefined"
}