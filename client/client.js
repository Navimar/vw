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

// function Pt(x, y) {
//     if (!_.isFinite(x)) throw "x invalid";
//     if (!_.isFinite(y)) throw "y invalid";
//     this.x = x;
//     this.y = y;
// }
//
// Pt.prototype.plus = function (pt) {
//     return new Pt(this.x + pt.x, this.y + pt.y);
// };

window.onload = function () {
    inputMouse();
    test();
    // sleep(1000);
    initModel();
    step(new Date().getTime());
    inputServer();
};

let test = () => {
    initModel();
};

function inputMouse() {
    function updOrder(e) {
        mousePos = getMousePos(canvas, e);
        mouseCell = {x: Math.floor((mousePos.x - shiftX) / dh), y: Math.floor(mousePos.y / dh)};

        if (mouseDown)
            click = mousePos;

        // console.log(click);
    }

    canvas.addEventListener("mousedown", e => {
        mouseDown = true;
        onMouseDown();
        updOrder(e);
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
    // socket.on('testFail', (val) => {
    //     onTestFail(val);
    //     socket.emit('end');
    // });
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
        model.wound.push("bottle");
        model.inv.push({img: "angel"});
        model.holst[x] = [];
        for (let y = 0; y < 9; y++) {
            model.holst[x][y] = "grass";
        }
    }
    model.obj = [{x: 1, y: 1, sx: 5, sy: 5, img: "test"}];
    model.stamp = 1;
    model.trx = 0;
    model.try = 0;
    model.selected = 0;
    model.tire = 0;
    model.order = {};
    model.orderCn = 0;
    model.lastorder = 0;
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
    model.dirx = val.dirx;
    model.diry = val.diry;
    model.wound = val.wound;
    model.message = val.message;
    // model.hand = val.hand;
    model.inv = val.inv;
    model.delay = val.delay;
    model.cnMass = val.cnMass;
    model.connected = val.connected;
    model.error = val.error;
    model.time = val.time;
    model.cnActive = val.cnActive;
    // model.obj = val.obj;
    model.ground = val.ground;
    for (let v of val.obj) {
        let ok = true;
        for (let m of model.obj) {
            if (m.id == v.id) {
                m.x = v.x;
                m.y = v.y;
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
    if (model.px != val.px || model.py != val.py) {
        model.stamp = 1;
    }
    model.px = val.px;
    model.py = val.py;
    if (!inAir && mouseDown) {
        // if (mouseCell.x + mouseCell.y > 8 && mouseCell.x > mouseCell.y) {
        //     orderRight();
        // }
        // if (mouseCell.x + mouseCell.y < 8 && mouseCell.x > mouseCell.y) {
        //     orderUp();
        // }
        // if (mouseCell.x + mouseCell.y < 8 && mouseCell.x < mouseCell.y) {
        //     orderLeft();
        // }
        // if (mouseCell.x + mouseCell.y > 8 && mouseCell.x < mouseCell.y) {
        //     orderDown();
        // }
        model.order.targetx = model.px + mouseCell.x - 4;
        model.order.targety = model.py + mouseCell.y - 4;
        model.order.name = "move";
        model.order.val = "point";
        model.orderCn++;
        if (mouseCell.x == 4 && mouseCell.y == 4) {
            orderStop();
        }
    }
    if (model.order.targetx === model.px && model.order.targety === model.py) {
        if (model.order.name == "move") orderStop();
    } else {
    }
    out();
}

function onStep(timeDiff) {
    status.server++;
    model.dtStartLoop = Date.now();
    for (let o of model.obj) {
        // console.log(o.sx);
        if (!_.isFinite(o.sx)) {
            o.sx = o.x + model.dirx;
        }
        if (!_.isFinite(o.sy)) {
            o.sy = o.y + model.diry;
        }
        // let ex = 0;
        // let ey = 0;
        // if ((model.targetx != model.px || model.targety != model.py) && o.name !== model.name) {
        //     switch (model.order) {
        //         case "up":
        //             ey += 1;
        //             break;
        //         case "right":
        //             ex -= 1;
        //             break;
        //         case "left":
        //             ex += 1;
        //             break;
        //         case "down":
        //             ey -= 1;
        //             break;
        //         default:
        //             break;
        //     }
        // // console.log(o.name);
        // }
        let r = range(o.sx, o.sy, o.x, o.y);
        if (r < 1) {
            r = 1;
        } else {
            r = 2;
            // console.log(r);
        }
        let m = move(o.sx, o.sy, o.x, o.y, r * constSpeed, timeDiff);
        o.sx = m.x;
        o.sy = m.y;
        // o.sx = o.x;
        // o.sy = o.y;
    }
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
    render(model);
    model.lastmessage = model.message;
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
    for (let y = -1; y < 10; y++) {
        for (let x = -1; x < 10; x++) {
            // drawImg("grass", x, y);
            drawImg("grass", x + model.trx, y + model.try);
            // for (let h of model.holst[x][y]) {
            //     drawImg(model.holst[x][y], x + model.trx, y + model.try);
            // }
        }
    }
    // for (let a = 0; a < model.tire; a++) {
    //     drawImg("target", 4, 4);
    // }
    for (let o of model.obj) {
        // drawImg(o.img, o.x, o.y);
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
        drawImg(model.wound[l], 9, l);
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
    drawImg("select", mouseCell.x, mouseCell.y);
    renderTarget();
    //
    //
    // for (let o of model.obj) {
    //     // drawImg("from", o.x, o.y);
    // }
    //


    // // if (model.hand != "hand") drawSize(model.hand.img, 4.25, 4.25,0.6,0.6);
    // if (model.message != model.lastmessage) message(model.message);
}

let renderStatus = () => {
    let str = "status.server: " + status.server + "</br>";
    str += "Пинг: " + model.ping + "</br>";
    str += "Расчет: " + model.delay + "</br>";
    str += "Ходит: " + model.cnActive + "</br>";
    str += "x: " + model.px + "</br>";
    str += "y: " + model.py + "</br>";
    str += "Игроков: " + model.connected + "</br>";
    str += "Err: " + model.error + "</br>";
    str += "Клиент: " + (Date.now() - model.dtStartLoop) + "</br>";
    str += "Время: " + model.time + "</br>";
    str += "ClickX: " + click.x + "</br>";
    str += "ClickY: " + click.y + "</br>";
    str += "mouseCellX: " + mouseCell.x + "</br>";
    str += "mouseCellY: " + mouseCell.y + "</br>";
    $("#ping").html(str);
};

let renderTarget = () => {
    // let ex = 0;
    // let ey = 0;
    // switch (model.order.val) {
    //     case "up":
    //         ey -= 1;
    //         break;
    //     case "right":
    //         ex += 1;
    //         break;
    //     case "left":
    //         ex -= 1;
    //         break;
    //     case "down":
    //         ey += 1;
    //         break;
    //     default:
    //         break;
    // }
    // drawImg("from", 4 + ex, 4 + ey);
    // console.log(model.tire);
    drawImg("from", model.order.targetx - model.px + 4, model.order.targety - model.py + 4);

};

function onMouseDown() {
    console.log('mouseDown');
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
        val: "right"
    };
    model.orderCn++;
}

function orderLeft() {
    model.order.targety = model.py;
    model.order.targetx = model.px - 1;
    model.order.name = "move";
    model.order.val = "left";
    model.orderCn++;
}

function orderUp() {
    model.order.targetx = model.px;
    model.order.targety = model.py - 1;
    model.order.name = "move";
    model.order.val = "up";
    model.orderCn++;
}

function orderDown() {
    model.order.targetx = model.px;
    model.order.targety = model.py + 1;
    model.order.name = "move";
    model.order.val = "down";
    model.orderCn++;
}

function orderStop() {
    model.order.name = "stop";
    model.order.val = 0;
    model.order.targetx = model.px;
    model.order.targety = model.py;
    model.orderCn++;
}
