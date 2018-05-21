/**
 * Created by igor on 18/02/2017.
 */
const sha = require("sha256");

// const config = require('./config');
const user = {};

user.list = new Map;
user.list = [];

user.init = () => {
};

user.setKey = (id) => {
    const token = GenerateToken();
    let fl = true;
    for (let u of user.list) {
        if (u.id == id) {
            u.key = sha(token);
            fl = false;
            break;
        }
    }
    if (fl) {
        user.list.push({key: sha(token), id, friends: []});
    }
    return token;
};

user.login = (id, socket, pass) => {
    socket.emit('login', onLogin());

    function onLogin() {
        let key = sha(pass);
        for (let u of user.list) {
            if (key === u.key) {
                u.socket = socket;
                return ("succecs loged in " + id);
            }
        }
        return ("authentication error");
    }
};

user.bySocket = (socket) => {
    for (let u of user.list) {
        if (socket === u.socket) {
            return u;
        }
    }
    return false;
};

user.byId = (id) => {
    // console.log('byId '+id);
    for (let u of user.list) {
        if (u.id == id) {
            // console.log(u.id);
            return u;
        }
    }
    return false;
};

user.makeFriend = (who, whom) => {
    who.friends.push(whom);
};
user.isFriend = () => {
    return true;
};


function GenerateToken(stringLength) {
    // set the length of the string
    if (stringLength == undefined) {
        stringLength = 35;
    }
    // list containing characters for the random string
    let stringArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '!', '?'];


    let rndString = "";

    // build a string with random characters
    for (let i = 1; i < stringLength; i++) {
        let rndNum = Math.ceil(Math.random() * stringArray.length) - 1;
        rndString = rndString + stringArray[rndNum];
    }
    return rndString;
}

module.exports = user;
