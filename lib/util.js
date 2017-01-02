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