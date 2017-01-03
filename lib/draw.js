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
var dh = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (canvas.width > canvas.height) {
        dh = canvas.height / 9;
    } else {
        dh = canvas.width / (9 + 4);
    }
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawImg(name, x, y) {
    let img = grafio(name);
    // if (name == "empty") return;
    if (img === undefined || img === null) {
        drawTxt(img, x, y);
        img = questionmark;
    }
    // console.log(img);
    ctx.drawImage(img, x * dh + dh + 200, y * dh, dh, dh);
}

// function animate(i, x, y, fx, fy, p) {
//     let dx = fx + (x - fx) * p / 100;
//     let dy = fy + (y - fy) * p / 100;
//     drawImg("from", x, y);
//     drawImg(i, dx, dy);
//
// }

function drawTxt(txt, x, y) {
    ctx.font = '15pt Consolas';
    ctx.fillStyle = 'white';
    //console.log(txt);
    ctx.fillText(txt, x * dh + dh + 200, y * dh);
}

function drawSize(name, x, y, w, h) {
    let img = grafio(name);
    if (name == "empty") return;
    if (img === undefined || img === null) {
        // console.log("img " + img + " not founded");
        img = questionmark;
    }
    // console.log(img);
    ctx.drawImage(img, x * dh + dh + 200, y * dh, dh * w, dh * h);
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