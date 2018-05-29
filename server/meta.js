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
            let w = wd.moveTo(t.x, t.y);
            if (w.xWant+w.yWant<=1){
                wd.addWound(t,"bite");
            }
        }
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
        if (wd.me.carrier) {
            wd.nextTurn(1000);
            data.new = true;
        } else {
            if (data.new) {
                data.new = false;
                wd.nextTurn(3500);
            } else {
                wd.transform(wd.me, meta.highgrass);
            }
        }
    },
};
meta.oranger = {
    img: "fruit",
    z: 2,
    isNailed:true,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    },
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (wd.me.carrier) {
            wd.nextTurn(1000);
            data.new = true;
        } else {
            if (data.new) {
                data.new = false;
                wd.nextTurn(3500);
            } else {
                wd.transform(wd.me, meta.orange);
            }
        }
    },
};
meta.tree = {
    z: 20,
    img: "tree",
    isSolid: true,
    onCreate(data) {
        data.sat = false;
        data.old = 0;
    },
    onTurn: (data, wd) => {
        let food = wd.findinInv(meta.kaka);

        if (food) {
            if (data.sat) {
                wd.transform(food, meta.orange);
                wd.drop(food);
                data.sat = false;
            }
            data.sat = true;
        } else {
            data.old++;
            if (data.old > 10) {
                wd.transform(wd.me, meta.aphid);
            }
        }
        wd.nextTurn(3500);
        // if (data.new) {
        //     data.new = false;
        //     wd.nextTurn(35000);
        // } else {
        //     wd.transform(wd.me, meta.kaka);
        // }
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


meta.egg = {
    z: 5,
    img: "egg",
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(3500);
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
meta.aphidka = {
    img: "fruit",
    z: 2,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    },
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (wd.me.carrier) {
            wd.nextTurn(1000);
            data.new = true;
        } else {
            if (data.new) {
                data.new = false;
                wd.nextTurn(3500);
            } else {
                wd.transform(wd.me, meta.aphid);
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
        data.satiety = 3000;
        data.sat = false;
        data.kaka = true
    },
    onTurn: (data, wd) => {
        let food = [meta.highgrass, meta.orange];
        let obj = wd.pickUp(food);
        if (obj) {
            data.satiety+=1000;
            if (obj.tp === meta.highgrass) {
                data.kaka ? wd.transform(obj, meta.kaka) : wd.transform(obj, meta.seed);
                data.kaka ^= true;
            }
            if (obj.tp === meta.orange){
                data.kaka ? wd.transform(obj, meta.kaka) : wd.transform(obj, meta.seed);
                data.kaka ^= true;
            }
        } else {
            wd.drop();
            wd.move(wd.dirRnd);
            if (data.satiety<=0){
                wd.transform(wd.me, meta.bone)
            }
        }
        // if (wd.findinInv(food)) {
        //     if (data.convert > 70) {
        //         let hg = wd.findinInv(food);
        //         if (hg === meta.highgrass) {
        //             if (data.kaka) {
        //                 wd.transform(hg, meta.kaka);
        //                 data.kaka = false;
        //             } else {
        //                 wd.transform(hg, meta.jelly);
        //                 data.kaka = true;
        //             }
        //         }
        //         if (hg === meta.orange) {
        //             if (data.kaka) {
        //                 wd.transform(hg, meta.kaka);
        //                 data.kaka = false;
        //             } else {
        //                 wd.transform(hg, meta.seed);
        //                 data.kaka = true;
        //             }
        //         }
        //         wd.drop(hg);
        //         data.sat = false;
        //     } else {
        //         wd.move(wd.dirRnd);
        //         data.convert++;
        //         data.sat = true;
        //     }
        // } else {
        //     data.satiety -= 1;
        //     if (data.satiety <= 0) {
        //         wd.transform(wd.me, meta.bone);
        //     } else {
        //         if (wd.isHere(food)) {
        //             wd.pickUp(food);
        //
        //             data.satiety = 70;
        //             data.convert = 0;
        //         } else {
        //             wd.move(wd.dirRnd);
        //         }
        //     }
        // }
        let f=20;
        data.satiety-=f;
        wd.nextTurn(f);
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
    isNailed: true,
    onCreate(data) {
        data.new = true;
        data.hungry=0;
    },
    onTurn: (data, wd) => {
        if (wd.inv() >= 4) {
            wd.transform(wd.me, meta.tree)
        } else {
            let food = meta.kaka;
            if (wd.isHere(food)) {
                let o = wd.pickUp(food);
                // wd.transform(o, meta.kaka);
                wd.nextTurn(500);
            } else {
                data.hungry+=50;
                if (data.hungry>30000){
                    wd.dropAll();
                    wd.transform(wd.me, meta.highgrass)
                }
                wd.nextTurn(50);
            }
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
            wd.transform(wd.me, meta.seed);
            if (!wd.removeWound(obj, "hungry")) {
                wd.addWound(obj, "glut");
            }
        }
    },
    // onTurn: (data, wd) => {
    //     if (data.new) {
    //         if (wd.isHere(meta.tree)) {
    //             wd.movetrought(wd.dirRnd)
    //         }
    //         data.new = false;
    //         wd.nextTurn(3000);
    //     } else {
    //         wd.transform(wd.me, meta.plant);
    //     }
    // },
};

meta.stick ={
  z:3,
  img:'stick',
    onApply: (obj, wd) => {
        if (obj.tp== meta.wolf) {
            // wd.trade(obj);
            wd.transform(obj, meta.orange);
            wd.transform(wd.me, meta.seed);
        }
    }
};

meta.seed = {
    z: 2,
    img: 'seed',
    onCreate(data) {
        data.new = true;
    },
    // onApply: (obj, wd) => {
    //     if (obj.tp.player) {
    //         // wd.trade(obj);
    //         wd.transform(wd.me, meta.kaka);
    //         if (!wd.removeWound(obj, "hungry")) {
    //             wd.addWound(obj, "glut");
    //         }
    //     }
    // },
    onTurn: (data, wd) => {
        if (wd.me.carrier) {
            wd.nextTurn(1000);
            data.new = true;
        } else {
            if (data.new) {
                data.new = false;
                wd.nextTurn(3500);
            } else {
                wd.transform(wd.me, meta.oranger);
            }
        }
    },
};
module.exports = meta;