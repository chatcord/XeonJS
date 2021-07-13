/**
 * Copyright (c) 2021-present, ChatCord, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default class {
    constructor(params) {
        this.params = params;
    }

    setTitle(title) {
        document.title = title;
    }

    setIcon(file){
        document.querySelector("link[rel='shortcut icon']").href = file;
    }

    async getHtml() {
        return "";
    }
}