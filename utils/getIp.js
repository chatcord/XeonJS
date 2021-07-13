/**
 * Copyright (c) 2021-present, ChatCord, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const config = require("./config");

const keys = Object.keys(config.network.Interface);
// console.log(keys);
var object = {};

for(let i=0;i<config.network.length;i++){
      let network = keys[i];
      let list = config.network.Interface[network];
      // console.log(network, list);
      var item = [];
      for(let j=0;j<list.length;j++){
            let obj = list[j];
            let family = obj.family;
            let ip = obj.address;
            item.push({ family: family, ip: ip });
      }
      // object.network = network;
      object[network] = item;
}
module.exports = object;