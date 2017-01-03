const socket = io();


var model = {};
// const delta = 0.0001;
//
// const key = new Date().getTime();

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
    //inputMouse();
    inputServer();
    onStart();
};

function onStart() {
    model.holst = [];
    model.wound = [];
    model.inv = [];
    model.hand = "hand";
    for (let x = -1; x < 10; x++) {
        model.wound.push("bottle");
        model.holst[x] = [];
        for (let y = -1; y < 10; y++) {
            model.holst[x][y] = ["water"];
        }
    }
    model.obj = [];
    model.stamp = 1;
    model.trx = 0;
    model.try = 0;
}
//
// function inputMouse() {
//     function updOrder(e) {
//         input.mousePos = getMousePos(canvas, e);
//         if (input.mouseDown) input.order = input.mousePos;
//     }
//
//     canvas.addEventListener("mousedown", e => {
//         input.mouseDown = true;
//         updOrder(e);
//     }, false);
//     canvas.addEventListener("mouseup", e => {
//         input.mouseDown = false;
//     }, false);
//     canvas.addEventListener("mousemove", e => {
//         updOrder(e);
//     }, false);
// }

function inputServer() {
    socket.on('connect', function () {
        let login = false;
        socket.emit('login', login);
    });
    socket.on('updateState', function (val) {
        onServer(val);
    });
    socket.on('err', (val) => {
        console.log(val);
    });
    socket.on('login', (val) => {
        onLogin(val);
        step(new Date().getTime());
    });
    socket.on('ping', (val) => {
        let ping = -(model.date - new Date().getTime());
        model.ping = ping;
    });
}

function onLogin(val) {
    model.name = val;
    console.log('login ' + model.name);
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
    // model.holst = val.holst;
    for (let x = -1; x < 10; x++) {
        for (let y = -1; y < 10; y++) {
            model.holst[x][y] = ["grass"];
            if (x == -1 || x == 9 || y == 9 || y == -1) {
                // model.holst[x][y] = ["wall"];
            }
            if (x == -1) {
                for (let z of model.holst[0][y]) {
                    model.holst[x][y].push(z);
                }
            }
        }
    }
    model.dirx = val.dirx;
    model.diry = val.diry;
    model.wound = val.wound;
    model.message = val.message;
    model.hand = val.hand;
    model.inv = val.inv;
    model.delay = val.delay;
    model.mass = val.mass;
    model.connected = val.connected;
    model.error = val.error;
    model.time=val.time;
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
            if (!v.terrain) {
                model.obj.push(v);
            } else {
                model.holst[v.x][v.y].push(v.img);
            }
        }
    }
    for (let n in model.obj) {
        let ok = true;
        for (let v of val.obj) {
            if (model.obj[n].id == v.id) {
                ok = false;
            }
        }
        if (ok) {
            model.obj[n].outrange = true;
            // model.obj.splice(n, 1);
        }
    }
    if (model.px != val.px || model.py != val.py) {
        model.stamp = 1;
    }
    model.px = val.px;
    model.py = val.py;

    if (model.targetx == val.px && model.targety == val.py) {
        if (model.order == "up" || model.order == "down" || model.order == "left" || model.order == "right")
            model.order = "stop";
    }
    out(model);
}

function onStep(timeDiff) {
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
        // console.log(o.name);
        // }
        let m;
        if (o.outrange) {
            m = move(o.sx, o.sy, o.x - model.dirx, o.y - model.diry, 0.0012, timeDiff);
        } else {
            m = move(o.sx, o.sy, o.x, o.y, 0.0012, timeDiff);
        }
        o.sx = m.x;
        o.sy = m.y;

    }
    model.stamp -= timeDiff * 0.0012;
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


function out(m) {
    model.date = new Date().getTime();
    socket.emit("ping");
    let send = {order: m.order, targetx: m.targetx, targety: m.targety, slct: 0};
    socket.emit("order", send);
}


function vector(fx, fy, tx, ty, s) {
    const v = Math.sqrt(Math.pow(fx - tx, 2) + Math.pow(fy - ty, 2));
    if (v < 0.05) return {x: 0, y: 0};
    return {x: (tx - fx) * (s / v), y: (ty - fy) * (s / v)};
}

function move(fx, fy, tx, ty, speed, timeDiff) {
    const s = vector(fx, fy, tx, ty, speed);
    return {x: fx + s.x * timeDiff, y: fy + s.y * timeDiff};
}

function render(model) {
    resize();
    $("#ping").html("Пинг: " + model.ping + "</br>Расчет: " + model.delay + "</br> Ходит: " + model.mass + "</br> x: " + model.px + "</br> y: " + model.py + "</br> Игроков: " + model.connected + "</br> Err: " + model.error + "</br> Клиент: " + (Date.now() - model.dtStartLoop + "</br> Время:" + model.time));
    for (let y = -1; y < 10; y++) {
        for (let x = -1; x < 10; x++) {
            drawImg("grass", x + model.trx, y + model.try);
            for (let h of model.holst[x][y]) {
                drawImg(h, x + model.trx, y + model.try);
            }
        }
    }


    for (let a = 0; a < 9; a++) {
        let i;
        // for (let h of model.holstold[0][a]) {
        //     drawImg(h, -1 + model.trx, a);
        // }
        // i = model.holstold[a][8][0];
        // drawImg(i, 9 + model.trx, a);
        // i = model.holstold[a][0][0];
        // drawImg(i, a, 9 + model.try);
        // i = model.holstold[8][a][0];
        // drawImg(i, a, -1 + model.try);
    }

    for (let o of model.obj) {
        drawImg(o.img, o.sx, o.sy);
        // if (!(o.x == 4 && o.y == 4)) {
            drawTxt(o.id, o.sx, o.sy);
        //     drawSize("friend", o.sx - 0.3, o.sy - 0.3, 0.3, 0.3);
        // }
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

    for (let o of model.obj) {
        // drawImg("from", o.x, o.y);
    }

    let ex = 0;
    let ey = 0;
    switch (model.order) {
        case "up":
            ey -= 1;
            break;
        case "right":
            ex += 1;
            break;
        case "left":
            ex -= 1;
            break;
        case "down":
            ey += 1;
            break;
        case "useup":
            ey -= 1;
            break;
        case "useright":
            ex += 1;
            break;
        case "useleft":
            ex -= 1;
            break;
        case "usedown":
            ey += 1;
            break;
        default:
            break;
    }
    drawImg("from", 4 + ex, 4 + ey);
    // if (model.hand != "hand") drawSize(model.hand.img, 4.25, 4.25,0.6,0.6);
    if (model.message != model.lastmessage) message(model.message);
}
function onKeydown(key) {
    if (!_.isFinite(model.targetx) || !_.isFinite(model.targety)) {
        model.targetx = model.px;
        model.targety = model.py;
    }
    // if (model.px == model.targetx && model.py == model.targety) {
    switch (key) {
        case "up":
            model.targetx = model.px;
            model.targety = model.py - 1;
            model.order = "up";
            break;
        case "right":
            model.targety = model.py;
            model.targetx = model.px + 1;
            model.order = "right";
            break;
        case "left":
            model.targety = model.py;
            model.targetx = model.px - 1;
            model.order = "left";
            break;
        case "down":
            model.targetx = model.px;
            model.targety = model.py + 1;
            model.order = "down";
            break;
        default:
            model.order = key;

    }
    // }
    out(model);
}

function onKeyup() {
    // model = (() => {
    //     let up = model;
    //     return up;
    // })();
    // out(model);
}

// function getMousePos(canvas, evt) {
//     let rect = canvas.getBoundingClientRect();
//     return new Pt(
//         evt.clientX - rect.left,
//         evt.clientY - rect.top
//     );
// }