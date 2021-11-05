/**
 * @file The main server file.
 * 
 * @copyright noCopyright 2021-present, ChatCord, Inc.
 * 
 * @license This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * 
 * @author CodeWithArif
 */
"use strict";

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const fs = require('fs');
const open = require("open");
const chalk = require('chalk');
const chokidar = require('chokidar');
const WebSocket = require('faye-websocket');
const config = require("../utils/config");

// resolveApp func. to get actual path relative to Main app
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const package_json = require(resolveApp("./package.json"));
if(package_json["xeon-config"]) {
      for(const [key, value] of Object.entries(package_json["xeon-config"])) {
            process.env[key] = value;
      }
}

const args = process.argv.slice(2); // Get Arguments

// Add all static folders.
app.use('/assets', express.static(resolveApp('./assets')));
const protectedRoute = new RegExp(`/${process.env.SOURCE_DIR || "src"}/${process.env.PROTECTED_ROUTE || "protected"}($|/)`);
app.use([protectedRoute, '/src'], express.static(resolveApp("./src")));

// Add xeon js and send response.
app.get('/index.js', (req, res, next) => {
      res.status(200).sendFile(resolveApp("./index.js"));
});
app.get('/xeon', (req, res, next) => {
      res.status(200).sendFile(path.resolve(__dirname, "./xeon.js"));
});
app.get('/console.js', (req, res, next) => {
      res.status(200).sendFile(path.resolve(__dirname, "./console.js"));
});
app.get('/erroroverlay', (req, res, next) => {
      res.status(200).sendFile(path.resolve(__dirname, "./errorOverlay.js"));
});


// send index.html file for all end point.
app.all('*', (req, res, next) => {
      var html;
      fs.readFile(resolveApp('./index.html'), 'utf-8', function (err, data) {
            if (err) throw err;
            html = data;
            if (process.env.NODE_ENV === "development") {
                  const wsWebHtml = `<script type="module" src="/erroroverlay"></script><script type="text/javascript">if('WebSocket' in window){(function(){var w=window.location,p=w.protocol==='http:'?'ws://':'wss://',a=p+w.host+w.pathname+'/ws',s=new WebSocket(a);s.onmessage=function(m){if(m.data==='xeon-reload')w.reload();};console.log('Live reload enabled.');})();}</script></head>`;
                  html = html.replace(/\<\/head>/gi, wsWebHtml);
            }
            html = html.replace(/\<\/body>/gi, `<script type="module" src="/index.js" ></script></body>`);// add script to the html.
            res.status(200).send(html);
      });
});

// start the server.
http.listen(config.Port, err => {
      if (err) throw err;
      console.log(chalk.green.bold(`${require(config.appPackage).name} App is started on port ${config.Port}
`));

      const keys = Object.keys(config.network.Interface);
      for (let i = 0; i < config.network.length; i++) {
            let network = keys[i];
            let list = config.network.Interface[network];
            for (let j = 0; j < list.length; j++) {
                  let obj = list[j];
                  if (obj.family === "IPv4") {
                        if (obj.address === "127.0.0.1") {
                              console.log(chalk.cyanBright.bold(`\tLocal Mechine: ${config.Protocol}://${obj.address}:${config.Port}/`));
                        } else {
                              console.log(chalk.white(`\tLocal Network: ${config.Protocol}://${obj.address}:${config.Port}/`));
                        }
                  }
            }
      }
      console.log();
      console.log(chalk.redBright.bold("Press Ctrl + C to terminate the session"));
      console.log();

      if (args[1] === "--development" || args[1] === "-dev" || args[1] === undefined) {
            // open default browser if development mode.
            open(`${config.Protocol}://${config.Host}:${config.Port}/`);
      }
});

if (process.env.NODE_ENV === "development") {
      // Init Websocket.
      var clients = [];
      http.addListener('upgrade', function (request, socket, head) {
            var ws = new WebSocket(request, socket, head);
            ws.onopen = function () { ws.send('connected'); };
            var wait = 100;
            if (wait > 0) {
                  (function () {
                        var wssend = ws.send;
                        var waitTimeout;
                        ws.send = function () {
                              var args = arguments;
                              if (waitTimeout) clearTimeout(waitTimeout);
                              waitTimeout = setTimeout(function () {
                                    wssend.apply(ws, args);
                              }, wait);
                        };
                  })();
            }
            ws.onclose = function () {
                  clients = clients.filter(function (x) {
                        return x !== ws;
                  });
            };
            clients.push(ws);
      });
      // Live Reloading.
      function handleChange(changePath) {
            console.log(chalk.cyanBright.bold("Change Detected at : " + changePath));
            clients.forEach(function (ws) {
                  if (ws)
                        ws.send('xeon-reload');
            });
      }
      var ignored = [
            function (testPath) { // Always ignore dotfiles (important e.g. because editor hidden temp files)
                  return testPath !== "." && /(^[.#]|(?:__|~)$)/.test(path.basename(testPath));
            },
            resolveApp("node_modules"),
      ];
      chokidar.watch(appDirectory, {
            ignored: ignored,
            ignoreInitial: true
      }).on("change", handleChange)
            .on("add", handleChange)
            .on("unlink", handleChange)
            .on("addDir", handleChange)
            .on("unlinkDir", handleChange)
            .on("ready", function () {
                  console.log(chalk.cyanBright("Ready for changes"));
            })
            .on("error", function (err) {
                  console.log(chalk.redBright("ERROR:"), err);
            });
}