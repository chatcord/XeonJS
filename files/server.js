const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const fs = require('fs');
const open = require("open");
const config = require("../utils/config");

// resolveApp func. to get actual path relative to Main app
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const args = process.argv.slice(2); // Get Arguments
// Add all static folders.
app.use('/public', express.static(resolveApp("public")));
app.use('/assets', express.static(resolveApp('public/assets')));
app.use('/src'   , express.static(resolveApp('src')));
app.use('/utils' , express.static(resolveApp('src/utils')));
// Add xeon js and xeonjs js and send response.
app.get('/xeonjs', (req, res, next) => {
      res.status(200).sendFile(path.resolve(__dirname, "./xeonjs-obfuscated.js"));
});
app.get('/xeon', (req, res, next) => {
      res.status(200).sendFile(path.resolve(__dirname, "./xeon.js"));
});
// send index.html file for all end point.
app.all('*', (req, res, next) => {
      var html;
      fs.readFile(resolveApp('public/index.html'), 'utf-8', function(err, data){
            if (err) throw err;
            html = data.replace(/\<\/body>/gi , `     <script type="module" src="/xeonjs" ></script>
</body>` );// add script to the html.
            res.status(200).send(html);
      });
});

// start the server.
http.listen( config.Port , err => {
      if (err) throw err;
console.log("\x1b[32m",`${ require(config.appPackage).name } App is started on port ${ config.Port }
`, "\x1b[0m" );

const keys = Object.keys(config.network.Interface);
for(let i=0;i<config.network.length;i++){
      let network = keys[i];
      let list = config.network.Interface[network];
      for(let j=0;j<list.length;j++){
            let obj = list[j];
            // console.log(obj);
            if(obj.family === "IPv4"){
                  if(obj.address === "127.0.0.1"){
                        console.log("\x1b[32m",`    Local Mechine: ${config.Protocol}://${ obj.address }:${config.Port}/`, "\x1b[0m" );
                  } else {
                        console.log(`     Local Network: ${config.Protocol}://${ obj.address }:${config.Port}/`);
                  }
            }
      }
}
console.log();
console.log("\x1b[31m",`Press Ctrl + C to terminate the session
`, "\x1b[0m" );

      if(args[1] === "--development" || args[1] === "-dev" || args[1] === undefined){
            open(`${config.Protocol}://${config.Host}:${config.Port}/`); // open default browser if development mode.
      }
});
