let highgrass = {
    img: "highgrass"
};
module.exports.highgrass = highgrass;

let jelly = {
    img: "jelly"
};
module.exports.jelly = jelly;

let aphid = {
    img: (data) => {
        if (data.satiety > 15)
            return "aphid2";
        else return "aphid";
    },
    isSolid: true,
    onCreate(data){
        data.satiety = 15;
    },
    onTurn: (data, wd) => {
        if (wd.has(highgrass)) {
            if (data.convert > 15) {
                let hg = wd.inv(highgrass);
                wd.transform(hg, jelly);
                wd.drop(hg);
            } else {
                wd.move(wd.dirRnd);
            }
        } else {
            data.satiety -= 1;
            if (data.satiety == 0) {
                wd.transform(wd.me, highgrass);
            } else {
                if (wd.isHere(highgrass)) {
                    wd.takeHere(highgrass);
                    data.satiety = 15;
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
