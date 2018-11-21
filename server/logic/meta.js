const util = require('../web/util');
const random = util.random;
const dir = util.dir;
const color = util.color;
const _ = require('lodash');


let meta = {};

meta.player = {
    name: "Player",
    describe: "это персонаж другого игрока",
    player: true,
    onCreate: (data) => {
        data.died = false;
    },
    img: (data) => {
        if (data.died === 'newborn') {
            // return 'ariel';
            return "newborn"
        } else if (data.died) {
            return "rip"
        }
        return "hero"
    },
    isSolid: true,
    onTurn: (data, wd) => {
        let d = wd.dirTo(data.order.x, data.order.y).dir;
        // data.dir = d[0];
        // wd.move(d[0]);
        // let ox = wd.me.x;
        // let oy = wd.me.y;
        // wd.move(d[0]);
        // data.dir = d[0];
        // if (ox === wd.me.x && oy === wd.me.y) {
        //     data.dir = d[1];
        //     wd.move(d[1]);
        // }
        if (wd.move(d[0])) {
            if (wd.move(d[1])) {
                data.dir = dir.here;
            } else {
                data.dir = d[1];
            }
        } else {
            data.dir = d[0];
        }
    },
};


// meta.respawn ={
//     name:'respawn',
//     describe:'здесь возродится ваш персонаж, если'
// };
meta.seed = {
    name: "orange seed",
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
                wd.transform(wd.me, 'oranger');
            }
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp === meta.bone) {
            wd.transform(obj, 'shovel');
            wd.transform(wd.me, 'shovel');
        }
    }
};
meta.orange = {
    name: "orange",
    img: 'orange',
    onCreate(data) {
        data.new = true;
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            // wd.trade(obj);
            wd.transform(wd.me, meta.seed);
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
            }
        }
    },
    onTurn: (data, wd) => {
        if (data.new) {
            // if (wd.isHere(meta.tree)) {
            //     wd.movetrought(wd.dirRnd)
            // }
            data.new = false;
            wd.nextTurn(20000);
        } else {
            wd.transform(wd.me, 'plant');
        }
    },
};
meta.oranger = {
    name: "orange plant",
    img: "fruit",
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

meta.jackal = {
    name: "jackal",
    isSolid: true,
    img: 'wolf',
    onCreate(data) {
        data.satiety = 10000;
        data.born = true;
    },
    onTurn: (data, wd) => {
        let tire = 16;

        //куда деть эту функцию?
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

        let t = wd.find(['player', 'bone', 'beaver']);
        if (t) {
            let mt = wd.dirTo(t.x, t.y);
            if (mt.dir[0] === dir.here) {
                let food = ['bone', 'beaver'];
                let obj = wd.pickUp(food);
                if (obj) {
                    tire = 32;
                    data.satiety += 10000;
                    data.born ? wd.transform(obj, 'kaka') : wd.transform(obj, 'jackal');
                    data.born ^= true;
                    // wd.transform(obj, meta.jackal);
                }
            }
            if (t.tp === 'player') {
                if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                    wd.addWound(t, wound.hit);
                } else {
                    goTo(mt.dir);
                }
            } else {
                goTo(mt.dir);
            }
        } else {
            wd.dropAll();
            wd.move(wd.dirRnd);
        }
        data.satiety -= tire;
        if (data.satiety <= 0) {
            wd.transform(wd.me, 'kaka')
        } else {
            wd.nextTurn(tire);
        }
    }
};

meta.zombie = {
    name: "zombie",
    isSolid: true,
    img: 'zombie',
    onTurn: (data, wd) => {
        let tire = 64;

        //куда деть эту функцию?
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

        let t = wd.find(meta.player);
        if (t) {
            let mt = wd.dirTo(t.x, t.y);
            if (t.tp === meta.player) {
                if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                    wd.addWound(t, wound.hit);
                } else {
                    goTo(mt.dir);
                }
            } else {
                goTo(mt.dir);
            }
        } else {
            let mt = wd.dirTo(wd.center.x + random(-100, 100), wd.center.y + random(-100, 100));
            goTo(mt.dir);
        }
        wd.nextTurn(tire);
    }
};
meta.skeleton = {
    name: "skeleton",
    describe: "Скелет, убегайте от него или бейте лопатой!",
    isSolid: true,
    img: 'skeleton',
    onCreate: (data) => {
        data.satiety = 1000000;
    },
    onTurn: (data, wd) => {
        let tire = 54;

        //куда деть эту функцию?
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

        let food = ['potatoplant'];
        let f = wd.isHere(food);
        if (f) {
            if (f.tp === 'potatoplant') {
                wd.transform(f, 'potatoseed');
            }
        }
        let t = wd.find('player');
        if (t) {
            let mt = wd.dirTo(t.x, t.y);
            if (t.tp === 'player') {
                if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                    wd.addWound(t, wound.hit);
                    wd.say(['Кусь!', 'Ам!', 'Хрясь'], wd.me, '#aa0000');
                    wd.say(['Ай!', 'Больно', 'Кыш!'], t);
                } else {
                    goTo(mt.dir);
                }
            } else {
                goTo(mt.dir);
            }
        } else {

            wd.move(wd.dirRnd);
        }
        data.satiety -= tire;
        if (data.satiety < 0) {
            wd.transform(wd.me, 'bone')
        }
        wd.nextTurn(tire);
    }
};
meta.tree = {
    name: "tree",
    describe: "Дерево, можно пересадить с помощью лопаты",
    img: "tree",
    isSolid: true,
    onCreate(data) {
        // data.sat = false;
        // data.old = 0;
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
        if (data.new) {
            data.new = false;
            wd.nextTurn(2000000);
        }
        else {
            wd.transform(wd.me, 'stick');
        }
    },
};
meta.swamp = {
    img: 'swamp',
    isNailed: true,
    onTurn: (data, wd) => {
        let p = wd.isHere(meta.player);
        if (p) {
            // wd.findWound();
            wd.fillWound(p, wound.swamp);
        }
        wd.nextTurn(1);
    },
};
meta.plant = {
    name: "carnivorous plant",
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
        data.satiety = 12000;
    },
    onTurn: (data, wd) => {
        if (data.new) {
            _.times(6, () => {
                wd.move(wd.dirRnd)
            });
            data.new = false;
            wd.transformdropAll('plant');
            wd.nextTurn(3500);
        } else {
            data.kind = false;
            let tire = 30;
            // let t = wd.find([meta.player, meta.meat, meta.crab, meta.bone, meta.aphid], 0, 1);
            let t = wd.isNear(['player', 'beaver', 'wolf', 'meat', 'bone']);
            if (t) {
                let mt = wd.dirTo(t.x, t.y);
                if (t.tp !== 'player') {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.transform(t, 'plant');
                        data.kind = true;
                        tire = 3500;
                        // wd.transform(wd.me, meta.plant);
                        // wd.relocate(wd.me.x + _.random(-50, +50), wd.me.y + _.random(-50, +50));

                    }
                }
                if (t.tp === 'player') {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.addWound(t, wound.hit);
                        // wd.transform(wd.me, meta.plantseed);
                        // wd.relocate(wd.me.x + _.random(-50, +50), wd.me.y + _.random(-50, +50));
                    }
                }

            }
            data.satiety -= tire;
            if (data.satiety <= 0) {
                wd.transform(wd.me, 'tree');
            } else {
                wd.nextTurn(tire);
            }
        }
    },
    onApply: (obj, wd, p) => {
        if (obj.tp === 'player') {
            wd.transform(wd.me, 'stick');
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
            }
        }
    },
};

meta.train = {
    name: "train plant",
    img: (data) => {
        if (data.kind) {
            return 'wagon';
        } else {
            return 'train';
        }
    },
    isSolid: true,
    onCreate: (data) => {
        data.kind = false;
        // data.satiety = 12000;
    },
    onFirstTurn: (data, wd) => {
        wd.nextTurn(30);
    },
    onTurn: (data, wd) => {
        if (!data.kind) {
            let tire = 30;
            // let t = wd.find([meta.player, meta.meat, meta.crab, meta.bone, meta.aphid], 0, 1);
            let t = wd.isNear(['player', 'beaver', 'skeleton', 'wolf', 'meat', 'bone', 'tree',]);
            if (t) {
                let mt = wd.dirTo(t.x, t.y);
                if (t.tp !== 'player') {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.transform(t, 'train');
                        if (_.random(14)) {
                            data.kind = true;
                        }
                        // tire = 3500;
                        // wd.transform(wd.me, meta.plant);
                        // wd.relocate(wd.me.x + _.random(-50, +50), wd.me.y + _.random(-50, +50));
                    }
                }
                // if (t.tp === 'player') {
                //     if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                //         wd.addWound(t, wound.hit);
                //         // wd.transform(wd.me, meta.plantseed);
                //         // wd.relocate(wd.me.x + _.random(-50, +50), wd.me.y + _.random(-50, +50));
                //     }
                // }
            }
            // data.satiety -= tire;
            // if (data.satiety <= 0) {
            //     wd.transform(wd.me, 'tree');
            // } else {
            wd.nextTurn(tire);
            // }
        }
    },
    // onApply: (obj, wd, p) => {
    //     if (obj.tp === 'player') {
    //         wd.transform(wd.me, 'stick');
    //         if (!wd.removeWound(obj, wound.hungry)) {
    //             wd.addWound(obj, wound.glut);
    //         }
    //     }
    // },
};
meta.shovel = {
    name: 'shovel',
    img: 'shovel',
    describe: 'Лопата, пересаживайте ей растения и бейте врагов!',
    onApply: (obj, wd, p) => {
        function broke() {
            wd.transform(wd.me, 'stick');
            wd.getOut(p.x, p.y);
        }

        if (_.includes(['tree', 'box'], obj.tp)) {
            wd.put(obj, p);
            broke();
        }
        if (obj.tp === 'zombie' || obj.tp === 'skeleton') {
            wd.transform(obj, 'bone');
            broke();
            wd.say(['!!!', 'Вот тебе!', 'Получи лопатой!!!'], p)
        }
        if (obj.tp === 'plant') {
            wd.transform(obj, 'potato');
            wd.say(['Огродная работа', 'Свежая картошечка!', 'Лучшее применение лопаты'], p);
            wd.put(obj, p);
            broke();
        }
        if (obj.tp === 'beaver') {
            wd.transform(obj, 'meat');
            meta.beaveregg.makeangrybeaver(obj.x, obj.y, wd);
            broke();
        }
        if (obj.tp === 'wolf') {
            wd.transform(obj, 'bone');
            broke();
        }
        if (_.includes(['beside', 'flinders'], obj.tp)) {
            wd.transform(obj, 'blackearth');
            broke();
        }
        if (obj.tp === 'stick') {
            wd.transform(obj, 'fence');
            broke();
        }
        if (obj.tp === 'stone') {
            wd.getOut(obj.x, obj.y);
            wd.transform(wd.me, 'fire');
        }
        if (obj.tp === 'player') {
            wd.removeWound(p, wound.potatoplant);
            wd.addWound(p, wound.hit);
            broke();
        }
    },
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll('bone');
        if (data.new) {
            data.new = false;
            wd.nextTurn(35000);
        } else {
            wd.move(wd.dirRnd);
            // wd.transform(wd.me, meta.zebra);
        }
    },
};
meta.blackearth = {
    name: 'blackearth',
    img: 'blackearth',
    isNailed: true,
    describe: 'Чернозем, в нем хорошо растут растения',
};
meta.plantseed = {
    name: "orange seed",
    img: 'plantseed',
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
        if (wd.me.carrier || wd.isHere('plant')) {
            wd.nextTurn(1000);
            data.new = true;
        } else {
            if (data.new) {
                data.new = false;
                wd.nextTurn(3500);
            } else {
                wd.transform(wd.me, 'plant');
            }
        }
    },
};

meta.bone = {
    name: "Bone",
    img: "bone",
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll('bone');
        if (wd.me.carrier) {
            wd.nextTurn(10000);
            data.new = true;
        } else {
            if (data.new) {
                data.new = false;
                wd.nextTurn(40000);
            } else {
                wd.transform(wd.me, 'skeleton');
                wd.say('*скрипит*', wd.me);
            }
        }
    },
    onApply: (obj, wd, p) => {
        if (obj.tp === 'potatoseed') {
            wd.transform(obj, 'pickaxe');
            wd.transform(wd.me, 'pickaxe');
        }
        // if (obj.tp === 'potatoseed') {
        //     wd.transform(obj, 'shovel');
        //     wd.transform(wd.me, 'stick');
        //     wd.getOut(p.x, p.y);
        // }
        if (obj.tp === 'fire') {
            wd.getOut(obj.x, obj.y);
        }
    }
}
;

//old

meta.highgrass = {
    name: "Highgrass",
    describe: "Просто трава, для красоты",
    img: "highgrass",
    isFlat: true,
    isNailed: true,
    onStepin: (data, wd, obj) => {
        if (!_.random(9)) {
            if (obj.tp === 'player') {
                wd.transform(wd.me, 'road');
            }
        }
    },
    // onFirstTurn: (data, wd) => {
    //     wd.nextTurn(300000)
    // },
    // onTurn: (data, wd) => {
    //     wd.transform(wd.me, 'bone')
    // },
};
meta.road = {
    name: "road",
    describe: "Кто-то протоптал тропинку",
    img: "road",
    isFlat: true,
    isNailed: true,
    onStepin: (data, obj) => {
        if (obj.data)
            obj.data.died = 'newborn';
    },
    // onFirstTurn: (data, wd) => {
    //     wd.nextTurn(300000)
    // },
    // onTurn: (data, wd) => {
    //     wd.transform(wd.me, 'bone')
    // },
};
meta.test = {
    img: "angel",
    onTurn: (data, wd) => {
    }
};
meta.wolf = {
    name: "Hungry Wolf",
    onCreate: (data) => {
        data.img = "jackal";
        data.satiety = 45000;
        data.born = true;
    },
    img: (data) => {
        return data.img;
    },
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

        let tire = 11;
        let t = wd.find(['player', 'meat', 'bone',]);
        if (t) {
            let mt = wd.dirTo(t.x, t.y);
            if (mt.dir[0] === dir.here) {
                let food = ['meat', 'bone'];
                let obj = wd.pickUp(food);
                if (obj) {
                    tire = 64;
                    data.satiety += 25000;
                    if (!random(2)) {
                        wd.transform(obj, 'wolf')
                    } else {
                        wd.transform(obj, 'potatoseed');
                    }
                    // wd.transform(obj, meta.wolf);
                }
            } else {
                if (t.tp === 'beaver') {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.transform(t, 'meat');
                    }
                }
                if (t.tp === 'player') {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.addWound(t, wound.hit);
                        tire = 22;
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
            wd.transform(wd.me, 'potatoseed')
        } else {
            wd.nextTurn(tire);
        }
    },
};
meta.crab = {
    name: "Hungry crab",
    onCreate: (data) => {
        data.img = "crab";
        data.satiety = 45000;
        data.born = true;
    },
    img: (data) => {
        return data.img;
    },
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

        let tire = 11;
        let t = wd.find(['player', 'tree', 'wood']);
        if (t) {
            let mt = wd.dirTo(t.x, t.y);
            if (mt.dir[0] === dir.here) {
                let food = ['tree', 'wood'];
                let obj = wd.pickUp(food);
                if (obj) {
                    tire = 64;
                    data.satiety += 25000;
                    if (!random(2)) {
                        wd.transform(obj, 'crab')
                    } else {
                        wd.transform(obj, 'stick');
                    }
                    // wd.transform(obj, meta.wolf);
                }
            } else {
                if (t.tp === 'tree') {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.transform(t, 'wood');
                    }
                }
                if (t.tp === 'player') {
                    if (Math.abs(mt.xWant) + Math.abs(mt.yWant) <= 1) {
                        wd.addWound(t, wound.hit);
                        tire = 22;
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
            wd.transform(wd.me, 'stick')
        } else {
            wd.nextTurn(tire);
        }
    },
};
meta.stone = {
    name: "Just Stone",
    img: "stone",
    onApply: (obj, wd) => {
        if (obj.tp === 'stick') {
            wd.transform(obj, 'shovel');
            wd.transform(wd.me, 'shovel');
        }
        if (obj.tp === 'beaveregg') {
            wd.transform(obj, 'beside');
        }
        if (obj.tp === 'potatoseed') {
            wd.transform(obj, 'beside');
        }
        if (obj.tp === 'beaver') {
            obj.data.kind = false;
        }

    }
};
meta.flinders = {
    name: "a lot of flinder",
    img: 'flinders',
    onCreate(data) {
        data.new = true;
    },
    onTurn(data, wd) {
        if (data.new) {
            data.new = false;
            wd.nextTurn(7000);
        } else {
            wd.transformdropAll('highgrass');
            wd.transform(wd.me, 'highgrass');
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp === 'fire') {
            wd.getOut(obj.x, obj.y);
        }
    },
};

meta.cow = {
    name: 'cow',
    isSolid: true,
    isNailed: true,
    describe: 'Ест растения',
    img: 'cow',
    onTurn: (data, wd) => {
        let food = ['potatoplant'];
        let f = wd.isHere(food);
        if (f) {
            if (f.tp == meta.highgrass) {
                wd.transform(f, 'kaka');
            }
            if (f.tp == meta.potatoplant) {
                wd.transform(f, 'potatoseed');
            }
        }
        wd.move();
        wd.nextTurn(30);
    },
};
meta.torch = {
    name: "the Hot Torch",
    img: 'torch',
    onCreate(data) {
        data.new = true;
    },
    onApply: (obj, wd) => {
        if (obj.tp === 'flinders') {
            wd.transform(obj, 'fire');
            // wd.transform(wd.me, meta.axe);
        }
        if (obj.tp === 'fire') {
            wd.getOut(obj.x, obj.y);
        }
    },
    onTurn: (data, wd) => {
        wd.transformdropAll('ash');
        if (data.new) {
            data.new = false;
            wd.nextTurn(1500);
        } else {
            wd.transform(wd.me, 'ash');
        }
    },
};
meta.stick = {
    name: "Stick",
    img: "stick",
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll('stick');
        if (data.new) {
            data.new = false;
            wd.nextTurn(200000);
        } else {
            wd.transform(wd.me, 'potatoseed');
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp === 'stone') {
            wd.transform(obj, 'shovel');
            wd.transform(wd.me, 'shovel');
        }
        if (_.includes(['tree', 'skeleton'], obj.tp)) {
            wd.transform(wd.me, 'flinders');
        }
        if (obj.tp === 'fire') {
            wd.transform(wd.me, 'torch');
        }
        if (obj.tp === 'fence') {
            obj.data.open ^= true;
        }
    },
};

meta.key = {
    name: "key",
    img: "key",
    onCreate(data) {
        data.open = false;
    },
    onApply: (obj, wd) => {
        if (obj.tp === 'door') {
            obj.data.open ^= true;
        }
    },
};

meta.kaka = {
    name: "KAKA",
    img: "kaka",
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
                wd.transform(wd.me, 'blackearth');
            }
        }
    },
};


meta.wwall = {
    name: "Wooden Wall",
    isFow: true,
    img: 'wwall',
    isSolid: true,
};
meta.wall = {
    name: "stone Wall",
    isFow: true,
    img: 'wall',
    isSolid: true,
};

meta.orangetree = {
    name: "a big tree",
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
        if (data.new) {
            data.new = false;
            wd.nextTurn(70000);
        } else {
            wd.transform(wd.me, meta.zebra);
        }
    },
};

meta.box = {
    img: "box",
    isSolid: true,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    }
};

meta.firedegg = {
    name: "fired bevaer egg",
    describe: "жаренное яйцо",
    img: "firedegg",
    onCreate(data) {
    },
    onApply: (obj, wd, p) => {
        if (obj.tp === 'player') {
            // wd.trade(obj);
            wd.transform(wd.me, 'bone');
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
            }
            wd.getOut(p.x, p.y);
        }
    },
    onFirstTurn: (data, wd) => {
        wd.nextTurn(10000);
    },
    onTurn: (data, wd) => {
        wd.transform(wd.me, 'stone');
    }
};
meta.beaveregg = {
    name: "bevaer egg",
    describe: "Вкусное яйцо",
    img: "egg",
    onCreate(data) {
        data.new = true;
    },
    onTake: (data, wd, p) => {
        meta.beaveregg.makeangrybeaver(wd.me.x, wd.me.y, wd);
    },
    onTurn: (data, wd) => {
        if (data.new) {
            data.new = false;
            wd.nextTurn(5000);
        } else {
            if (random(29)) {
                wd.transform(wd.me, 'beaver');
            } else {
                wd.transform(wd.me, 'wolf');
            }
        }
    },
    onApply: (obj, wd, p) => {
        if (obj.tp === 'player') {
            // wd.trade(obj);
            wd.transform(wd.me, 'bone');
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
            }
            meta.beaveregg.makeangrybeaver(p.x, p.y, wd);
            wd.getOut(p.x, p.y);
        }
        if (obj.tp === 'beaver') {
            obj.data.kind = false;
        }
        if (obj.tp === 'fire') {
            wd.transform(wd.me, 'firedegg');
        }
    },
    makeangrybeaver: (x, y, wd) => {
        let t = wd.findFrom(x, y, 'beaver', 1, 4);
        if (t) {
            t.data.kind = false;
        }
    },
};

meta.beside = {
    img: 'beside',
    describe: 'очистки',
    onApply(obj, wd, p) {
        if (obj.tp === 'treeseed') {
            wd.transform(obj, 'fence');
            wd.transform(wd.me, 'fence');
        }
    },
};

meta.flag = {
    img: 'flag',
};
meta.ant = {
    name: "ants",
    img: 'ant',
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
                if (wd.inv() == 0 && data.times > 0) {
                    let t = wd.find([meta.plant, meta.egg, meta.bone, meta.tree, meta.wwall, meta.stick, meta.orangetree, meta.orange, meta.seed, meta.meat, meta.oranger], 0, 1);
                    if (t) {
                        let dt = wd.dirTo(t.x, t.y);
                        if (Math.abs(dt.xWant) + Math.abs(dt.yWant) <= 1) {
                            wd.take(t);
                            if (t.tp === meta.tree || t.tp === meta.orangetree) {
                                wd.transform(t, meta.wwall);
                                data.satiety += 2000;
                            }
                            if (t.tp === meta.orange || t.tp === meta.meat || t.tp === meta.bone || t.tp === meta.egg || t.tp === meta.plant) {
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
meta.mermaid = {
    name: 'mermaid',
    img: 'ariel',
    describe: 'это ариель',
};
meta.potatoseed = {
    img: 'seed',
    name: 'potato seed',
    describe: 'Семена, посадите или соедините с костью чтобы сделать лопату',
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        if (wd.me.carrier) {
            wd.nextTurn(3000);
            data.new = true;
        } else {
            if (data.new) {
                data.new = false;
                wd.nextTurn(7000);
            } else {
                wd.transform(wd.me, 'plant');
            }
        }
    },
    onApply: (obj, wd, p) => {
        if (obj.tp === 'bone') {
            wd.transform(obj, 'pickaxe');
            wd.transform(wd.me, 'pickaxe');
        } else if (obj.tp === 'player') {
            wd.say('В животе неприятно', p);
            wd.getOut(p.x, p.y);
            wd.transform(wd.me, 'beside');
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
            }
            if (!random(3)) {
                wd.addWound(obj, wound.potatoseed);
            }
        }

    }
};
meta.potato = {
    img: 'potato',
    name: 'potato',
    describe: 'Съедобный клубень, перетащите на сердечки, чтобы съесть',
    onTurn: (data, wd) => {
        wd.transformdropAll('potato');
    },
    onApply: (obj, wd, p) => {
        if (obj.tp === 'player') {
            wd.say('Съедобненько', p, '#005500');
            wd.transform(wd.me, 'potatoseed');
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
            }
        }
    },
};
meta.beaver = {
    name: 'beaver',
    describe: 'Зверь питающийся растениями, уничтожает все что стоит на его пути к еде',
    img: (data) => {
        if (data.kind) {
            return 'beaver';
        } else {
            return 'angrybeaver';
        }
    },
    isSolid: true,
    onCreate: (data) => {
        data.satiety = 20000;
        data.digestion = 0;
        data.kind = true;
    },
    onTurn: (data, wd) => {
        let tire = 30;
        if (data.kind) {
            let food = ['potatoplant'];
            let i = wd.inv()[0];
            if (i && data.digestion <= 0) {
                wd.transform(i, 'potatoseed');
                wd.drop(i);
            } else {
                // let f = wd.isNear(food);
                let f = wd.isHereNear(food);
                if (f) {
                    if (random(1)) {
                        wd.take(f);
                        data.digestion = 2000;
                    } else {
                        wd.transform(f, 'beaveregg');
                    }
                    data.satiety += 20000;
                } else {
                    let t = wd.find(food);
                    if (t) {
                        let o = wd.goTo(t);
                        if (o) {
                            if (_.includes(['fence'], o.tp)) {
                                wd.transform(o, 'beside');
                            }
                            if (_.includes(['tree', 'plant'], o.tp)) {
                                wd.transform(o, 'stick');
                            }
                            if (_.includes(['skeleton'], o.tp)) {
                                wd.transform(o, 'bone');
                            }
                            if (_.includes(['wall'], o.tp)) {
                                wd.transform(o, 'stone');
                            }
                        }
                        // let mt = wd.dirTo(t.x, t.y);
                        // if (wd.goTo(mt.dir)) {
                        // wd.goTo(mt.dir);
                        // let o = wd.isNear([meta.tree, meta.zombie]);
                    } else {
                        wd.move(wd.dirRnd);
                    }
                }
                if (data.satiety < 0) {
                    wd.transform(wd.me, 'bone');
                }
            }
        } else {
            tire = 9;
            let t = wd.isNear('player');
            if (t) {
                wd.addWound(t, wound.hit);
            } else {
                let t = wd.find('player', 0, 6);
                if (t) {
                    meta.beaveregg.makeangrybeaver(wd.me.x, wd.me.y, wd);
                    let o = wd.goTo(t);
                    if (o) {
                        if (_.includes(['tree', 'plant'], o.tp)) {
                            wd.transform(o, 'treeseed');
                        }
                        if (_.includes(['skeleton'], o.tp)) {
                            wd.transform(o, 'bone');
                        }
                    }
                } else {
                    data.kind = true;
                }
            }
        }
        data.satiety -= tire;
        data.digestion -= tire;
        wd.nextTurn(tire);
    },
    onApply: (obj, wd, p) => {
        if (obj.tp === 'potatoplant') {
            obj.data.satiety += 5000;
            wd.transform(wd.me, 'beaveregg');
        }
        if (obj.tp === 'tree') {
            wd.transform(obj, 'treeseed');
            wd.getOut(obj.x, obj.y);
        }
        if (obj.tp === 'skeleton') {
            wd.transform(obj, 'bone');
            wd.getOut(obj.x, obj.y);
        }
        if (obj.tp === 'fence') {
            wd.transform(wd.me, 'treeseed');
            wd.getOut(obj.x, obj.y);
        }
    }
};

meta.potatoplant = {
    name: 'potato plant',
    img: 'plant',
    describe: 'Растение со съедобным клубнем, подкопайте лопатой, чтобы съесть',
    isNailed: true,
    onFirstTurn: (data, wd) => {
        let a = wd.isHereNear('blackearth');
        if (a) {
            wd.transform(a, 'potato');
            wd.take(a);
        }
        wd.nextTurn(50000);
    },
    onTurn: (data, wd) => {
        if (random(29)) {
            wd.transform(wd.me, 'orange');
        } else {
            wd.transform(wd.me, 'beaveregg');
        }
    }
};
meta.aphid = {
    name: "aphid ",
    img: (data) => {
        if (data.sat)
            return "aphid2";
        else return "aphid";
    },
    isSolid: true,
    onCreate(data) {
        data.satiety = 3000;
        data.sat = false;
        data.kaka = true;
        data.energy = 0;
    },
    onTurn: (data, wd) => {
        let food = 'highgrass';
        let obj = wd.pickUp(food);
        if (obj) {
            data.satiety += 3000;
            if (obj.tp === 'highgrass') {
                if (data.energy > 1500) {
                    data.kaka ? wd.transform(obj, 'tree') : wd.transform(obj, 'aphid');
                    // wd.transform(obj, meta.aphid);
                    data.kaka ^= true;
                    data.sat = true;
                    data.energy = 0;
                } else {
                    data.sat = false;
                }
            }
        } else {
            wd.drop();
            let t = wd.isNear('highgrass');
            if (t) {
                let d = wd.dirTo(t.x, t.y).dir;
                wd.move(d[0]);
            } else {
                wd.move(wd.dirRnd);
            }
            if (data.satiety <= 0) {
                wd.transform(wd.me, 'bone')
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
        data.energy += f;
        wd.nextTurn(f);
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            // wd.trade(obj);
            wd.transform(wd.me, meta.bone);
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
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

meta.rot = {
    name: 'rot slime',
    img: 'rot',
    onCreate: (data) => {
        data.new = true;
        // data.kind = true;
        // data.satiety = 15000;
    },
    onTurn(data, wd) {
        let tire = 30;
        if (data.new) {
            data.new = false;
        } else {
            let i = wd.inv(wd.me);
            if (i) {
                for (let o of i) {
                    if (o.tp !== meta.rot) {
                        wd.transform(o, meta.rot);
                        break;
                    }
                }
            } else {
                let p = wd.isHere(meta.player);
                if (p) {
                    wd.addWound(p, wound.rot);
                } else {
                    let h = wd.objHere();
                    for (let o of h) {
                        if (o.tp !== meta.zombie && o.tp !== meta.rot) {
                            wd.transform(o, meta.rot);
                            break;
                        }
                    }
                }
            }
        }
        wd.nextTurn(tire);
    }

};


meta.ash = {
    name: "ash",
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
            wd.transform(wd.me, 'potatoplant');
        }
    },

};
meta.fence = {
    name: 'fence',
    describe: 'Забор, примините палку чтобы открыть/закрыть',
    isSolid: (data, obj) => {
        return !data.open;
    },
    isNailed: true,
    img: (data) => {
        if (data.open) {
            return "fenceopen";
        }
        return "fence";
    },
};

meta.door = {
    name: 'door',
    describe: 'Дверь, найдите ключ, чтобы открыть/закрыть',
    isSolid: (data, obj) => {
        return !data.open;
    },
    isNailed: true,
    img: (data) => {
        if (data.open) {
            return "dooropened";
        }
        return "door";
    },
};
meta.fire = {
    name: "fire",
    img: (data) => {
        return "fire";
    },
    isNailed: true,
    isSolid: true,
    onCreate: (data) => {
        data.new = true;
        data.satiety = 3000;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll('fire');
        let tire = 50;
        if (wd.isHere(meta.water)) {
            wd.transform(wd.me, meta.water);
        }
        if (wd.isHere('fire')) {
            wd.movetrought(wd.dirRnd);
        }
        // let food = [meta.tree, meta.crab, meta.jackal, meta.zombie, meta.meat, meta.wwall, meta.flinders, meta.torch, meta.aphid, meta.plant, meta.seed, meta.kaka, meta.ant, meta.wolf, meta.axe, meta.highgrass, meta.bone, meta.stick, meta.orangetree, meta.orange, meta.oranger];
        let food = ['tree', 'crab', 'jackal', 'beside', 'fence', 'wolf', 'skeleton', 'meat', 'wwall', 'flinders', 'torch', 'aphid', 'plant', 'seed', 'bone', 'stick',];
        let o = wd.isHere(food);
        if (o) {
            if (food.tp === meta.zombie) {
                wd.transform(o, 'rot');
            } else {
                wd.transform(o, 'fire');
                data.satiety += 3000;
            }
        }
        data.new = false;
        data.satiety -= tire;
        if (data.satiety <= 0) {
            wd.transform(wd.me, 'ash');
        }
        wd.nextTurn(tire);
    }
};
meta.deepspace = {
    name: 'deep water',
    isSolid: true,
    isNailed: true,
    img: 'deepspace'
};
meta.space = {
    name: "space",
    img: "space",
    isNailed: true,
    isFlat: true,
    isSolid: (data, obj) => {
        if (obj.tp === 'player') {
            if (obj.data.died === 'newborn') {
                return false;
            }
        }
        return true;
    },
    onStepin: (data, obj) => {
        if (obj.data)
            obj.data.died = 'newborn';
    },
    onStepout: (data, obj) => {
        if (obj.data)
            obj.data.died = false;
    },
    // onTurn: (data, wd) => {
    //     if (wd.isHere(meta.water)) {
    //         wd.movetrought(wd.dirRnd);
    //     } else if (wd.isNear(meta.water)) {
    //     } else {
    //         let t = wd.find([meta.water], 1, 10);
    //         if (t) {
    //             wd.relocate(t.x, t.y)
    //         }
    //     }
    //     wd.nextTurn(5);
    // },
};

meta.water = {
    isNailed: true,
    isFlat: true,
    img: 'water',
    onTurn: (data, wd) => {
        let w = wd.isHere('water');
        if (w) {
            wd.move(wd.dirRnd);
            wd.nextTurn(10);
        }
    },

};
meta.axe = {
    name: "axe",
    img: 'axe',
    onApply: (obj, wd, p) => {
        function broke() {
            wd.transform(wd.me, 'flinders');
            wd.getOut(p.x, p.y);
        }

        if (_.includes([meta.wolf, meta.aphid, meta.jackal], obj.tp)) {
            // wd.trade(obj);
            wd.transform(obj, meta.meat);
            broke();
        } else if (obj.tp === meta.orangetree) {
            wd.transform(obj, meta.wood);
            broke()
        } else if (obj.tp === 'tree' || obj.tp === 'wwall') {
            wd.transform(obj, 'wood');
            broke()
        } else if (obj.tp === 'wood') {
            wd.transform(obj, 'wwall');
            broke()
        } else if (obj.tp === meta.ant) {
            wd.transform(obj, meta.treeseed);
            broke()
        } else if (obj.tp === meta.plant) {
            wd.transform(obj, meta.fire);
            broke()
        } else if (obj.tp === meta.zombie) {
            wd.transform(obj, meta.rot);
            broke()
        } else if (obj.tp === 'skeleton') {
            wd.transform(obj, 'bone');
            broke()
        } else if (obj.tp === meta.crab) {
            wd.transform(obj, meta.stick);
            broke()
        }
    }
};
meta.pickaxe = {
    name: "pickaxe",
    img: 'pickaxe',
    onApply: (obj, wd, p) => {
        function broke() {
            wd.transform(wd.me, 'flinders');
            wd.getOut(p.x, p.y);
        }

        if (_.includes(['beaver'], obj.tp)) {
            // wd.trade(obj);
            wd.transform(obj, 'meat');
            broke();
        } else if (_.includes(['wolf'], obj.tp)) {
            // wd.trade(obj);
            wd.transform(obj, 'bone');
            broke();
        } else if (obj.tp === 'tree' || obj.tp === 'wwall') {
            wd.transform(obj, 'wood');
            broke()
        } else if (obj.tp === 'wood') {
            wd.transform(obj, 'wwall');
            broke()
        } else if (obj.tp === meta.ant) {
            wd.transform(obj, meta.treeseed);
            broke()
        } else if (obj.tp === meta.plant) {
            wd.transform(obj, meta.fire);
            broke()
        } else if (obj.tp === meta.zombie) {
            wd.transform(obj, meta.rot);
            broke()
        } else if (obj.tp === 'skeleton') {
            wd.transform(obj, 'bone');
            broke()
        } else if (obj.tp === 'wall') {
            wd.transform(obj, 'stone');
            broke()
        }
    }
};
meta.wood = {
    name: "wood",
    img: 'wood',
};
meta.grill = {
    name: "grill",
    img: "grill",
    onApply: (obj, wd, p) => {
        if (obj.tp == 'player') {
            wd.getOut(p.x, p.y);
            wd.transform(wd.me, 'bone');
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
            }
        }
    },
};
meta.meat = {
    name: "meat",
    img: 'meat',
    onCreate(data) {
        data.new = true;
    },
    onTurn: (data, wd) => {
        wd.transformdropAll('meat');
        if (data.new) {
            data.new = false;
            wd.nextTurn(5000);
        } else {
            wd.transform(wd.me, 'bone');
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp == 'player') {
            // wd.trade(obj);
            wd.transform(wd.me, 'bone');
            if (!wd.removeWound(obj, wound.hungry)) {
                wd.addWound(obj, wound.glut);
                if (random(5) === 0) {
                    wd.addWound(obj, wound.helminth)
                }
            }
        }
        if (obj.tp === 'fire') {
            wd.transform(wd.me, 'grill');
        }
    }
};
meta.treeseed = {
    name: "treeseed",
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
                wd.transform(wd.me, 'tree');
            }
        }
    },
};

const wound = {};

wound.rot = {
    img: 'rot',
    firstAct: (player, q, wd) => {
        wd.nextAct(1000);
    },
    act: (player, q, wd) => {
        wd.removeWound(player, wound.rot);
        let i = wd.inv(player);
        for (let o of i) {
            if (o.tp !== meta.rot) {
                wd.transform(i[0], meta.rot);
                break;
            }
        }
        wd.nextAct(1000);
    },
};

wound.life = {
    img: 'life',
    describe: "Сердечки заменяются полученными ранами, если сердечки закончатся Ваш персонаж переродится"
};

wound.hungry = {
    img: 'hungry',
    describe: "Ваш персонаж голоден, перетащите сюда какую-нибудь еду из инвентаря, если вы ее уже нашли"

};

wound.glut = {
    img: 'glut',
};
wound.helminth = {
    img: 'helminth',
};

wound.swamp = {
    img: 'swamp',
    act: (player, q, wd) => {
        if (!wd.isHere(meta.swamp)) {
            wd.removeWound(player, wound.swamp);
        }
        wd.nextAct(3);
    },
};
wound.potatoseed = {
    img: 'seed',
    describe: 'Семечка запцепилась в животе',
    firstAct: (player, q, wd) => {
        wd.nextAct(3500);
    },
    act: (player, q, wd) => {
        wd.removeWound(player, wound.potatoseed);
        wd.addWound(player, wound.potatoplant);
        wd.nextAct(800)
    },
};
wound.potatoplant = {
    img: 'plant',
    heroimg: 'planthero',
    describe: 'Кажется в вашем персонаже проросла картошка!',
    firstAct: (player, q, wd) => {
        wd.nextAct(1000);
    },
    act: (player, q, wd) => {
        wd.addWound(player, wound.potatoplant);
        wd.say(['Растение разрастается по телу'], wd.me);
        wd.nextAct(1000);
    },
};

wound.hit = {
    img: 'hit',
    describe: 'Легкая рана, заживет сама',
    firstAct: (player, q, wd) => {
        wd.nextAct(1000);
    },
    act: (player, q, wd) => {
        wd.removeWound(player, wound.hit);
        wd.say('Рана зажила', player, color.green);
        wd.nextAct(1000);
    },
};

module.exports = {meta, wound};
