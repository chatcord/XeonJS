const path = require('path');
const fs = require('fs');
const os = require('os');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
      appPackage: resolveApp('package.json'),
      Host: process.env.HOST || 'localhost',
      Port: process.env.PORT || 5000,
      Protocol: process.env.HTTPS === 'true' ? 'https' : 'http',
      network: {
            Interface: os.networkInterfaces(),
            length: Object.keys(os.networkInterfaces()).length,
      },
      
}