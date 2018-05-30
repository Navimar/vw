const os = require('os');

if (os.platform() == 'darwin') {
    module.exports = {
        ip: "127.0.0.1",
        port: "3000",
        botkey:'320938705:AAGpcdMe9oIhFYuu11MjU4djJnj1maijkpQ'
    }
} else {
    module.exports = {
        ip: "46.101.23.21",
        port: "80",
        botkey:'602673396:AAFHMT_6QTnuPnDBYNLKDGFiiVnwbvZYYHM'
    }
}