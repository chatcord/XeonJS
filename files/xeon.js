/**
 * @file The main xeon file, this will only be imported.
 * 
 * @copyright noCopyright 2021-present, ChatCord, Inc.
 * This source code is licensed under the MIT license found in the
 * @license file in the root directory of this source tree.
 * 
 * @author CodeWithArif
 */
"use strict";

import browserConsole from "./console.js";
const bc = browserConsole;


/**
* @main {function} xeon The main function, parent of all function related to xeon js.
* @define {new xeon() => xeon} Then Export default.
* @final @exports
*/

class xeon {

    /**
     * @var {HTMLElement} root.
     * @var {HTMLElement | function | Array} dom.
     * @var {Map} elements - Store all components with their componentNumber, attribute, children and current dom element.
     * @var {object} currentComponent - Store the last created or edited component with its properties.
     * @var {number} currentComponentNumber - the last component number created or edited.
     * @var {number} totalComponentNumber - the total number of component created.
     * @var {Boolean} editMode - True if any component is reRendering.
     */
    root;
    dom;
    #elements = new Map([]);
    #currentComponent = {};
    #currentComponentNumber = 0;
    #totalComponentNumber = 0;
    #reference = new Map([]);
    #totalReferenceNumber = 0;
    #editMode = false;
    #functionalOnInit;
    #matchMediaDark = window.matchMedia("(prefers-color-scheme: dark)");

    constructor() {

        this.theme = {
            dark: this.#matchMediaDark.matches,
            light: !this.#matchMediaDark.matches
        }

        this.#matchMediaDark.addListener(e => {
            this.theme = {
                dark: e.matches,
                light: !e.matches
            }
            this.config(this.dom, this.root);
        });

    }


    /**
     * 
     * @param {function} v 
     * @returns {Boolean}
     * @protected
     */
    #isClass(v) {
        return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
    }

    /**
     * 
     * @param {string} path - url path.
     * @returns 
     * @protected
     */
    #pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)?") + "$");

    /**
     * getParams - get parametere from url
     * 
     * @param {object} match - route mached with current url.
     * @returns 
     * @protected
     */
    #getParams = match => {
        const values = match.result.slice(1);
        let keys;
        if (!Array.isArray(match.route.path)) {
            keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
        } else {
            match.route.path.forEach(path => {
                const match = location.pathname.match(this.#pathToRegex(path));
                if (match) {
                    keys = Array.from(path.matchAll(/:(\w+)/g)).map(result => result[1]);
                    return;
                }
            })
        }

        return Object.fromEntries(keys.map((key, i) => {
            return [key, values[i]];
        }));
    };

    #observeDOM = (() => {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        return function (obj, callback) {
            var staticXeon = this;
            if (MutationObserver) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
                    callback.bind(staticXeon)(mutations, observer);
                });
                // have the observer observe foo for changes in children
                obs.observe(obj, { childList: true, subtree: true });

                return obs;
            }
        }
    }).bind(this)();

    /**
     * getPath - find out a path from dom, the routing configuration.
     * 
     * @param {string} query - path to find out from dom
     * @returns 
     */
    #getPath = query => {
        let result;
        if (Array.isArray(this.dom)) {
            this.dom.forEach(route => {
                if (!Array.isArray(route.path)) {
                    if (route.path === query) {
                        result = route;
                    }
                } else {
                    route.path.forEach(path => {
                        if (path === query) {
                            result = route;
                        }
                    })
                }
            })
        }
        return result;
    }

    /**
     * navigateTo - navigate between pages with out reload.
     * 
     * @param {string} url - the url where to navigate.
     */
    navigateTo = (url) => {
        url = url.replace(/:(\w+)[^]*/g, "");
        // console.log(url);
        if (window.location.pathname !== url && window.location.href !== url && window.location.origin !== url) {
            history.pushState(null, null, url);
            this.config(this.dom, this.root);
        }
    }

    /**
    * The configuration Function. HTML Element to Dom Converter.
    *
    * @param {HTMLElement | Array} dom The HTMLElement to append or an Array of url routes.
    * @param {HTMLElement} root The HTMLElement from the dom, where to append.
    * 
    * @final append dom in root element.
    */
    config(dom, root) {

        /** Empty the root element */
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

        /** Store dom and root to the global for further uses. */
        this.root = root;
        this.dom = dom;

        /** @global {Array} match - an array with route and result of the matched URL location */
        var match;

        /**
         * @condition dom is a function. It must return a HTMLElement. Store it in Dom.
         */
        if (typeof dom === "function") {
            dom = dom();
        }

        /**
         * @condition dom is an Array. It must be routing module.
         */
        if (Array.isArray(dom)) {

            /**
             * @condition each item of the Array dom is an Object - Continue.
             * @process Compare all routing configuration object's path with standard Regular Expression using #pathToRegex function.
             * @global {Array} potentialMatches - Store the compared path's route & result.
             * 
             * @condition route.path is an Array. Try checking each item of it.
             */
            var potentialMatches = [];
            dom.map(route => {

                if (typeof route === "object") {

                    if (!Array.isArray(route.path)) {

                        potentialMatches.push({
                            route: route,
                            result: location.pathname.match(this.#pathToRegex(route.path))
                        });

                    } else {

                        route.path.map(path => {
                            potentialMatches.push({
                                route: route,
                                result: location.pathname.match(this.#pathToRegex(path))
                            });
                        });

                    }
                }

            });

            /** @process store route where the path matchs th url location. */
            match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);
            // console.log(potentialMatches);

            /**
             * @condition match exists. import the script defined in the "match.route.src"
             * @process run the script's default export function / class. Pass the url parametere as the fuction property. get the parametere from #getParams function.
             * The function must return HTMLElement. append this to the root element.
             */
            if (match) {

                import(match.route.src).then(module => {
                    if (typeof module.default === "function") {
                        dom = module.default(this.#getParams(match));
                        this.root.appendChild(dom);
                    } else {
                        bc.error(`"${match.route.src}" doesn't export any default.`)
                    }
                }).catch(e => bc.error(`Can not find module named "${match.route.src}"\n${e}`))

            } else {
                /**
                 * @condition match doesn't exist. check if user adds any 404 error page in the routing confugeration. Store the result in route.
                 * @condition route exists. Import the script defined in the "route.src"
                 * @process run the script's default export function / class. Pass the url parametere as the fuction property. get the parametere from #getParams function.
                 * The function must return HTMLElement. append this to the root element.
                 */

                let route = this.#getPath('/404');
                if (route) {

                    import(route.src).then(module => {
                        if (typeof module.default === "function") {
                            dom = module.default();
                            this.root.appendChild(dom);
                        } else {
                            bc.error(`"${match.route.src}" doesn't export any default.`)
                        }
                    }).catch(e => bc.error(`Can not find module named "${match.route.src}"`))

                } else {

                    /**
                     * @condition route doesn't exist. Redirect user to the first route.
                     * @condition path of the dom's first item is an Array. Redirect to the first path.
                     * @else redirect to the path.
                     */
                    if (Array.isArray(dom[0].path)) {
                        this.navigateTo(dom[0].path[0]);
                    } else {
                        this.navigateTo(dom[0].path);
                    }

                }

            }

        } else {
            /**
             * @condition dom is a HTMLElemnt. append this to the root element.
             */
            this.root.appendChild(dom);
        }
    }

    /**
     * 
     * @param {string | function} element The name of the element or the component.
     * @param {object} attribute Attributes of the element or the component.
     * @param  {...any} children The children of the element or the component.
     * 
     * @if {element is function} run it and get the element.
     * @process {add attribute}
     * @process {add children} for Component add it into the attribute.
     * 
     * @returns {HTMLElement} With the attributes and children.
     */
    createElement(element, attribute, ...children) {
        if (typeof element === "string") {

            /**
             * @param {HTMLElement} p The parent HTMLNode.
             * @process convert element name into lowrcase.
             * @process Create Parent Element.
             */
            const p = document.createElement(element.toLowerCase());

            /**
             * @condition Attribut must be given, and it must be an object.
             */
            if (attribute && typeof attribute === "object") {
                Object.keys(attribute).forEach((key) => {
                    /**
                     * @condition attribute is style ? It must be an Object.
                     */
                    if (key.toLowerCase() === 'style') {
                        if (typeof attribute[key] === 'object')
                            Object.keys(attribute[key]).forEach((attr) => {
                                p.style[attr] = attribute[key][attr];
                            });
                        else
                            bc.error('Inline styles must be in Object format.');
                    } else if (key.toLowerCase() === 'ref') {
                        if (typeof attribute[key] === 'object' && attribute[key].refNum) {
                            this.updateRef(attribute[key].refNum, p);
                        } else bc.error(`Didn't get a valid reference in ${element}`);
                    } else {
                        /**
                         * @condition If attribute's key is string. Simply add this.
                         */
                        if (typeof attribute[key] === 'string') {

                            /**
                             * @condition the element is image element.
                             * element will be visible after the image loaded.
                             */
                            if (element.toLowerCase() === "img") {
                                if (key.toLowerCase() === "src") {
                                    var img = new Image();

                                    img.onload = function () {
                                        p.src = img.src;
                                    };

                                    let wait = setInterval(function () {
                                        let w = img.naturalWidth,
                                            h = img.naturalHeight;
                                        if (w && h) {
                                            clearInterval(wait);
                                            p.style.aspectRatio = w / h;
                                        }
                                    }, 30);

                                    img.src = attribute[key];
                                }
                            } else {
                                p.setAttribute(key.toLowerCase(), attribute[key])
                            }

                        }
                        /**
                         * @condition If attribute's key is a function. then it must be an event.
                         * @process add the event like "element.onclick"
                         */
                        if (typeof attribute[key] === 'function') {
                            p[key.toLowerCase()] = attribute[key];
                        }
                    }
                })
            } else {
                // If attribute is not an object.
                if (!attribute) bc.error('You must provide attribute for each element. Give at least an empty object.');
                else bc.error("Attribute Must be an object");
            }

            /**
             * Children will always be an Array as it is a args. If nothing is provided as child there will be an empty array.
             * Add each child one by one.
             * Creating function for that it could be exicuted repitedly.
             * 
             * @param {string | number | HTMLElement | function | Array} child Children of the element
             */
            function addEachChild(child) {

                if (child !== undefined || null) {

                    /**
                     * @Condition Child Element is string.
                     * Create Text Node and append.
                     */
                    if (typeof child === 'string' || typeof child === 'number') {
                        p.appendChild(document.createTextNode(child))
                    }

                    /**
                     * @Condition Child Element is HTMLElement.
                     * append.
                     */
                    else if (child.nodeType >= 1 && child.nodeType <= 11) {
                        p.appendChild(child)
                    }

                    /**
                     * @Condition Child Element is an Array.
                     * run addChildren function with parametere of child.
                     */
                    else if (Array.isArray(child)) {
                        addChildren(child);
                    }
                    else {
                        console.log(child);
                        bc.error(`Invalid child : Expect a HTMLNode or String. But found a ${typeof child}. \n>>>==============>>> Unwillingly ignoring it.`);
                    }
                }
            }

            /**
             * 
             * @param {Array} children Array of child.
             */
            function addChildren(children) {
                children.forEach((child) => {
                    addEachChild(child);
                })
            }

            /**
             * as the children params is a args, it must be an array,
             * run the addChildren function with the parametere of children.
             */
            addChildren(children);

            /**
             * @returns {HTMLElement}
             */
            return p;
        } else {

            /**
             * Component
             * 
             * @if element is function or class, it will be an component.
             * run the #createComponent function.
             * @returns {HTMLElement}
             */
            let c = this.#createComponent(element, attribute, children, !this.#editMode, this.#currentComponentNumber + 1);
            if (Array.isArray(c)) {
                // let fragment = document.createDocumentFragment();
                let fragment = new DocumentFragment();
                c.forEach(elem => {
                    fragment.appendChild(elem);
                })
                return fragment;
            } else {
                return c;
            }
        }
    };

    /**
     * 
     * @param {function} component - Function or Class based component
     * @param {object} attribute - object of attribute
     * @param {Array} children - Array of children
     * @param {Boolean} fresh - Either the component is fresh or not.
     * @param {Number} componentNumber - the serial number of the component.
     * @returns {HTMLElement}
     */
    #createComponent(component, attribute, children, fresh, componentNumber) {

        /**
         * There will be two types of component. Fresh Component & reRendered component.
         * 
         * @condition attribute is object. continue
         */
        if (attribute && typeof attribute === "object") {

            /** @condition fresh = true : the component is new, so the editMode will be false. */
            fresh ? this.#editMode = false : this.#editMode = true

            /** @condition fresh = true : the component is to be created, so create a new componntNumber. */
            if (fresh) {
                this.#totalComponentNumber++;
                let keys = Array.from(this.#elements.keys());
                componentNumber = keys[keys.length - 1] + 1;
                if (isNaN(componentNumber) && this.#totalComponentNumber === 0) {
                    componentNumber = 1;
                } else {
                    componentNumber = this.#totalComponentNumber;
                }
            }
            this.#currentComponentNumber = componentNumber;

            /**
             * @condition component is class based, process it like a class.
             */
            var p, clearInitFunction, DOMObserver, staticXeon = this;
            if (!this.#isClass(component)) {
                /** @process run the component and store the returned HTMLElement */
                p = component({ ...attribute, children, componentNumber });
                var functionalOnInit = this.#functionalOnInit;
                if (typeof functionalOnInit === "function") {
                    this.#observeDOM(document, (mutations, observer) => {

                        mutations.forEach(function (mutation) {
                            var addedNodes = Array.from(mutation.addedNodes);
                            var removedNodes = Array.from(mutation.removedNodes);

                            if (p.nodeType >= 1 && p.nodeType <= 11) {
                                var isAddedNodes = addedNodes.indexOf(p) > -1;
                                var isNodeAddedByParent = addedNodes.some(parent => parent.contains(p));
                                var isRemovedNodes = removedNodes.indexOf(p) > -1;
                                var isNodeRemovedByParent = removedNodes.some(parent => parent.contains(p));

                                // console.log(p);
                                // console.table({ isAddedNodes, isNodeAddedByParent, isRemovedNodes, isNodeRemovedByParent });

                                if (isAddedNodes | isNodeAddedByParent) {
                                    clearInitFunction = functionalOnInit(p);
                                    DOMObserver = observer;
                                    saveComponent();
                                } else if (isRemovedNodes | isNodeRemovedByParent) {
                                    if (typeof clearInitFunction === "function") {
                                        clearInitFunction(p);
                                    }
                                    observer.disconnect();
                                }
                            }
                        });

                    })
                } else {
                    saveComponent();
                }
            } else {
                const classComponent = new component({ ...attribute, children, componentNumber });
                p = classComponent.render();

                if (typeof classComponent.onInit === "function") {
                    this.#observeDOM(document, (mutations, observer) => {

                        mutations.forEach(function (mutation) {
                            var addedNodes = Array.from(mutation.addedNodes);
                            var removedNodes = Array.from(mutation.removedNodes);

                            if (p.nodeType >= 1 && p.nodeType <= 11) {
                                var isAddedNodes = addedNodes.indexOf(p) > -1;
                                var isNodeAddedByParent = addedNodes.some(parent => parent.contains(p));
                                var isRemovedNodes = removedNodes.indexOf(p) > -1;
                                var isNodeRemovedByParent = removedNodes.some(parent => parent.contains(p));

                                // console.log(p.children);
                                // console.table({ isAddedNodes, isNodeAddedByParent, isRemovedNodes, isNodeRemovedByParent });

                                if (isAddedNodes | isNodeAddedByParent) {
                                    clearInitFunction = classComponent.onInit(p);
                                    DOMObserver = observer;
                                    saveComponent();
                                } else if (isRemovedNodes | isNodeRemovedByParent) {
                                    if (typeof clearInitFunction === "function") {
                                        clearInitFunction(p);
                                    }
                                    observer.disconnect();
                                }
                            }
                        });

                    })
                } else {
                    saveComponent();
                }
            }

            function saveComponent() {
                /** @global {object} currentComponent */
                staticXeon.#currentComponent = {
                    node: p,
                    component,
                    attribute,
                    children,
                    clearInitFunction,
                    DOMObserver
                }

                /** Either store new component or replace old component with new one. */
                staticXeon.#elements.set(componentNumber, staticXeon.#currentComponent);
            }


            /** testing */
            // console.log(this.#elements);

            /**
             * Run the onload function.
             */

            return p;
        } else {
            // If there is no attribute or it is undefind/null.
            bc.error('You must provide attribute for each element. Give at least an empty object.');
        }
    }

    /**
     * reRender a component.
     * 
     * @param {Number} componentNumber - serial Number of component to be reRender.
     */
    reRender(componentNumber) {

        // console.time("re-render");
        const component = this.#elements.get(componentNumber);
        const newComponentNode = this.#createComponent(component.component, component.attribute, component.children, false, componentNumber);
        const parentNode = component.node.parentNode;
        // console.time('elementChange');
        parentNode.replaceChild(newComponentNode, component.node);
        // console.timeEnd('elementChange');
        // console.timeEnd("re-render");

    }


    /**
     * XSET Create element function
     * 
     * @param {String | Function} elementName 
     * @param {Object | String} entries 
     * @returns { HTMLElement } - xeon element
     */
    #XSETCreateElement(elementName, entries) {
        if (typeof entries === "object" && !Array.isArray(entries)) {
            let children = [];
            const { name: name, children: child, text: text, ...attributes } = entries;
            if (child) {
                for (const [key, value] of Object.entries(child)) {
                    children.push(this.#XSETCreateElement(key, value));
                }
            }
            if (text && (typeof text === "string" | typeof text === "number")) {
                children.push(text);
            }
            if (elementName.toLowerCase() === "component") {
                return this.createElement(name, { ...attributes, text }, ...children);
            } else {
                return this.createElement(elementName, { ...attributes, name }, ...children);
            }
        } else {
            if (typeof entries === "string") {
                return entries;
            }
        }
    }

    /**
     * XEON-Stack-Element-Tree
     * 
     * convert an object tree into xeon component.
     * 
     * @param {Object} params - an object including all element trees
     * @returns { HTMLElement } - xeon element
     */
    XSET(params) {
        var element = [];
        if (typeof params === "object" && !Array.isArray(params)) {
            if (Object.keys(params).length <= 0) {
                throw new SyntaxError("xeon.XSE function requires an object with atleast one entry. But zero entry found.");
            } else {
                for (const [key, value] of Object.entries(params)) {
                    element.push(this.#XSETCreateElement(key, value));
                }
            }
        }
        return this.createElement(this.fragment, {}, ...element);
    }


    fragment(props) {
        return props.children;
    }

    onInit(func) {
        this.#functionalOnInit = func;
    }

    useState(initialState) {

        const setState = updatedState => {
            console.log(updatedState);
        }

        return [initialState, setState]
    }

    createRef(initialValue) {
        this.#totalReferenceNumber++;
        this.#reference.set(this.#totalReferenceNumber, {
            refNum: this.#totalReferenceNumber,
            initialValue,
            current: initialValue
        });
        return ({
            refNum: this.#totalReferenceNumber,
            initialValue,
            current: initialValue
        });
    }

    updateRef(refNum, current) {
        const ref = this.#reference.get(refNum);
        this.#reference.set(refNum, { ...ref, current });
        // console.log(this.#reference);
    }

}


/**
 * Xeon JS Class component Extender.
 */
export const xeonComponent = class {
    constructor(props) {
        this.props = props;
    }

    setTitle(title) {
        document.title = title;
    }

    setIcon(file) {
        document.querySelector("link[rel='shortcut icon']").href = file;
    }

    onInit(element) {
        return (element) => { }
    }

    getHtml() {
        return "";
    }
}


/**
 * @global {class} xeon - new xeon class.
 * @exports default xeon.
 * 
 * @exports others seperately.
 */
xeon = new xeon();

/**
 * @Event OnBackPress
 */
const popStateFunction = e => {
    e.preventDefault();
    xeon.config(xeon.dom, xeon.root);
}
window.removeEventListener("popstate", popStateFunction);
window.addEventListener("popstate", popStateFunction);

export default xeon;
export const XSET = xeon.XSET;
export const useState = xeon.useState;
export const reRender = xeon.reRender;
export const navigateTo = xeon.navigateTo;
export const theme = xeon.theme;