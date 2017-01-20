let meta = {};
meta.player = {
    player: true,
    img: "hero",
    isSolid: true,
    z: -1,
};

meta.highgrass = {
    img: "highgrass",
    z: 0
};

meta.test = {
    img: "angel",
    onTurn: (data, wd) => {

    }
};
meta.wolf = {
    onCreate: (data) => {
        data.img = "wolf"
    },
    img: (data) => {
        return data.img;
    },
    z: 14,
    isSolid: true,
    onTurn: (data, wd) => {
        let t = wd.find(meta.player);
        wd.moveTo(t.x, t.y);
        wd.nextTurn(13);
    },
};

meta.stone = {
    img: "stone",
    z: 1
};

meta.kaka = {
    img: "kaka",
    z: 2,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    }
};

meta.tree = {
    z: 20,
    img: "tree",
    isSolid: true,

};

meta.box = {
    z: 10,
    img: "box",
    isSolid: true,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    }
};


meta.jelly = {
    z: 5,
    img: "jelly",
    onCreate(data){
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(700);
        } else {
            wd.transform(wd.me, meta.aphid);
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            wd.trade(obj);
            wd.transform(wd.me, meta.kaka);
            wd.removeWound(obj, "hungry");
        }
    },
};

meta.aphid = {
    z: 15,
    img: (data) => {
        if (data.sat)
            return "aphid2";
        else return "aphid";
    },
    isSolid: true,
    onCreate(data){
        data.satiety = 70;
        data.sat = false;
    },
    onTurn: (data, wd) => {
        if (wd.inv(meta.highgrass)) {
            if (data.convert > 70) {
                let hg = wd.inv(meta.highgrass);
                wd.transform(hg, meta.jelly);
                wd.drop(hg);
                data.sat = false;
            } else {
                wd.move(wd.dirRnd);
                data.convert++;
                data.sat = true;
            }
        } else {
            data.satiety -= 1;
            if (data.satiety == 0) {
                wd.transform(wd.me, meta.highgrass);
            } else {
                if (wd.isHere(meta.highgrass)) {
                    wd.pickUp(meta.highgrass);
                    data.satiety = 70;
                    data.convert = 0;
                } else {
                    wd.move(wd.dirRnd);
                }
            }
        }
        wd.nextTurn(20);
    }
};

module.exports = meta;
