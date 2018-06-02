/**
 * Created by igor on 18/02/2017.
 */
const sha = require("sha256");

// const config = require('./config');
const world = require('./world');
const user = {};

// user.list = new Map;
user.list = [];

user.init = () => {
};

user.new = (username, id,) => {
    username = username.toLowerCase();
    user.list.push({
        key: sha(GenerateToken()),
        id,
        username,
        friends: [],
        // hero: {x: 0, y: 0, img: "hero"}
    });
};
// user.setKey = (id) => {
//     const token = GenerateToken();
//     let fl = true;
//     for (let u of user.list) {
//         if (u.id == id) {
//             u.key = sha(token);
//             fl = false;
//             break;
//         }
//     }
//     if (fl) {
//         console.log(id);
//         throw ('setkey');
//     }
//     return token;
// };

user.setKey = (id) => {
    const token = GenerateToken();
    let u = user.byId(id);
    if (u) {
        u.key = sha(token);
    } else {
        throw 'can not setKey'
    }
    return token;
};

// user.login = (id, socket, pass) => {
//     socket.emit('login', onLogin());
//
//     function onLogin() {
//         let key = sha(pass);
//         for (let u of user.list) {
//             if (key === u.key) {
//                 u.socket = socket;
//                 return ("succecs loged in " + id);
//             }
//         }
//         return ("authentication error");
//     }
// };


user.login = (user, socket, pass) => {
    socket.emit('login', onLogin());

    function onLogin() {
        let key = sha(pass);
        if (user.key === key) {
            let f = true;
            for (let p of world.player) {
                if (user.id === p.id) {
                    p.socket = socket;
                    f = false;
                    break;
                }
            }
            if (f) {
                if (socket==undefined){
                    throw 'where is my socket???';
                }
                world.addPlayer(socket, user.id,5200,5200);
            }
            return ("succecs loged in " + user.id);
        }
        return ("authentication error");
    }
};


// user.bySocket = (socket) => {
//     for (let u of user.list) {
//         if (socket === u.socket) {
//             return u;
//         }
//     }
//     return false;
// };

user.byId = (id) => {
    for (let u of user.list) {
        if (u.id == id) {
            return u;
        }
    }
    return false;
};

user.byName = (username) => {
    username = username.toLowerCase();
    for (let u of user.list) {
        if (u.username == username) {
            return u;
        }
    }
    return false;
};

user.makeFriend = (who, whom) => {
    who.friends.push(whom);
};
user.isFriend = (me, person) => {
    for (let p of me.friends) {
        if (p == person) {
            return true;
        }
    }
    return false;
};
user.findway = (from, to) => {
    let ways = [];
    if (user.isFriend(from, to)) {
        ways.push([from]);
    } else {
        for (let friend of from.friends) {
            // console.log(tofriend);
            if (user.isFriend(friend, to)) {
                ways.push([from, friend]);
            }
        }
        if (!ways.length) {
            for (let friend of from.friends) {
                for (let friendfriend of friend.friends) {
                    if (user.isFriend(from, friend, friendfriend)) {
                        ways.push([from, friend, friendfriend]);
                    }
                }
            }
        }
    }
    if (!ways.length) {
        return false;
    } else {
        return ways;
    }
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
