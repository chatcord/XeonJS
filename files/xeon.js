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