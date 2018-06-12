const dir = require('./util');
const _ = require('underscore');

let meta = {};
meta.player = {
    name: "Player",
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
    onTurn: (data, wd) => {
        let d = wd.dirTo(data.order.x, data.order.y).dir;
        // data.dir = d[0];
        // wd.move(d[0]);
        let ox = wd.me.x;
        let oy = wd.me.y;
        wd.move(d[0]);
        data.dir = d[0];
        if (ox === wd.me.x && oy === wd.me.y) {
            data.dir = d[1];
            wd.move(d[1]);
        }
    },
};

meta.highgrass = {
    name: "Highgrass",
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
    name: "Angry Zebra",
    onCreate: (data) => {
        data.img = "wolf";
        data.satiety = 4000;
        data.born=true;
    },
    img: (data) => {
        return data.img;
    },
    z: 14,
    isSolid: true,
    onTurn: (data, wd) => {
        function goTo(d) {
            let ox = wd.me.x;
            let oy = wd.me.y;
            wd.move(d[0]);
            data.dir = d[0];
            if (ox === wd.me.x && oy === wd.me.y) {
                data.dir = d[1];
                wd.move(d[1]);
            }
        }

        let tire = 16;
        let t = wd.find([meta.player, meta.meat, meta.aphid]);
        if (t) {
            let mt = wd.dirTo(t.x, t.y);
            if (mt.dir[0] === dir.here) {
                let food = [meta.bone, meta.meat,];
                let obj = wd.pickUp(food);
                if (obj) {
                    tire = 32;
                    data.satiety += 4000;
                    data.born ? wd.transform(obj, meta.kaka) : wd.transform(obj, meta.wolf);
                    data.born ^= true;
                    // wd.transform(obj, meta.wolf);
                }
            } else {
                if (t.tp === meta.aphid || t.tp === meta.crab) {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.transform(t, meta.meat);
                    }
                }
                if (t.tp === meta.player) {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.addWound(t, "bite");
                    } else {
                        goTo(mt.dir);
                    }
                } else {
                    goTo(mt.dir);
                }
            }
        } else {
            wd.drop();
            wd.move(wd.dirRnd);
        }
        data.satiety -= tire;
        if (data.satiety <= 0) {
            wd.transform(wd.me, meta.bone)
        } else {
            wd.nextTurn(tire);
        }
    },
};

meta.stone = {
    name: "Just Stone",
    img: "stone",
    z: 1,
    onApply: (obj, wd) => {
        if (obj.tp === meta.stick) {
            wd.transform(obj, meta.axe);
            wd.transform(wd.me, meta.axe);
        }
    }
};
meta.flinders = {
    name: "a lot of flinder",
    img: 'flinders',
    z: 5,
    onCreate(data) {
        data.new = true;
    },
    onTurn(data, wd) {
        if (data.new) {
            data.new = false;
            wd.nextTurn(7000);
        } else {
            wd.transformdropAll(meta.highgrass);
            wd.transform(wd.me, meta.highgrass);
        }
    }
};
meta.torch = {
    name: "the Hot Torch",
    img: 'torch',
    z: 9,
    onCreate(data) {
        data.new = true;
    },
    onApply: (obj, wd) => {
        if (obj.tp === meta.flinders) {
            wd.transform(obj, meta.fire);
            // wd.transform(wd.me, meta.axe);
        }
        if (obj.tp === meta.fire) {
            wd.getOut(obj.x, obj.y);
        }
    },
    onTurn: (data, wd) => {
        wd.transformdropAll(meta.ash);
        if (data.new) {
            data.new = false;
            wd.nextTurn(1500);
        } else {
            wd.transform(wd.me, meta.ash);
        }
    },
};
meta.stick = {
    name: "Stick",
    img: "stick",
    z: 1,
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll(meta.treeseed);
        if (data.new) {
            data.new = false;
            wd.nextTurn(25000);
        } else {
            wd.transform(wd.me, meta.highgrass);
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp === meta.stone) {
            wd.transform(obj, meta.axe);
            wd.transform(wd.me, meta.axe);
        }
        if (obj.tp === meta.tree || obj.tp === meta.orangetree) {
            wd.transform(wd.me, meta.flinders);
        }
        if (obj.tp === meta.fire) {
            // wd.getOut(obj.x,obj.y);
            wd.transform(wd.me, meta.torch);
        }
    }
};
meta.bone = {
    name: "Bone",
    img: "bone",
    z: 4,
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll(meta.bone);
        if (data.new) {
            data.new = false;
            wd.nextTurn(35000);
        } else {
            wd.transform(wd.me, meta.highgrass);
        }
    },
};


meta.kaka = {
    name: "KAKA",
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
    name: "aphid plant",
    img: "fruit",
    z: 6,
    isNailed: true,
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
    name: "i am gruuuttt",
    z: 20,
    img: "tree",
    isSolid: true,
    onCreate(data) {
        data.sat = false;
        data.old = 0;
        data.new = true;
    },
    // onTurn: (data, wd) => {
    //     // let food = wd.findinInv(meta.kaka);
    //     //
    //     // if (food) {
    //     //     if (data.sat) {
    //     //         wd.transform(food, meta.orange);
    //     //         wd.drop(food);
    //     //         data.sat = false;
    //     //     }
    //     //     data.sat = true;
    //     // } else {
    //     //     // data.old++;
    //     //     // if (data.old > 10) {
    //     //     //     wd.transform(wd.me, meta.aphid);
    //     //     // }
    //     // }
    //     // wd.nextTurn(3500);
    //     if (data.new) {
    //         data.new = false;
    //         wd.nextTurn(35000);
    //     } else {
    //         wd.transform(wd.me, meta.orangetree);
    //     }
    // },
};
meta.wwall = {
    name: "Wooden Wall",
    img: 'wwall',
    isSolid: true,
    z: 40,
};
meta.orangetree = {
    name: "a big tree",
    z: 21,
    img: "orangetree",
    isSolid: true,
    onCreate(data) {
        data.sat = false;
        data.old = 0;
        data.new = true;
    },
    onTurn: (data, wd) => {
        // let food = wd.findinInv(meta.kaka);
        //
        // if (food) {
        //     if (data.sat) {
        //         wd.transform(food, meta.orange);
        //         wd.drop(food);
        //         data.sat = false;
        //     }
        //     data.sat = true;
        // } else {
        //     // data.old++;
        //     // if (data.old > 10) {
        //     //     wd.transform(wd.me, meta.aphid);
        //     // }
        // }
        // wd.nextTurn(3500);
        // if (data.new) {
        //     data.new = false;
        //     wd.nextTurn(10000);
        // } else {
        //     wd.transform(wd.me, meta.treeseed);
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
    name: "crabs egg",
    z: 5,
    img: "egg",
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(10000);
        } else {
            wd.transform(wd.me, meta.crab);
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
meta.flag = {
    img: 'flag',
    z: 30,
};
meta.ant = {
    name: "ants",
    img: 'ant',
    z: 15,
    isSolid: true,
    onCreate(data) {
        // data.new = true;
        data.command = 'walk';
        data.times = 3;
        data.flagId = false;
        data.satiety = 5000;
    },
    onTurn: (data, wd) => {
        let tire = 20;
        // if (data.satiety <= 0) {
        //     // let t = wd.find([meta.flag], 1);
        //     // if (t) {
        //     //     let dt = wd.dirFrom(t.x, t.y);
        //     //     wd.move(dt.dir[0]);
        //     // }
        //     wd.move(wd.dirRnd);
        //     wd.dropAll();
        //     data.satiety = 100;
        // }

        switch (data.command) {
            case "walk":
                if (data.times > 0) {
                    wd.move(wd.dirRnd);
                    data.times--;
                } else {
                    data.command = "search";
                    data.times = 10;
                }
                break;
            case "search":
                if (wd.inv() === 0 && data.times > 0) {
                    let t = wd.find([meta.plant, meta.egg, meta.bone, meta.tree, meta.wwall, meta.stick, meta.orangetree, meta.orange, meta.seed, meta.meat, meta.oranger], 0, 1);
                    if (t) {
                        let dt = wd.dirTo(t.x, t.y);
                        if (Math.abs(dt.xWant) + Math.abs(dt.yWant) <= 1) {
                            wd.take(t);
                            if (t.tp === meta.tree || t.tp === meta.orangetree || t.tp === meta.plant) {
                                wd.transform(t, meta.wwall);
                                data.satiety += 2000;
                            }
                            if (t.tp === meta.orange || t.tp === meta.meat || t.tp === meta.bone || t.tp === meta.egg) {
                                wd.transform(t, meta.ant);
                            }
                        } else {
                            wd.move(dt.dir[0])
                        }
                    } else {
                        wd.move(wd.dirRnd);
                    }
                    data.times--;
                } else {
                    data.command = "build";
                    data.times = 10;
                }
                break;
            case "build":
                if (data.times > 0) {
                    wd.move(wd.dirRnd);
                    data.times--;
                }
                else {
                    // let t = wd.find([meta.ant], 0, 3);
                    // if (t) {
                    //     data.times = 10;
                    //     data.command = 'build';
                    // } else {
                    wd.dropAll();
                    data.times = 10;
                    data.command = 'walk';
                    // }
                }
                break;
        }
        //     } else {
        //         let t = wd.find([meta.flag], 1);
        //         if (t && data.goAway > 0) {
        //             let dt = wd.dirFrom(t.x, t.y);
        //             wd.move(dt.dir[0]);
        //             data.flag = 500;
        //             data.goAway--;
        //         } else {
        //
        //             data.goAway = 5;
        //             data.needRest = 7;
        //             data.flag -= tire;
        //             if (data.flag <= 0) {
        //                 wd.transform(wd.me, meta.flag);
        //             }
        //         }
        //     }
        // }
        data.satiety -= tire;
        if (data.satiety <= 0) {
            wd.transform(wd.me, meta.treeseed);
        } else {
            wd.nextTurn(tire)
        }
    }
}
;


meta.aphidka = {
    name: "what is it?",
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
    name: "aphid ",
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
        let food = meta.highgrass;
        let obj = wd.pickUp(food);
        if (obj) {
            data.satiety += 3000;
            if (obj.tp === meta.highgrass) {
                // data.kaka ? wd.transform(obj, meta.kaka) : wd.transform(obj, meta.seed);
                wd.transform(obj, meta.seed);
                data.kaka ^= true;
            }
        } else {
            wd.drop();
            let t = wd.isNear(meta.highgrass);
            if (t) {
                let d = wd.dirTo(t.x, t.y).dir;
                wd.move(d[0]);
            } else {
                wd.move(wd.dirRnd);
            }
            if (data.satiety <= 0) {
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
        let f = 20;
        data.satiety -= f;
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

// meta.plant = {
//     z: 15,
//     img: 'fruit',
//     isSolid: false,
//     isNailed: true,
//     onCreate(data) {
//         data.new = true;
//         data.hungry = 0;
//     },
//     onTurn: (data, wd) => {
//         if (wd.inv() >= 4) {
//             wd.transform(wd.me, meta.tree)
//         } else {
//             let food = meta.kaka;
//             if (wd.isHere(food)) {
//                 let o = wd.pickUp(food);
//                 // wd.transform(o, meta.kaka);
//                 wd.nextTurn(500);
//             } else {
//                 data.hungry += 50;
//                 if (data.hungry > 300) {
//                     wd.dropAll();
//                     wd.transform(wd.me, meta.highgrass)
//                 }
//                 wd.nextTurn(50);
//             }
//         }
//     },
// }

meta.crab = {
    name: "crab",
    z: 15,
    isSolid: true,
    img: 'crab',
    onCreate: (data) => {
        // data.new = true;
        // data.kind = true;
        data.satiety = 15000;
    },
    onTurn: (data, wd) => {
        let tire = 50;
        let t = wd.isNear([meta.tree, meta.wwall, meta.bone ,meta.wood]);
        if (t) {
            // let mt = wd.dirTo(t.x, t.y);
            // if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
            if (_.random(5)) {
                wd.transform(t, meta.stick);
            } else {
                wd.transform(t, meta.egg)
            }
            wd.relocate(t.x, t.y);
            meta.satiety += 15000;
            tire = 500;
            // }
        } else {
            wd.move(wd.dirRnd);
        }
        data.satiety -= tire;
        if (data.satiety <= 0) {
            wd.transform(wd.me, meta.bone)
        } else {
            wd.nextTurn(tire);
        }
    },
};

meta.plant = {
    name: "carnivorous plant",
    z: 20,
    img: (data) => {
        if (data.kind) {
            return 'kindplant';
        } else {
            return 'hungryplant';
        }
    },
    isSolid: true,
    onCreate: (data) => {
        data.new = true;
        data.kind = true;
        data.satiety = 10000;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            wd.relocate(wd.me.x + _.random(-5, +5), wd.me.y + _.random(-5, +5));
            data.new = false;
            wd.transformdropAll(meta.plant);
            wd.nextTurn(3500);
        } else {
            data.kind = false;
            let tire = 30;
            // let t = wd.find([meta.player, meta.meat, meta.crab, meta.bone, meta.aphid], 0, 1);
            let t = wd.isNear([meta.player, meta.meat, meta.crab, meta.bone, meta.aphid]);
            if (t) {
                let mt = wd.dirTo(t.x, t.y);
                if (t.tp !== meta.player) {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.transform(t, meta.plant);
                    }
                }
                if (t.tp === meta.player) {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.addWound(t, "bite");
                    }
                }

            }
            data.satiety -= tire;
            if (data.satiety <= 0) {
                wd.transform(wd.me, meta.tree)
            } else {
                wd.nextTurn(tire);
            }
        }
    }
    ,
};

meta.orange = {
    name: "orange",
    z: 5,
    img: 'orange',
    onCreate(data) {
        data.new = true;
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            // wd.trade(obj);
            wd.transform(wd.me, meta.stone);
            if (!wd.removeWound(obj, "hungry")) {
                wd.addWound(obj, "glut");
            }
        }
    },
    onTurn: (data, wd) => {
        if (data.new) {
            // if (wd.isHere(meta.tree)) {
            //     wd.movetrought(wd.dirRnd)
            // }
            data.new = false;
            wd.nextTurn(5000);
        } else {
            wd.transform(wd.me, meta.aphid);
        }
    },
};

meta.ash = {
    name: "ash",
    z: 1,
    img: "ash",
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll(meta.ash);
        if (data.new) {
            data.new = false;
            wd.nextTurn(7000);
        } else {
            wd.transform(wd.me, meta.highgrass);
        }
    },

};

meta.fire = {
    name: "fire",
    Z: 800,
    img: (data) => {
        return "fire";
    },
    isNailed: true,
    isSolid: true,
    onCreate: (data) => {
        data.new = true;
        data.satiety = 6000;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll(meta.fire);
        let tire = 50;
        if (wd.isHere(meta.water)) {
            wd.transform(wd.me, meta.water);
        }
        if (wd.isHere(meta.fire)) {
            wd.movetrought(wd.dirRnd);
        }
        let food = [meta.tree, meta.crab, meta.meat, meta.wwall, meta.flinders, meta.torch, meta.aphid, meta.plant, meta.seed, meta.kaka, meta.ant, meta.wolf, meta.axe, meta.highgrass, meta.bone, meta.stick, meta.orangetree, meta.orange, meta.oranger];
        let o = wd.isHere(food);
        if (o) {
            wd.transform(o, meta.fire);
            data.satiety += 3000;
        }
        data.new = false;
        data.satiety -= tire;
        if (data.satiety <= 0) {
            wd.transform(wd.me, meta.ash);
        }
        wd.nextTurn(tire);
    }
};
meta.water = {
    name: "water",
    z: 10,
    img: "water",
    onTurn: (data, wd) => {
        if (wd.isHere(meta.water)) {
            wd.movetrought(wd.dirRnd);
        } else if (wd.isNear(meta.water)) {
        } else {
            let t = wd.find([meta.water], 1, 10);
            if (t) {
                wd.relocate(t.x, t.y)
            }
        }
        wd.nextTurn(5);
    },
};


meta.axe = {
    name: "axe",
    z: 3,
    img: 'axe',
    onApply: (obj, wd) => {
        function broke() {
            wd.transform(wd.me, meta.flinders);
        }

        if (obj.tp === meta.wolf || obj.tp === meta.aphid) {
            // wd.trade(obj);
            wd.transform(obj, meta.meat);
            broke();
        } else if (obj.tp === meta.orangetree) {
            wd.transform(obj, meta.wood);
            broke()
        } else if (obj.tp === meta.tree || obj.tp === meta.wwall) {
            wd.transform(obj, meta.wood);
            broke()
        } else if (obj.tp === meta.wood) {
            wd.transform(obj, meta.wwall);
            broke()
        } else if (obj.tp === meta.ant) {
            wd.transform(obj, meta.treeseed);
            broke()
        } else if (obj.tp === meta.plant) {
            wd.transform(obj, meta.fire);
            broke()
        }
    }
};
meta.wood = {
    name: "wood",
    img: 'wood',
    z: 15,
};
meta.grill = {
    name: "grill",
    img: "grill",
    z: 8,
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
meta.meat = {
    name: "meat",
    z: 1,
    img: 'meat',
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll(meta.meat);
        if (data.new) {
            data.new = false;
            wd.nextTurn(5000);
        } else {
            wd.transform(wd.me, meta.bone);
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            // wd.trade(obj);
            wd.transform(wd.me, meta.bone);
            if (!wd.removeWound(obj, "hungry")) {
                wd.addWound(obj, "glut");
                if (_.random(19) === 0) {
                    wd.addWound(obj, 'helminth')
                }
            }
        }
        if (obj.tp === meta.fire) {
            wd.transform(wd.me, meta.grill);
        }
    }
};
meta.treeseed = {
    name: "treeseed",
    z: 2,
    img: 'jelly',
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
                wd.nextTurn(5000);
            } else {
                wd.transform(wd.me, meta.tree);
            }
        }
    },
};
meta.seed = {
    name: "aphid seed",
    z: 3,
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
        if (wd.me.carrier || wd.isHere(meta.oranger)) {
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
