let fow = (map) => {
    let fow = [];
    // let posx = game.pos.x - (vision - 1) / 2;
    // let posy = game.pos.y - (vision - 1) / 2;
    for (let y = 0; y < 9; y++) {
        fow[y]=[];
        for (let x = 0; x < 9; x++) {
            fow[y][x] = false;
        }
    }
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (map[x][y] == 1) {
                if (x < 4 && y === 4) {
                    let a = x;
                    while (a > 0) {
                        a--;
                        fow[a][4] = true;
                        fow[a][5] = true;
                        fow[a][3] = true;
                    }
                }
                if (x > 4 && y === 4) {
                    let a = x;
                    while (a < 8) {
                        a++;
                        fow[a][4] = true;
                        fow[a][5] = true;
                        fow[a][3] = true;
                    }
                }
                if (x === 4 && y < 4) {
                    let a = y;
                    while (a > 0) {
                        a--;
                        fow[4][a] = true;
                        fow[5][a] = true;
                        fow[3][a] = true;
                    }
                }
                if (x === 4 && y > 4) {
                    let a = y;
                    while (a < 8) {
                        a++;
                        fow[4][a] = true;
                        fow[5][a] = true;
                        fow[3][a] = true;
                    }
                }
                if (x >= 4 && y >= 4) {
                    let a = x;
                    let b = y;
                    while (a < 8 && b < 8) {
                        a++;
                        b++;
                        fow[a][b] = true;
                        if (x <= y) {
                            fow[a - 1][b] = true
                        }
                        if (x >= y) {
                            fow[a][b - 1] = true
                        }
                    }
                }
                if (x >= 4 && y <= 4) {
                    let a = x;
                    let b = y;
                    while (a > 0 && a < 8 && b > 0 && b < 8) {
                        a++;
                        b--;
                        fow[a][b] = true;
                        if (x + y < 9) {
                            fow[a - 1][b] = true
                        }
                        if (x + y > 9) {
                            fow[a][b + 1] = true
                        }
                    }
                }
                if (x <= 4 && y <= 4) {
                    let a = x;
                    let b = y;
                    while (a > 0 && a < 9 && b > 0 && b < 9) {
                        a--;
                        b--;
                        fow[a][b] = true;
                        if (x >= y) {
                            fow[a + 1][b] = true
                        }
                        if (x <= y) {
                            fow[a][b + 1] = true
                        }
                    }
                }
                if (x <= 4 && y >= 4) {
                    let a = x;
                    let b = y;
                    while (a > 0 && a < 8 && b > 0 && b < 8) {
                        a--;
                        b++;
                        fow[a][b] = true;
                        if (x + y >= 8) {
                            fow[a + 1][b] = true
                        }
                        if (x + y <= 8) {
                            fow[a][b - 1] = true
                        }
                    }
                }
            }
        }
    }
    return fow;
};

module.exports = fow;