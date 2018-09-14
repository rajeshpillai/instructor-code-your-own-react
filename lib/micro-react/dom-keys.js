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

    const changed = function (oldVdom, newVdom) {
        return ((typeof oldVdom !== typeof newVdom ||
                oldVdom.type !== newVdom.type) && newVdom.type !== 'function') ;
    }

    const diff = function (vdom, container, oldDom) {
        let oldVDom = oldDom && oldDom._virtualElement;
        if (!oldVDom) {
            // Create new dom element 
            mountElement(vdom, container, oldDom);
        } else if (!vdom) {
            container.removeChild(oldDom);
        } else if (changed(oldVDom, vdom)) {
            // Replace child -> Same no of elements but element changed 
            let nd1 = mountElement(vdom, container, oldDom);
            container.replaceChild(nd1, oldDom);
        }
        // else if (vdom.type === oldVDom.type || typeof vdom.type === 'function') {
        else {   
            // Update nodes
            if (typeof vdom.type === 'function') {
                vdom = getNewVdomForComponent(vdom, oldVDom);
            }    
            else {
                // Text node or dom elements
                if (vdom.type === "text") {
                    updateTextNode(oldDom, vdom, oldVDom);
                } else {
                    updateDomElement(oldDom, vdom, oldVDom);
                }
            }

            diffList(vdom.children, oldDom);

            // TODO: Refactor: Removed extra children
            let oldDomChilds = oldDom.childNodes;
            if (oldDomChilds.length > vdom.children.length) {
                for(let i = oldDomChilds.length-1; i >= vdom.children.length; i--){
                    oldDomChilds[i].remove();
                }
            }
        } 
    }

    const getNewVdomForComponent = function (vdom, oldVDom) {
        if (TinyReact.Component.isPrototypeOf(vdom.type)) {  // Handle class/ctor
            // class
            let component = null;
            let newVdom = null;
            
            if (oldVDom && oldVDom.component) {
                component = oldVDom.component;
                component.updateProps(vdom.props);
            } else {
                component = new vdom.type(vdom.props);
            }
            newVdom = component.render();
            newVdom.component = component;
            vdom = newVdom;
            
        } else {
            // function
            vdom = vdom.type(vdom.props);    
        }
        return vdom;
    }
    
    function updateTextNode(dom, newVDom, oldVDom = {}) {
        if (newVDom.props.textContent !== oldVDom.props.textContent) {
            dom.textContent = newVDom.props.textContent;
        } 
        dom._virtualElement = newVDom;
    }

    function updateDomElement(oldDom, newVDom, oldVDom = {}) {
        _updateProps(oldDom, newVDom, oldVDom);
        oldDom._virtualElement.props = newVDom.props;
    }

    const render = function (vdom, container, oldDom = container.firstChild) {
        diff(vdom, container, oldDom);
    }

    
    function mountComponent(vdom, container, oldDom) {
        let dom = null;
        let newVdom = null;
        let component = null;
        let oldVDom = oldDom && oldDom._virtualElement && oldDom._virtualElement;
        newVdom = getNewVdomForComponent(vdom, oldVDom);
        component = newVdom.component;

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

    function mountSimpleNode(vdom, container, oldDom) {
        var dom = null;
        if (vdom.type === "text") {
            dom = createTextNode(vdom);
            dom._virtualElement = vdom;
            container.appendChild(dom);
            return dom;
        } else {
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
    const mountElement = function (vdom, container, oldDom) {
        if (typeof vdom.type === 'function') {
            return mountComponent(vdom, container,oldDom);
        } else {
            return mountSimpleNode(vdom, container, oldDom);
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

    const getKey = (virtualElement) => {
        if (!virtualElement) { return undefined; }

        const component = virtualElement.component;

        return component ? component.props.key : virtualElement.props.key;
    }

    const diffList = (virtualElements, parentDomElement) => {
        const keyedElements = {};
        const unkeyedElements = [];
        
        for (let i = 0; i < parentDomElement.childNodes.length; i += 1) {
            const domElement = parentDomElement.childNodes[i];
            const key = getKey(domElement._virtualElement);

            if (key) {
                keyedElements[key] = domElement;
            } else {
                unkeyedElements.push(domElement);
            }
        }

        let unkeyedIndex = 0;
        virtualElements.forEach((virtualElement, i) => {
            const key = virtualElement.props.key;
            if (key) {
                const keyedDomElement = keyedElements[key];
                if (keyedDomElement) {
                    // move to correct location
                    if (
                        parentDomElement.childNodes[i] &&
                        !parentDomElement.childNodes[i].isSameNode(keyedDomElement)
                    ) {
                        // if (parentDomElement.childNodes[i]) {

                        parentDomElement.insertBefore(
                            keyedDomElement,
                            parentDomElement.childNodes[i]
                        );

                        // } else {
                        //     //parentDomElement.append(keyedDomElement);
                        // }
                    }

                    diff(virtualElement, parentDomElement, keyedDomElement);
                } else {
                    // If same node keydom == child
                    //let placeholder = null;  //document.createElement('span');
                    if (parentDomElement.childNodes[i]) {
                        //parentDomElement.insertBefore(placeholder, parentDomElement.childNodes[i]);
                        mountElement(virtualElement, parentDomElement, parentDomElement.childNodes[i]);
                    } else {
                        // const placeholder = document.createElement('span');
                        // parentDomElement.append(placeholder);
                        mountElement(virtualElement, parentDomElement, null);
                        //placeholder.remove();
                    }
                    
                }
            } else {
                const unkeyedDomElement = unkeyedElements[unkeyedIndex];
                if (unkeyedElements) {
                    if (
                        parentDomElement.childNodes[i] &&
                        !parentDomElement.childNodes[i].isSameNode(unkeyedDomElement)
                    ) {
                        if (parentDomElement.childNodes[i]) {
                            parentDomElement.insertBefore(
                                unkeyedDomElement,
                                parentDomElement.childNodes[i]
                            );
                        } else {
                            parentDomElement.append(unkeyedDomElement);
                        }
                    }

                    diff(virtualElement, parentDomElement, unkeyedDomElement);
                } else {
                    const placeholder = document.createElement('span');
                    if (parentDomElement.childNodes[i]) {
                        parentDomElement.insertBefore(placeholder, parentDomElement.childNodes[i]);
                    } else {
                        parentDomElement.append(placeholder);
                    }
                    mountElement(virtualElement, parentDomElement, placeholder);
                    placeholder.remove();
                }
                unkeyedIndex += 1;
            }
        });
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
            
            newVdom.component = this;
            diff(newVdom, container, domElement);
        }

        updateProps(props) {
            this.props = props;
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