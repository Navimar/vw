let highgrass = {
    img: "highgrass",
    z: 0
};
module.exports.highgrass = highgrass;

let wolf = {
    img: "wolf",
    z: 14,
    isSolid:true,
    onTurn:(data,wd)=>{
      let target = wd.find([aphid,"player"]);
      wd.moveTo(target);
};
module.exports.wolf = wolf;

let stone = {
    img: "stone",
    z: 1
};
module.exports.stone = stone;

let kaka = {
    img: "kaka",
    z: 2,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    }
};
module.exports.kaka = kaka;

let tree = {
    z: 20,
    img: "tree",
    isSolid: true,

};
module.exports.tree = tree;

let box = {
    z: 10,
    img: "box",
    isSolid: true,
    onApply: (obj, wd) => {
        wd.getOut(obj.x, obj.y);
    }
};
module.exports.box = box;


let jelly = {
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
            wd.transform(wd.me, aphid);
        }
    },
    onApply: (obj, wd) => {
        if (obj.tp.player) {
            wd.trade(obj);
            wd.transform(wd.me, kaka);
            wd.removeWound(obj, "hungry");
        }
    },
};
module.exports.jelly = jelly;

let aphid = {
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
        if (wd.inv(highgrass)) {
            if (data.convert > 70) {
                let hg = wd.inv(highgrass);
                wd.transform(hg, jelly);
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
                wd.transform(wd.me, highgrass);
            } else {
                if (wd.isHere(highgrass)) {
                    wd.pickUp(highgrass);
                    data.satiety = 70;
                    data.convert = 0;
                } else {
                    wd.move(wd.dirRnd);
                }
            }
        }
        wd.nextTurn(15);
    }
};

module.exports.aphid = aphid;
