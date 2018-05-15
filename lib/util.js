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
            imgs.set(url,img);
            return null;
        }
    }
}

// function findGetParameter(parameterName) {
//     let result = "",
//         tmp = [];
//     location.search
//         .substr(1)
//         .split("&")
//         .forEach(function (item) {
//             tmp = item.split("=");
//             if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
//         });
//     return result;
// }

function findGetParameter(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function sleep(miliseconds) {
    let currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}