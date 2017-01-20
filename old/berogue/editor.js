const grafio = initGrafio();
const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');

var map = [];
var cmd=[];
var powx=10;
var powy=10;
var mosx=0;
var mosy=0;
var mosd=false;
var layer=0;
var brush="water";
cmd.dir=null;
function init() {

    for (x = 0; x < 1000; x++) {
        map[x] = [];
        for (y = 0; y < 1000; y++) {
            map[x][y] = [];
            for (z = 0; z < 3; z++) {
                map[x][y][z] = "empty";
            }
        }
    }


    for (x = 0; x < 1000; x++) {
        for (y = 0; y < 1000; y++) {
            map[x][y][0] = "floor";
        }
    }
    map[12][12][0]="wall";
}
function drawimg(name, x, y) {
    var img = grafio(name);
    if (name == "empty") return;
    if (name == undefined || name == null) img = "undefined";
//    console.log(name+" "+grafio(name));
    if (img) ctx.drawImage(img, x * dh, y * dh, dh, dh);
}

function draw(){
    if (cmd.dir == "left") {
        powx-=10;
        if (powx<0) {
            powx=0;
        }
    }
    if (cmd.dir == "up") {
        powy-=10;
        if( powy<0) {
            powy=0;
        }
    }
    if (cmd.dir == "right") {
        powx+=10;
        if( powx>900) {
            powx=900;
         }
    }
    if (cmd.dir == "down") {
        powy+=10;
        if( powy>900) {
                    powy=900;
                 }
    }
    cmd.dir =null;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (canvas.width > canvas.height) {
        dh = canvas.height / 30;
    } else {
        dh = canvas.width / (30 + 4);
    }
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (x = 0; x < 100; x++) {
        for (y = 0; y < 100; y++) {
            for (z = 0; z < 2; z++){
                var name = map[x+powx][y+powy][z];
                drawimg(name, x, y)
            }
        }
    }
}


window.onload = function () {
    init();
    var oldtime=0;
    function loop(time) {
            var frame = time - oldtime;
            oldtime = time;
            draw(10,10);
            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);

}
window.onkeydown = function (e) {
    // if(codeOld == e.code){
    //     cmd = null;
    //     return;
    // }
    // console.log(e.code);
    codeOld = e.code;
    if (e.code == "ArrowLeft") {
        cmd = {dir: "left"};
    }
    if (e.code == "ArrowUp") {
        cmd = {dir: "up"};
    }
    if (e.code == "ArrowRight") {
        cmd = {dir: "right"};
    }
    if (e.code == "ArrowDown") {
        cmd = {dir: "down"};
    }
}

window.onmousemove = function (e) {
    mosx = parseInt(e.pageX); // Координата X курсора
    mosy = parseInt(e.pageY);
    mosx = Math.floor(mosx/dh);
    mosy = Math.floor(mosy/dh);
    if(mosd){
        map[powx+mosx][powy+mosy][layer]=brush;
    }
}


window.onmousedown = function (e) {
    mosd = true;
    if($('#objpicker').val() == "floor" || $('#objpicker').val() == "water"){
        layer = 0;
    }else{
        layer = 1;
    }
    brush=$('#objpicker').val();
    map[powx+mosx][powy+mosy][layer]=brush;
}
window.onmouseup = function (e) {
    mosd = false;
}
