const socket = io();
const constSpeed = 0.00065;
const login = {};
login.pass = findGetParameter("key");
login.id = findGetParameter("id");
// if (login.pass == "" || login.pass == undefined) {
//     login.pass = "demo";
// }
// login.name = "game";


let model = {};
let status = {server: 0};
let click = {x: 0, y: 0};
let mouseDown = false;
let mousePos = {x: 0, y: 0};
let mouseCell = {x: 0, y: 0};
let inAir = false;
let extra = {x: 0, y: 0};
let describe = {
    show: true,
    text: 'Добро пожаловать в ...!',
    x: 1,
    y: 1,
    time: 10000,
};

window.onload = function () {
    inputMouse();
    test();
    // sleep(1000);
    initModel();
    step(new Date().getTime());
    inputServer();
};

document.addEventListener('visibilitychange', function(e) {
    console.log(document.hidden);
});

let test = () => {
    initModel();
};

function updOrder(e) {
    mousePos = getMousePos(canvas, e);
    // mouseCell = {
    //     x: Math.floor((mousePos.x - shiftX) / dh)-model.trx,
    //     y: Math.floor((mousePos.y ) / dh-model.try)
    // };

    if (mouseDown){
        click = mousePos;
    }

    // console.log(click);
}

function inputMouse() {
    canvas.addEventListener("mousedown", e => {
        switch (e.which) {
            case 1:
                //Left Mouse button pressed.
                mouseDown = true;
                onMouseDown();
                updOrder(e);
                break;
            case 3:
                //Right Mouse button pressed.
                let dx = mouseCell.x + 0.5;
                let dy = mouseCell.y;
                if (mouseCell.x === 7) {
                    if (dy > 6) {
                        dx -= 4;
                    } else {
                        dx = 7;
                        dy += 1;
                    }
                }
                if (mouseCell.y > 7) {
                    dx -= 4;
                }
                if (mouseCell.x === 9) {
                    dx = 6;
                }
                describe.x = dx;
                describe.y = dy;
                describe.time = 10000;
                let txt = "Здесь ничего нет";
                if (mouseCell.x === -1) {
                    if (model.inv[mouseCell.y]) {
                        txt = model.inv[mouseCell.y].describe;
                    } else {
                        txt = "Пустой мешок. Перенесите сюда предмет с земли";
                    }
                } else if (mouseCell.x == -2) {
                    if (model.ground[mouseCell.y]) {
                        txt = model.ground[mouseCell.y].describe;
                    } else {
                        txt = "Здесь перечислены предметы на земле, перенесите предмет отсюда на мешочек, чтобы подобрать его";
                    }
                } else if (mouseCell.x == 9) {
                    if (model.wound[mouseCell.y]) {
                        txt = model.wound[mouseCell.y].describe;
                    }
                } else if (mouseCell.x == 4 && mouseCell.y == 4) {
                    txt = "Это Вы!";
                } else {
                    for (let o of model.obj) {
                        if (o.x === mouseCell.x && o.y === mouseCell.y)
                            txt = o.describe;
                    }
                }
                describe.text = txt;
                break;
            default:
                alert('You have a strange Mouse!');
        }
    }, false);
    canvas.addEventListener("mouseup", e => {
        mouseDown = false;
        onMouseUp();
        updOrder(e);
    }, false);
    canvas.addEventListener("mousemove", e => {
        updOrder(e);
    }, false);
}

function inputServer() {
    socket.on('connect', function () {
        socket.emit('login', login);
        console.log('connected');
    });
    socket.on('updateState', function (val) {
        onServer(val);
    });
    socket.on('errorr', (val) => {
        alert(val);
    });
    socket.on('login', (val) => {
        onLogin(val);
    });
    socket.on('ping', (val) => {
        let ping = -(model.date - new Date().getTime());
        model.ping = ping;
    });
}

function onLogin(val) {
    console.log('login ' + val);
    if (val == 'authentication error') {
        alert(val);
    }
    initModel();
    step(new Date().getTime());
}

function initModel() {
    model.holst = [];
    model.wound = [];
    model.inv = [];
    model.ground = [];
    for (let x = 0; x < 9; x++) {
        model.wound.push({img: "bottle"});
        model.inv.push({img: "angel"});
        model.holst[x] = [];
        for (let y = 0; y < 9; y++) {
            model.holst[x][y] = "grass";
        }
    }
    model.obj = [{x: 1, y: 1, sx: 5, sy: 5, img: "test", describe: "test", message: {text: "Start!!!", color: "red"}}];
    model.stamp = 1;
    model.selected = 0;
    model.tire = 0;
    model.order = {};
    model.orderCn = 0;
    model.lastorder = 0;
    model.dirx = 0;
    model.diry = 0;
}

window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


function step(lastTime) {
    let time = new Date().getTime();
    let timeDiff = time - lastTime;
    lastTime = time;

    onStep(timeDiff);
    requestAnimFrame(function () {
        step(lastTime);
    });
}

function onServer(val) {
    extra.x = 0;
    extra.y = 0;
    status.server = 0;
    // for (let x = 0; x < 9; x++) {
    //     let r = model.holst[x][0];
    //     model.holst[x][-1] = r;
    // // }
    // for (let x = 0; x < 9; x++) {
    //     for (let y = 0; y < 9; y++) {
    //         model.holst[x][y] = "grass";
    //     }
    // }
    model.tire = val.tire;
    if (val.dir) {
        model.dirx = val.dir.x;
        model.diry = val.dir.y;
    }
    model.wound = val.wound;
    // model.hand = val.hand;
    model.inv = val.inv;
    model.delay = val.delay;
    model.cnMass = val.cnMass;
    model.connected = val.connected;
    model.error = val.error;
    model.time = val.time;
    model.cnActive = val.cnActive;
    model.ground = val.ground;
    for (let v of val.obj) {
        let ok = true;
        for (let m of model.obj) {
            if (m.id === v.id) {
                m.z = v.z;
                if (m.x !== v.x) {
                    // m.ox =m.x;
                    m.x = v.x;
                }
                if (m.y !== v.y) {
                    // m.oy =m.y;
                    m.y = v.y;
                }
                if (!_.isEqual(m.message, v.message)) {
                    console.log(m.message, v.message);
                    m.message = v.message;
                    m.messagetime = 10000;
                }
                m.describe = v.describe;
                m.img = v.img;
                ok = false;
            }
        }
        if (ok) {
            model.obj.push(v);
        }
    }
    for (let n in model.obj) {
        let ok = true;
        for (let v of val.obj) {
            if (model.obj[n].id == v.id) {
                ok = false;
            }
        }
        if (ok && model.obj[n].outrange > 0) {
            model.obj[n].outrange++;
        }
        if (ok && !model.obj[n].outrange) {
            model.obj[n].outrange = 1;
            model.obj[n].x -= model.dirx;
            model.obj[n].y -= model.diry;
        }
        if (ok && model.obj[n].outrange > 600) {
            model.obj.splice(n, 1);
        }
    }
    // model.obj = val.obj;

    if (model.px != val.px || model.py != val.py) {
        model.stamp = 1;
    }
    model.px = val.px;
    model.py = val.py;
    model.obj.sort((a, b) => {
        if (a.z < b.z) {
            return -1;
        } else return 1;
    });
    // if (!inAir && mouseDown) {
    //     // if (mouseCell.x + mouseCell.y > 8 && mouseCell.x > mouseCell.y) {
    //     //     orderRight();
    //     // }
    //     // if (mouseCell.x + mouseCell.y < 8 && mouseCell.x > mouseCell.y) {
    //     //     orderUp();
    //     // }
    //     // if (mouseCell.x + mouseCell.y < 8 && mouseCell.x < mouseCell.y) {
    //     //     orderLeft();
    //     // }
    //     // if (mouseCell.x + mouseCell.y > 8 && mouseCell.x < mouseCell.y) {
    //     //     orderDown();
    //     // }
    //     model.order.targetx = model.px + mouseCell.x - 4;
    //     model.order.targety = model.py + mouseCell.y - 4;
    //     model.order.name = "move";
    //     model.order.val = "point";
    //     model.orderCn++;
    //     if (mouseCell.x == 4 && mouseCell.y == 4) {
    //         orderStop();
    //     }
    // }
    // if (model.order.targetx === model.px && model.order.targety === model.py) {
    //     if (model.order.name == "move") orderStop();
    // } else {
    // }
    out();
}

function onStep(timeDiff) {
    status.server++;
    model.dtStartLoop = Date.now();
    for (let o of model.obj) {
        if (!_.isFinite(o.sx) || !_.isFinite(o.sy)) {
            // if (model.dirx !== 0 || model.diry !== 0) {
            //     o.sx = o.x + model.dirx;
            //     o.sy = o.y + model.diry;
            // } else {
            if ((o.x === 8 && o.y === 8) || (o.x === 8 && o.y === 0) || (o.x === 0 && o.y === 8) || (o.x === 0 && o.y === 0)) {
                o.sx = o.x + model.dirx;
                o.sy = o.y + model.diry;
            } else {
                if (o.x === 0) {
                    o.sx = -1;
                } else if (o.x === 8) {
                    o.sx = 9;
                } else {
                    o.sx = o.x;
                }
                if (o.y === 0) {
                    o.sy = -1;
                } else if (o.y === 8) {
                    o.sy = 9;
                } else {
                    o.sy = o.y;
                }
            }
        }
        let r = range(o.sx, o.sy, o.x, o.y);
        if (r < 1) {
            r = 1;
        }
        // else {
        //     r = 2;
        //     // console.log(r);
        // }
        let m = move(o.sx, o.sy, o.x + extra.x, o.y + extra.y, r * constSpeed, timeDiff);
        o.sx = m.x;
        o.sy = m.y;
        // o.sx = o.x;
        // o.sy = o.y;
        if (o.messagetime > 0)
            o.messagetime -= timeDiff;
    }
    // for (let o of model.obj) {
    //     // let dirx = o.x - o.ox;
    //     // let diry = o.y - o.oy;
    //     o.trx = o.dirx * model.stamp;
    //     o.try = o.diry * model.stamp;
    //     o.trx = 1 * model.stamp;
    //     o.try = 0 * model.stamp;
    //
    // }

    model.stamp -= timeDiff * constSpeed;
    if (model.stamp < 0) {
        model.stamp = 0;
        // model.holstold = model.holst;
        for (let n in model.obj) {
            if (model.obj[n].outrange) {
                model.obj.splice(n, 1);
            }
        }
    }
    model.trx = model.dirx * model.stamp;
    model.try = model.diry * model.stamp;

    if (mousePos.x > shiftX) {
        mouseCell = {
            x: Math.floor((mousePos.x - shiftX) / dh - model.trx),
            y: Math.floor((mousePos.y) / dh - model.try)
        }
    } else {
        mouseCell = {
            x: Math.floor((mousePos.x - shiftX) / dh),
            y: Math.floor((mousePos.y) / dh)
        }
    }
    render(model);
    if (describe.time > 0) {
        describe.time -= timeDiff;
    } else {
        describe.time = 0;
    }
    // model.lastmessage = model.message;
}


function out() {
    model.date = new Date().getTime();
    // socket.emit("ping");
    // let send= {order: model.order, targetx: model.targetx, targety: model.targety};
    if (model.lastorder !== model.orderCn) {
        socket.emit("order", model.order);
        model.lastorder = model.orderCn;
    }
}

function range(fx, fy, tx, ty) {
    return Math.sqrt(Math.pow(fx - tx, 2) + Math.pow(fy - ty, 2));
}

function vector(fx, fy, tx, ty, s) {
    const v = range(fx, fy, tx, ty);
    if (v < 0.01) return {x: 0, y: 0};
    return {x: (tx - fx) * (s / v), y: (ty - fy) * (s / v)};
}

function move(fx, fy, tx, ty, speed, timeDiff) {
    const s = vector(fx, fy, tx, ty, speed);
    return {x: fx + s.x * timeDiff, y: fy + s.y * timeDiff};
}

function render(model) {
    resize();
    renderStatus();
    if (!inAir && mouseDown) {
        moveOrder();
    }

    //render grass
    for (let y = -1; y < 10; y++) {
        for (let x = -1; x < 10; x++) {
            // drawImg("grass", x, y);
            drawImg("dark", x + model.trx, y + model.try);
            // for (let h of model.holst[x][y]) {
            //     drawImg(model.holst[x][y], x + model.trx, y + model.try);
            // }
        }
    }
    //render tire
    // for (let a = 0; a < model.tire; a++) {
    //     drawImg("target", 4, 4);
    // }
    drawImg("target", model.order.targetx - model.px + 4 + model.trx, model.order.targety - model.py + 4 + model.try);

    // for (let o of model.obj) {
    //     drawImg("from", o.x + model.trx, o.y + model.try);
    // }

    for (let o of model.obj) {
        drawImg(o.img, o.sx, o.sy);
    }


    for (let a = 0; a < 9; a++) {
        drawImg("black", 9, a);
        drawImg("black", 10, a);
        drawImg("black", -1, a);
        drawImg("black", -2, a);
        drawImg("black", a, 9);
        drawImg("black", a, 10);
        drawImg("black", a, -1);
        drawImg("black", a, -2);
    }
    for (let l = 0; l < 9; l++) {
        drawImg(model.wound[l].img, 9, l);
    }
    let itma = 0;
    for (let i of model.inv) {
        drawImg(i.img, -1, itma);
        itma++;
    }
    for (let bag = itma; bag < 9; bag++) {
        drawImg("slot", -1, bag);
    }
    //
    for (let i in model.ground) {
        if (model.ground[i].isNailed) {
            drawImg('isNailed', -2, i);
        } else {
            drawImg('canTake', -2, i);
        }
        drawImg(model.ground[i].img, -2, i);
    }

    // let y = 0;
    // for (let o of model.obj) {
    //     if (o.x === 4 && o.y === 4) {
    //         if (o.img !== 'hero') {
    //             drawImg(o.img, -2, y);
    //             y++;
    //         }
    //     }
    // }

    if (mouseDown && inAir.obj) {
        drawImg(inAir.obj.img, (mousePos.x - shiftX) / dh - 0.5, mousePos.y / dh - 0.5);
    }
    if (mouseCell.x >= 0 && mouseCell.x < 9) {
        drawImg("select", mouseCell.x + model.trx, mouseCell.y + model.try);
    } else {
        drawImg("select", mouseCell.x, mouseCell.y);
        // drawImg("select", mouseCell.x + model.trx, mouseCell.y + model.try);

    }
    // // if (model.hand != "hand") drawSize(model.hand.img, 4.25, 4.25,0.6,0.6);
    // if (model.message != model.lastmessage) message(model.message);
    // drawWeb("http://tourist.kg/wp-content/uploads/2017/04/7e623540e23ca8273a41cab254b2edb1.png",0,0,2,1);

    //text
    for (let o of model.obj) {
        if (o.message) {
            if (o.messagetime > 0)
                drawTxt(o.message.text, o.x + model.trx + 0.5, o.y + model.try, o.message.color);
            // drawTxt(o.message.text, o.x + 0.5, o.y, o.message.color);
        }
    }
    // drawTxt("Растение со съедобным клубнем. Выкопайте его лопатой", dx + model.trx, dy + model.try, mouseCell.x + model.trx, mouseCell.y + model.try);
    if (describe.time > 0) drawTxt(describe.text, describe.x, describe.y);
}

let renderStatus = () => {
    let loc = (location.href).substr(0, 9);
    if (loc == "http://46") loc = '';
    if (loc == "http://12") loc = 'local';
    status.server += "";
    while (status.server.length < 3) {
        status.server = "0" + status.server;
    }
    let str = "";
    str += "" + loc + "</br>";
    str += "status: " + status.server + "</br>";
    // str += "Пинг: " + model.ping + "</br>";
    str += "delay: " + model.delay + "</br>";
    str += "time: " + model.time + "</br>";
    str += "online: " + model.connected + "</br>";
    // str += "Ходит: " + model.cnActive + "</br>";
    str += "X: " + model.px + "</br>";
    str += "Y: " + model.py + "</br>";
    // str += "Err: " + model.error + "</br>";
    // str += "Клиент: " + (Date.now() - model.dtStartLoop) + "</br>";
    // str += "extraX: " + extra.x + "</br>";
    // str += "extraY: " + extra.y + "</br>";
    // str += "ClickX: " + click.x + "</br>";
    // str += "ClickY: " + click.y + "</br>";
    // str += "mouseCellX: " + mouseCell.x + "</br>";
    // str += "mouseCellY: " + mouseCell.y + "</br>";
    $("#ping").html(str);
};

function onMouseDown() {
    // console.log('mouseDown');
    if (mouseCell.x === -2) {
        inAir = {from: 'ground', obj: model.ground[mouseCell.y]};
    }
    if (mouseCell.x === -1) {
        if (model.inv[mouseCell.y]) {
            inAir = {from: 'inv', obj: model.inv[mouseCell.y]};
        }
    }

    out();
}
function moveOrder() {
    model.order.targetx = model.px + mouseCell.x - 4;
    model.order.targety = model.py + mouseCell.y - 4;
    model.order.name = "move";
    model.order.val = "point";
    model.orderCn++;
    if (mouseCell.x == 4 && mouseCell.y == 4) {
        orderStop();
    }
}

function onMouseUp() {
    if (inAir) {
        if (mouseCell.x === -1 && inAir.from === 'ground') {
            // alert('take ' + inAir.obj.id + " " + inAir.obj.img);
            model.order = {
                name: 'take',
                val: inAir.obj.id
            };
            model.orderCn++;
        }
        if (mouseCell.x === -1 && inAir.from === 'inv') {
            // alert('take ' + inAir.obj.id + " " + inAir.obj.img);
            model.order = {
                name: 'useinv',
                val: {
                    from: inAir.from,
                    id: inAir.obj.id,
                    target: model.inv[mouseCell.y].id
                }

            };
            model.orderCn++;
        }
        if (mouseCell.x === -2 && inAir.from === 'inv') {
            model.order = {
                name: 'drop',
                val: inAir.obj.id
            };
            model.orderCn++;
        }
        if (mouseCell.x >= 0) {
            model.order = {
                name: 'use',
                val: {
                    from: inAir.from,
                    id: inAir.obj.id,
                    targetX: model.px + mouseCell.x - 4,
                    targetY: model.py + mouseCell.y - 4
                }
            };
            model.orderCn++;
            console.log(model.order);
        }
        if (mouseCell.x >= 9) {
            model.order = {
                name: 'use',
                val: {
                    from: inAir.from,
                    id: inAir.obj.id,
                    targetX: model.px,
                    targetY: model.py,
                }
            };
            model.orderCn++;
            console.log(model.order);
        }

    }
    // console.log(inAir.obj);
    inAir = false;
    // out();
}


function onKeydown(key) {
    // console.log('keydown');
    // if (!_.isFinite(model.targetx) || !_.isFinite(model.targety)) {
    //     model.targetx = model.px;
    //     model.targety = model.py;
    // }
    // if (model.px == model.targetx && model.py == model.targety) {
    switch (key) {
        case "up":
            orderUp();
            break;
        case "right":
            orderRight();
            break;
        case "left":
            orderLeft();
            break;
        case "down":
            orderDown();
            break;
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "1":
            model.selected = key - 1;
            break;
        default:
            model.order.name = key;
            model.order.val = 0;
            model.orderCn++;
            break;
    }
    // }
    out();
}

function onKeyup(key) {
    model.keyup = true;
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    }
}


function orderRight() {
    model.order = {
        targety: model.py,
        targetx: model.px + 1,
        name: "move",
        val: "point"
    };
    model.orderCn++;
}

function orderLeft() {
    model.order.targety = model.py;
    model.order.targetx = model.px - 1;
    model.order.name = "move";
    model.order.val = "point";
    model.orderCn++;
}

function orderUp() {
    model.order.targetx = model.px;
    model.order.targety = model.py - 1;
    model.order.name = "move";
    model.order.val = "point";
    model.orderCn++;
}

function orderDown() {
    model.order.targetx = model.px;
    model.order.targety = model.py + 1;
    model.order.name = "move";
    model.order.val = "point";
    model.orderCn++;
    if (model.stamp === 0) {
        extra.x = 0;
        extra.y = -1;
    }
}

function orderStop() {
    model.order.name = "stop";
    model.order.val = 0;
    model.order.targetx = model.px;
    model.order.targety = model.py;
    model.orderCn++;
}
