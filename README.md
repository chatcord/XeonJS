# Xeon Js
### The Single Page Web Framework.

* **Frontend & Backend :** You can write both frontend and backend code from a single project and serve frontend code.
* **No Reload :** Nevegate through the app without reloading the page using *__"data-link"__* attribute to any anchore tag or use *__"nevigateTo(url)"__* function in javascript.
* **Change title or icon :** Change app title or shortcut icon for each routed page using function *__"this.setTitle(title);" & "this.setIcon(url);"__*.
* **Component Based :** You can create view components and use them any where in the app by importing it. This helps to create complex user interface. The component actuly made with html are usely written in javascript function, and used return statement.

## Installation
Xeon Js is perfectly designed to be used from anywhere either npm or cdn.

* **CDN :** xeon js can be impliment from cdn. But there we need to notice that for every endpoint the index.html file have to be served.
```html
<script type="module" src="https://unpkg.com/browse/xeonjs@1.0.3/files/xeonjs-obfuscated.js" ></script>
```
* **NPM :** The folder structure of a xeon app in npm is very simple. There is only two folders and a file is all that we need. Unfortunetly curently we don't have any npm script for start up template. But you can find a startup template [Here](https://github.com/chatcord/XeonJS/template).
* You can also use [online playground](https://codepen.io/) to test Xeon JS.

## Documentation
Xeon JS is very simple and totaly based on browser javascript.

### Folder Structure.
```
 App
 ├───node_modules/ ( npm packages )
 ├───public/
 │   ├───assets/ ( This folder can directly be called from anywhere using "/assets/<file_name>" )
 │   └───index.html ( only html file )
 ├───src/
 │   ├───utils/ ( This folder can directly be called from anywhere using "/utils/<file_name>" )
 │   └───main.js ( mandatory file )
 ├───package-lock.json ( node_modules/ folder tree stayed here. Used for version control for npm packages. Learn More: https://docs.npmjs.com/cli/v7/configuring-npm/package-lock-json )
 └───package.json ( App Details Exists Here. Learn More: https://docs.npmjs.com/cli/v7/configuring-npm/package-json )
 ```
## Hello World Example.
1. create a new project
2. Initialize the project. ( Execute the code ```npm init``` in the command line in the directory )
3. Install Xeon JS in the project ( Execute the code ```npm i xeonjs``` in the command line in the directory )
4. Create "start" script in the /package.json file ( ```/package.json``` file should look like this )
```json
{
  "name": "<App_name>",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "xeon-script start", [This_line_Should_be_added]
    "prod": "xeon-script start -prod" [This_line_may_be_added]
  },
  "author": "",
  "license": "ISI",
  "dependencies": {
    "xeonjs": "^1.0.4"
  }
}
```
5. Now create the following 3 files and add the codes.

* /public/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Xeon Js</title>
      <!-- Add all your links here -->
</head>
<body>
      <!-- Div with id 'root', here all your code will appear -->
      <div id="root"></div>
      <!-- An module script will be added here from backend -->
</body>
</html>
```
* /src/main.js
```js
// This file is mandatory.
// Actual Xeon js will find this file and execute.
// This is an module script directly executes in the browser.

// import view components.
import App from "./view/app.js";

// export constant named "routes" . add all routes with view components here.
export const routes = [
      { path: "/", view: App }
];
// export the id of the div you chosen in the "/public/index.html" file.
export const root = document.getElementById("root");
```
* /src/view/app.js
```js
import Xeon from "/xeon";

export default class extends Xeon {
      constructor(params){
            super(params);
            this.setTitle("Xeon Js Template");
      }

      async getHtml(){
            return(`
                  <h1>Hello World</h1>
            `);
      }
}
```
6. Now enter the command ```npm start``` in the command line in the project directory.
7. Then in the browser you can browse http://localhost:5000/ to see the app.












