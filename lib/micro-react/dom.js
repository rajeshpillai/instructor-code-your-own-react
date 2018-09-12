var TinyReact = (function () {
    const createElement = function (type, attributes = {}, ...children) {
        const childElements = [].concat(...children)
            .map(child => child instanceof Object
                ? child
                : createElement("text", { textContent: child }));
        return {
            type,
            children: childElements,
            props: Object.assign({ children: childElements }, attributes)
        };
    }

    const diff = function (vdom, container, oldDom) {
        let oldVDom = oldDom && oldDom._virtualElement;
        if (!oldVDom) {
            // Create new dom element 
            createNewDomElement(vdom, container, oldDom);
        } else if (!vdom) {
            container.removeChild(oldDom);
        }
        else if (vdom.type === oldVDom.type || typeof vdom.type === 'function') {
            // Update nodes
            if (typeof vdom.type === 'function') {
                if (TinyReact.Component.isPrototypeOf(vdom.type)) {  // Handle class/ctor
                    // class
                    let component = null;
                    let newVdom = null;
                    
                    if (oldVDom.component) {
                        component = oldVDom.component;
                        component.updateProps(vdom.props);
                        newVdom = component.render();
                        newVdom.component = component;
                    } else {
                        component = new vdom.type(vdom.props);
                        newVdom = component.render();
                        newVdom.component = component;
                    }
                    
                    // component = new vdom.type(vdom.props);
                    // newVdom = component.render();
                    // newVdom.component = component;
                    // if (oldVDom.component) {
                    //     // component.updateProps(vdom.props);
                    //     // newVdom.component = oldVDom.component;
                    //     newVdom.component.setDomElement(oldVDom.component.getDomElement());
                    // }

                    vdom = newVdom;
                    
                } else {
                    // function
                    vdom = vdom.type(vdom.props);    
                    //diff(newVdom, container, oldDom);
                }
            }    
            else {
                // Text node or dom elements
                if (vdom.type === "text") {
                    if (vdom.props.textContent !== oldVDom.props.textContent) {
                        oldDom.textContent = vdom.props.textContent;
                        oldDom._virtualElement = vdom;
                    } 
                } else {
                    _updateProps(oldDom, vdom, oldVDom);
                    oldDom._virtualElement.props = vdom.props;

                }
            }

            vdom.children.forEach((childElement, i) => {
                diff(childElement, oldDom, oldDom.childNodes[i]);
            });

            // TODO: Pending
            let oldDomChilds = oldDom.childNodes;
            if (oldDomChilds.length > vdom.children.length) {
                for(let i = oldDomChilds.length-1; i >= vdom.children.length; i--){
                    oldDomChilds[i].remove();
                }
            }
        } else {
             // Replace child -> Same no of elements but element changed 
             let nd1 = createNewDomElement(vdom, container, oldDom);
             container.replaceChild(nd1, oldDom);
        }
    }

    const render = function (vdom, container, oldDom = container.firstChild) {
        diff(vdom, container, oldDom);
    }

    const createNewDomElement = function (vdom, container, oldDom = container.firstChild) {
        console.log("firstChild: ", oldDom);
        var dom = null;
        if (vdom.type === "text") {
            dom = createTextNode(vdom);
            dom._virtualElement = vdom;
            container.appendChild(dom);
            return dom;
        }
        else if (typeof vdom.type === "function") {
            let newVdom = null;
            let component = null;
            if (TinyReact.Component.isPrototypeOf(vdom.type)) {  // Handle class/ctor
                component = new vdom.type(vdom.props);
                newVdom = component.render();
                newVdom.component = component;
            } else {
                newVdom = vdom.type(vdom.props);
            } 

            dom = createDomElement(newVdom);
            dom._virtualElement = newVdom;

            if (component) {
                component.setDomElement(dom);
                if (component && component.props.ref) {
                    component.props.ref(component);
                }
            }
            container.appendChild(dom);
            
            newVdom.children.forEach(childElement => {
                return diff(childElement, dom)
            });

            return dom;
        }
        else {
            dom = createDomElement(vdom);
            dom._virtualElement = vdom;
            _updateProps(dom, vdom);
            
            container.appendChild(dom);
            
            vdom.children.forEach(childElement => {
                return diff(childElement, dom)
            });
            if (vdom.props.ref) {
                vdom.props.ref(dom);
            }
            return dom;
        }
    }
    

    function _updateProps(domElement, newVirtualElement, oldVirtualElement={}) {
        const newProps = newVirtualElement.props || {};
        const oldProps = oldVirtualElement.props || {};
        Object.keys(newProps).forEach(propName => {
            const newProp = newProps[propName];
            const oldProp = oldProps[propName];
            if (newProp !== oldProp) {
                if (propName.slice(0, 2) === "on") {
                    // prop is an event handler
                    const eventName = propName.toLowerCase().slice(2);
                    domElement.addEventListener(eventName, newProp, false);
                    if (oldProp) {
                        domElement.removeEventListener(eventName, oldProp, false);
                    }
                } else if (propName === "value" || propName === "checked") {

                    // this are special attributes that cannot be set
                    // using setAttribute
                    domElement[propName] = newProp;
                } else if (propName !== "children") {
                    // ignore the 'children' prop
                    if (propName === "className") {
                        domElement.setAttribute("class", newProps[propName]);    
                    } else {
                        domElement.setAttribute(propName, newProps[propName]);
                    }
                }
            }
        });
        // remove oldProps
        Object.keys(oldProps).forEach(propName => {
            const newProp = newProps[propName];
            const oldProp = oldProps[propName];
            if (!newProp) {
                if (propName.slice(0, 2) === "on") {
                    // prop is an event handler
                    domElement.removeEventListener(propName, oldProp, false);
                } else if (propName !== "children") {
                    // ignore the 'children' prop
                    domElement.removeAttribute(propName);
                }
            }
        });
    }

    function createTextNode(vdom, container) {
        return document.createTextNode(vdom.props.textContent);
    }

    function createDomElement(vdom) {
        return document.createElement(vdom.type);
    }

    class Component {
        constructor(props) {
            this.props = props || {};
            this.state = {};
        }

        setState(partialState) {
            this.state = Object.assign({}, this.state || {}, partialState);

            let domElement = this.getDomElement();
            let container = domElement.parentNode;
            let newVdom = this.render();
            
            newVdom.component = this.getRoot();
            diff(newVdom, container, domElement);
        }

        updateProps(props) {
            this.props = props;
        }
        getRoot() {
            return this;
        }

        setChild(component) {

        }

        setDomElement(domElement) {
            this._domElement = domElement;
        }

        getDomElement() {
            return this._domElement;
        }
    }

    return {
        createElement,
        render,
        Component
    }
}());