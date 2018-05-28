const direction = require('./util');

let meta = {};
meta.player = {
    player: true,
    onCreate: (data) => {
        data.died = false;
    },
    img: (data) => {
        if (data.died) {
            return "rip"
        }
        return "hero"
    },
    isSolid: true,
    z: 999,
};

meta.highgrass = {
    img: "highgrass",
    z: 0,
    isNailed: true,
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
        if (t) {
            wd.moveTo(t.x, t.y);
        }
        // wd.moveTo(0,0);
        // wd.move(direction.right);
        wd.nextTurn(16);
    },
};

meta.stone = {
    img: "stone",
    z: 1
};
meta.bone = {
    img: "bone",
    z: 1,
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(3500);
        } else {
            wd.transform(wd.me, meta.highgrass);
        }
    },
};


meta.kaka = {
    img: "kaka",
    z: 2,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    },
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(3500);
        } else {
            wd.transform(wd.me, meta.highgrass);
        }
    },
};

meta.tree = {
    z: 20,
    img: "tree",
    isSolid: true,
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(700);
        } else {
            wd.transform(wd.me, meta.kaka);
        }
    },
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
    img: "egg",
    onCreate(data) {
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
            // wd.trade(obj);
            wd.transform(wd.me, meta.kaka);
            if (!wd.removeWound(obj, "hungry")) {
                wd.addWound(obj, "glut");
            }
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
    onCreate(data) {
        data.satiety = 70;
        data.sat = false;
    },
    onTurn: (data, wd) => {
        let food = meta.highgrass;
        if (wd.inv(food)) {
            if (data.convert > 70) {
                let hg = wd.inv(food);
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
                wd.transform(wd.me, meta.bone);
            } else {
                if (wd.isHere(food)) {
                    wd.pickUp(food);
                    data.satiety = 70;
                    data.convert = 0;
                } else {
                    wd.move(wd.dirRnd);
                }
            }
        }
        wd.nextTurn(20);
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            // wd.trade(obj);
            wd.transform(wd.me, meta.bone);
            if (!wd.removeWound(obj, "hungry")) {
                wd.addWound(obj, "glut");
            }
        }
    },
};

meta.plant = {
    z: 15,
    img: 'fruit',
    isSolid: false,
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(3500);
        } else {
            wd.transform(wd.me, meta.tree);
        }
    },
};
meta.orange = {
    z: 1,
    img: 'orange',
    onCreate(data) {
        data.new = true;
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            // wd.trade(obj);
            wd.transform(wd.me, meta.plant);
            if (!wd.removeWound(obj, "hungry")) {
                wd.addWound(obj, "glut");
            }
        }
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(1200);
        } else {
            wd.transform(wd.me, meta.kaka);
        }
    },
};

meta.seed = {
    z: 2,
    img: 'seed',
    onCreate(data) {
        data.new = true;
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            // wd.trade(obj);
            wd.transform(wd.me, meta.kaka);
            if (!wd.removeWound(obj, "hungry")) {
                wd.addWound(obj, "glut");
            }
        }
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(3500);
        } else {
            wd.transform(wd.me, meta.plant);
        }
    },
};
module.exports = meta;
