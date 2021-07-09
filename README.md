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
* node_modules/ ( npm packages )
* public/ ()
  * index.html ( only html file )
  * assets/ ( This folder can directly be called from anywhere using "/assets/<file_name>" )
* src/ ()
  * utils/ ( This folder can directly be called from anywhere using "/utils/<file_name>" )
  * main.js ( mandatory file )
* index.js ( mandatory file. Custom Backend Code. Executes before the server starts )
* package-lock.json ( node_modules/ folder tree stayed here. Used for version control for npm packages. [Learn More.](https://docs.npmjs.com/cli/v7/configuring-npm/package-lock-json) )
* package.json ( App Details Exists Here. [Learn More.](https://docs.npmjs.com/cli/v7/configuring-npm/package-json) )
