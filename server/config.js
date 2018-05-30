const os = require('os');

if (os.platform() == 'darwin') {
    module.exports = {
        ip: "127.0.0.1",
        port: "3000"
    }
} else {
    module.exports = {
        ip: "46.101.23.21",
        port: "80"
    }
}