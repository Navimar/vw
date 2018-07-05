const grafio = initGrafio();

//load
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const questionmark = new Image;
questionmark.src = 'img/undefined.png';
// console.log(img);

// function draw(obj2d){
//     for(var obj of obj2d) {
//         if(typeof window[obj.img] == "undefined"){obj.img="questionmark"}
//         //console.log(window[obj.img]);
//         ctx.drawImage(window[obj.img], obj.pt.x - obj.r, obj.pt.y - obj.r, obj.r * 2, obj.r * 2);
//     }
// }
let dh = 0;
let shiftX = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (canvas.width > canvas.height) {
        dh = canvas.height / 9;
        shiftX = (canvas.width - dh * 9) / 2;
    } else {
        dh = canvas.width / (9 + 4);
    }

    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawImg(name, x, y) {
    let img = grafio(name);
    if (img === undefined || img === null) {
        img = questionmark;
    }
    // console.log(img);
    ctx.drawImage(img, x * dh + shiftX, y * dh, dh, dh);
}

// function animate(i, x, y, fx, fy, p) {
//     let dx = fx + (x - fx) * p / 100;
//     let dy = fy + (y - fy) * p / 100;
//     drawImg("from", x, y);
//     drawImg(i, dx, dy);
//
// }

function drawTxt(txt, x, y, color) {
    color = color || '#222';
    ctx.font = '13pt Verdana';
    ctx.fillStyle = 'white';
    ctx.textBaseline = "top";
    //console.log(txt);
    // ctx.fillText(txt, x * dh + shiftX, y * dh);
    // ctx.strokeText(txt,  x * dh + shiftX, y * dh);
    wrapText(ctx, txt, x * dh + shiftX + 10, y * dh + 10, dh * 3, 25);

    // drawBubble(x, y, px, py);

    function wrapText(context, text, marginLeft, marginTop, maxWidth, lineHeight) {
        function dt() {
            ctx.fillStyle = color;
            for (let blx = 1; blx <=3 ; blx++) {
                for (let bly = 1; bly <= 3; bly++) {
                    context.fillText(line, marginLeft + blx, marginTop + bly);
                    context.fillText(line, marginLeft - blx, marginTop - bly);
                    context.fillText(line, marginLeft + blx, marginTop - bly);
                    context.fillText(line, marginLeft - blx, marginTop + bly);
                }
            }
            ctx.font = '13pt Verdana';
            ctx.fillStyle = 'white';
            context.fillText(line, marginLeft, marginTop);
        }

        let words = text.split(" ");
        let countWords = words.length;
        let line = "";
        for (let n = 0; n < countWords; n++) {
            let testLine = line + words[n] + " ";
            let testWidth = context.measureText(testLine).width;
            if (testWidth > maxWidth) {
                dt();
                line = words[n] + " ";
                marginTop += lineHeight;
            }
            else {
                line = testLine;
            }
            dt();
        }

    }

    function drawBubble(x, y, px, py) {
        x = x * dh + shiftX;
        y = y * dh;
        px = px * dh + shiftX + dh / 2;
        py = py * dh + dh / 2;
        let w = dh * 3;
        let h = 100;
        let radius = 20;
        var r = x + w;
        var b = y + h;
        if (py < y || py > y + h) {
            var con1 = Math.min(Math.max(x + radius, px - 10), r - radius - 20);
            var con2 = Math.min(Math.max(x + radius + 20, px + 10), r - radius);
        }
        else {
            var con1 = Math.min(Math.max(y + radius, py - 10), b - radius - 20);
            var con2 = Math.min(Math.max(y + radius + 20, py + 10), b - radius);
        }
        var dir;
        if (py < y) dir = 2;
        if (py > y) dir = 3;
        if (px < x && py >= y && py <= b) dir = 0;
        if (px > x && py >= y && py <= b) dir = 1;
        if (px >= x && px <= r && py >= y && py <= b) dir = -1;
        ctx.beginPath();
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = "2";
        ctx.moveTo(x + radius, y);
        if (dir == 2) {
            ctx.lineTo(con1, y);
            ctx.lineTo(px, py);
            ctx.lineTo(con2, y);
            ctx.lineTo(r - radius, y);
        }
        else ctx.lineTo(r - radius, y);
        ctx.quadraticCurveTo(r, y, r, y + radius);
        if (dir == 1) {
            ctx.lineTo(r, con1);
            ctx.lineTo(px, py);
            ctx.lineTo(r, con2);
            ctx.lineTo(r, b - radius);
        }
        else ctx.lineTo(r, b - radius);
        ctx.quadraticCurveTo(r, b, r - radius, b);
        if (dir == 3) {
            ctx.lineTo(con2, b);
            ctx.lineTo(px, py);
            ctx.lineTo(con1, b);
            ctx.lineTo(x + radius, b);
        }
        else ctx.lineTo(x + radius, b);
        ctx.quadraticCurveTo(x, b, x, b - radius);
        if (dir == 0) {
            ctx.lineTo(x, con2);
            ctx.lineTo(px, py);
            ctx.lineTo(x, con1);
            ctx.lineTo(x, y + radius);
        }
        else ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.stroke();
    }
}


function drawSize(name, x, y, w, h) {
    let img = grafio(name);
    if (img === undefined || img === null) {
        img = questionmark;
    }
    // console.log(img);
    ctx.drawImage(img, x * dh + shiftX, y * dh, dh * w, dh * h);
}

function drawWeb(name, x, y, w, h) {
    let img = grafio(name);
    if (img === undefined || img === null) {
        img = questionmark;
    }
    // img.src=canvas.toDataURL("https://i.stack.imgur.com/MxDfS.png");
    // console.log(img);
    ctx.drawImage(img, x * dh + shiftX, y * dh, dh * w, dh * h);
}

function drawHolst(x, y) {
    for (let h of model.holst[x][y]) {
        drawImg(h, x + model.trx, y + model.try);
    }
}

function message(string) {
    $('#console').prepend("<br><br>");
    $('#console').prepend(string);

    var txt = $('#console').html().substring(0, 600);
    $('#console').html(txt);
}

function initGrafio() {
    let imgs = new Map();
    return (url, onLoad) => {
        let img = imgs.get(url);
        if (img) {
            return img.complete && img.naturalWidth !== 0 ? img : null;
        } else {
            img = new Image();
            img.onload = onLoad;
            img.src = "img/" + url + ".png";
            imgs.set(url, img);
            return null;
        }
    }
}

