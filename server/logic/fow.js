// let fow = (map) => {
//     let fow = [];
//     // let posx = game.pos.x - (vision - 1) / 2;
//     // let posy = game.pos.y - (vision - 1) / 2;
//     for (let y = 0; y < 9; y++) {
//         fow[y]=[];
//         for (let x = 0; x < 9; x++) {
//             fow[y][x] = false;
//         }
//     }
//     for (let y = 0; y < 9; y++) {
//         for (let x = 0; x < 9; x++) {
//             if (map[x][y] == 1) {
//                 if (x < 4 && y === 4) {
//                     let a = x;
//                     while (a > 0) {
//                         a--;
//                         fow[a][4] = true;
//                         fow[a][5] = true;
//                         fow[a][3] = true;
//                     }
//                 }
//                 if (x > 4 && y === 4) {
//                     let a = x;
//                     while (a < 8) {
//                         a++;
//                         fow[a][4] = true;
//                         fow[a][5] = true;
//                         fow[a][3] = true;
//                     }
//                 }
//                 if (x === 4 && y < 4) {
//                     let a = y;
//                     while (a > 0) {
//                         a--;
//                         fow[4][a] = true;
//                         fow[5][a] = true;
//                         fow[3][a] = true;
//                     }
//                 }
//                 if (x === 4 && y > 4) {
//                     let a = y;
//                     while (a < 8) {
//                         a++;
//                         fow[4][a] = true;
//                         fow[5][a] = true;
//                         fow[3][a] = true;
//                     }
//                 }
//                 if (x >= 4 && y >= 4) {
//                     let a = x;
//                     let b = y;
//                     while (a < 8 && b < 8) {
//                         a++;
//                         b++;
//                         fow[a][b] = true;
//                         if (x <= y) {
//                             fow[a - 1][b] = true
//                         }
//                         if (x >= y) {
//                             fow[a][b - 1] = true
//                         }
//                     }
//                 }
//                 if (x >= 4 && y <= 4) {
//                     let a = x;
//                     let b = y;
//                     while (a > 0 && a < 8 && b > 0 && b < 8) {
//                         a++;
//                         b--;
//                         fow[a][b] = true;
//                         if (x + y < 9) {
//                             fow[a - 1][b] = true
//                         }
//                         if (x + y > 9) {
//                             fow[a][b + 1] = true
//                         }
//                     }
//                 }
//                 if (x <= 4 && y <= 4) {
//                     let a = x;
//                     let b = y;
//                     while (a > 0 && a < 9 && b > 0 && b < 9) {
//                         a--;
//                         b--;
//                         fow[a][b] = true;
//                         if (x >= y) {
//                             fow[a + 1][b] = true
//                         }
//                         if (x <= y) {
//                             fow[a][b + 1] = true
//                         }
//                     }
//                 }
//                 if (x <= 4 && y >= 4) {
//                     let a = x;
//                     let b = y;
//                     while (a > 0 && a < 8 && b > 0 && b < 8) {
//                         a--;
//                         b++;
//                         fow[a][b] = true;
//                         if (x + y >= 8) {
//                             fow[a + 1][b] = true
//                         }
//                         if (x + y <= 8) {
//                             fow[a][b - 1] = true
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     return fow;
// };

let fow = (map) => {
    let fow = [];
    for (let y = -1; y < 10; y++) {
        fow[y] = [];
        for (let x = -1; x < 10; x++) {
            fow[y][x] = true;
        }
    }
    fow[4][5] = false;
    fow[5][4] = false;
    // fow[5][5] = false;
    // fow[3][3] = false;
    fow[3][4] = false;
    fow[4][3] = false;
    // fow[3][5] = false;
    // fow[5][3] = false;
    fow[4][4] = false;

    for (let i = 0; i < 8; i++) {
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (!map[x][y] && !fow[x][y]) {
                    // fow[x + 1][y + 1] = false;
                    fow[x + 1][y] = false;
                    fow[x][y + 1] = false;
                    // fow[x - 1][y - 1] = false;
                    fow[x][y - 1] = false;
                    fow[x - 1][y] = false;
                    // fow[x + 1][y - 1] = false;
                    // fow[x - 1][y + 1] = false;
                }
            }
        }
    }
    return fow;
};

module.exports = fow;