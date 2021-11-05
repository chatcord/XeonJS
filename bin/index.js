#!/usr/bin/env node
/**
 * Copyright (c) 2021-present, ChatCord, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const clearConsole = require("../utils/clearConsole");
const fs = require("fs");
const path = require("path");
const chalk = require('chalk');

const args = process.argv.slice(2);
var mode;

if (args[0] === "start") {
      if(args[1] === "--production" || args[1] === "-prod"){
            mode = "production";
            process.env.NODE_ENV = "production";
      } else if(args[1] === "--development" || args[1] === "-dev" || args[1] === undefined){
            mode = "development";
            process.env.NODE_ENV = "development";
      }
      clearConsole();
      console.log(chalk.blue.bold(`
Xeon Js ${mode} Environment is setting up ...
`));
      
      require("../files/server", mode);
} else if(args[0] === "--help" || args[0] === "-h"){
      clearConsole();
      fs.readFile( path.resolve(__dirname, "../files/help.txt") , 'utf-8', function(err, data){
            if (err) throw err;
            console.log(data);
      });
}

