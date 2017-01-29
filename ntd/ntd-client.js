const socket = io();
const login = {};
login.pass = prompt("Write your password!","demo");
if(login.pass==""||login.pass==undefined){
    login.pass="demo";
}
    login.name = "ntd";
const addInput = $('#add');
const task = $('.task');
let cnId = 0;

let model = [];
function onKeydown(key) {
    switch (key) {
        case "use":
            add();
            break;
        case "useup":
            move("up");
            break;
        case "usedown":
            move("down");
            break;
    }
}


function flipArrRight(arr, i) {
    let f = arr.slice(0, ++i),
        s = arr.slice(i),
        r = f.splice(-2).reverse();
    return f.concat(r).concat(s);
}
function move(dir) {
    for (let m in model) {
        if (model[m].selected == "selected") {
            // let el = model[m];
            if (dir == "up") {
                model = flipArrRight(model, m + 1);
            }
            if (dir == "down") {
                model = flipArrRight(model, m);

            }
            break;
        }
    }
    render();
}

function nextId() {
    cnId++;
    return cnId;
}
function add() {
    if (addInput.val() !== "") {
        let text = addInput.val();
        let id = nextId();
        addInput.val("");
        selected().selected = "";
        model.push({text, id, selected: "selected"});
    }
    render();
}

function selected() {
    for (let m in model) {
        if (model[m].selected == "selected") {
            return model[m];
        }
    }
    // return model[0];
    return {};
}

$('#btnDone').click((e) => {
    for (let m in model) {
        if (model[m].selected == "selected") {
            model.splice(m, 1);
        }
    }
    render();
});

$('#duedate').change(function () {
    selected().duedate = $('#duedate').val();
});

$('#duetime').change(function () {
    selected().duetime = $('#duetime').val();
});

$('#startdate').change(function () {
    selected().startdate = $('#startdate').val();
    if (Date.parse(selected().startdate) > Date.parse(selected().duedate) || selected().duedate == undefined || selected().duedate == "") {
        selected().duedate = $('#startdate').val();
    }
});

$('#text').change(function () {
    selected().text = $('#text').val();
});

$('#duration').change(function () {
    selected().duration = $('#duration').val();
});

$('#starttime').change(function () {
    selected().starttime = $('#starttime').val();
});

$('body').on("click", ".task", function () {
    let id = $(this).attr('id');
    model.forEach((item, i, arr) => {
        if (item.id == id) {
            item.selected = "selected";
        } else {
            item.selected = "";
            // console.log(id+" "+item.id);
        }
    });
    render();
});

addInput.keypress((e) => {
    if (e.which == 13) {
        add();
    }
});

$(document).ready(function () {
    inputServer();
    addInput.focus();
});

function render() {
    send();
    model.sort((a, b) => {
        let aTime = Date.parse(a.duedate + " " + a.duetime);
        let bTime = Date.parse(b.duedate + " " + b.duetime);
        let aDate = Date.parse(a.duedate);
        let bDate = Date.parse(b.duedate);
        let aDuration = a.duration;
        let bDuration = b.duration;
        if (!_.isFinite(aDate)) {
            aDate = 9999999999999;
            a.unsorted = "undated";
        }
        if (!_.isFinite(bDate)) {
            b.unsorted = "undated";
            bDate = 9999999999999;
        }
        if (_.isFinite(aTime)) {
            // console.log(aTime);
            aDate = aTime;
        }
        if (_.isFinite(bTime)) {
            // console.log(bTime);
            bDate = bTime;
        }

        if (aDate == bDate) {
            if (_.isFinite(aDuration)) {
                aDate = aDuration;
            }
            if (_.isFinite(bDuration)) {
                bDate = bDuration;
            }
            if (aDate == bDate) {
                a.unsorted = "unsorted";
                b.unsorted = "unsorted";
            }
        }

        return aDate - bDate;
    });
    let $tasklist = $('#tasklist');
    console.log(selected());
    if (selected().duedate != undefined) {
        $('#duedate').val(selected().duedate);
    } else {
        $('#duedate').val('');
    }
    if (selected().duetime != undefined) {
        $('#duetime').val(selected().duetime);
    } else {
        $('#duetime').val('');
    }
    if (selected().starttime != undefined) {
        $('#starttime').val(selected().starttime);
    } else {
        $('#starttime').val('');
    }
    if (selected().startdate != undefined) {
        $('#startdate').val(selected().startdate);
    } else {
        $('#startdate').val('');
    }
    $('#text').val(selected().text);
    if (selected().duration != undefined) {
        $('#duration').val(selected().duration);
    } else {
        $('#duration').val('');
    }
    $tasklist.html('');
    let d = new Date();
    let b = d.getHours() * 3600000 + d.getMinutes() * 60000;
    let c = Date.parse(d);
    model.forEach((item, i, arr) => {
        let start = "";
        if (item.starttime != undefined) {
            let a = item.starttime.split(':');
            a = a[0] * 3600000 + a[1] * 60000;
            if (a > b) {
                start = " stop";
            }
        }
        if (item.startdate != undefined) {
            let a = Date.parse(item.startdate);
            if (a > c) {
                start = " stop";
            }
        }
        $tasklist.append("<div id='" + item.id + "'class='task " + item.unsorted + " " + item.selected + start + "'>" + item.text + "</div>");
        item.unsorted = "";
    });
    if (socket.connected) {
        $('#online').text("Online");
        $('#online').removeClass("off");
    } else {
        $('#online').text("Offline");
        $('#online').addClass("off");
    }
    addInput.focus();
}

function onServer(val) {
    if (val !== undefined) {
        model = JSON.parse(val);
        for (let m of model) {
            if (m.id > cnId) cnId = m.id;
        }
    }
    render();
}


function send() {
    socket.emit("ntd-save", JSON.stringify(model));
}
function inputServer() {
    socket.on('connect', function () {
        console.log("connect");
        socket.emit('login', login);
    });
    socket.on('login', (val) => {
        socket.emit('ntd-load', val);
        console.log(val);
    });
    socket.on('model', (val) => {
        onServer(val);
    });
    socket.on('disconnect', () => {
        console.log("disconnected!");
    });

}