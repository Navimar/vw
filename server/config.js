const os = require('os');

if (os.platform() == 'darwin') {
    module.exports = {
        ip: "127.0.0.1",
        port: "3000"
    }
} else {
    module.exports = {
        ip: "139.162.182.31",
        port: "80"
    }
}