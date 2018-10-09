// 1.  createElement Stub
// 2.  createElement Basic Implementation
// 3.  createElement Handle true/false short circuiting
// 4.  createElement Remove undefined nodes (because of true/false short circuiting)
// 5.  render native dom elements (only top level)
// 6.  rendering child elements
// 7.  setting DOM attributes and events
// 8.  diffing native dom elements
// 9.  deleting extra dom nodes
// 10. rendering functional components
// 11. passing props to functional component
// 12. nest functional components  (no change in code here->check demo app)
// 13. diffing functional components  (just remove extra nodes for now)
// 14. render stateful component
// 15. implement setSate method in base component (object version)
// 16. setState functional param
// 17. diffing stateful components  (ISSUE: new props coming as #text->object should be toString() in app)
// 18. Adding ref support (TODO)
// 19. Optimize Diff: Old is component and new is native
// 20. Add support for React event onDoubleClick (we support native onDblClick)
// 21. Adding support for keys

const TinyReact = (function () {
    const createElement = function (type, attributes = {}, ...children) {
        let childElements = [].concat(...children).reduce(
            (acc, child) => {
                if (child != null && child !== true && child !== false) {
                    if (child instanceof Object) {
                        acc.push(child);
                    } else {
                        acc.push(createElement("text", {
                            textContent: child
                        }));
                    }
                }
                return acc;
            }
            , []);
        return {
            type,
            children: childElements,
            props: Object.assign({ children: childElements }, attributes)
        }
    }


    const render = function (vdom, container, oldDom = container.firstChild) {
        diff(vdom, container, oldDom);
    };

    // The core diffing logic
    const diff = function (vdom, container, oldDom) {
        // Get the oldvdom
        let oldvdom = oldDom && oldDom._virtualElement;

        // todo:
        let oldComponent = oldvdom && oldvdom.component;


        if (!oldDom) {
            mountElement(vdom, container, oldDom);
        }
        else if ((vdom.type !== oldvdom.type) && (typeof vdom.type !== "function")) {
            // Replace dom, as parent types have changed.
            let newDomElement = createDomElement(vdom, oldDom);
            oldDom.parentNode.replaceChild(newDomElement, oldDom);
        }
        else if (typeof vdom.type === "function") {
            diffComponent(vdom, oldComponent, container, oldDom);
        }
        else if (oldvdom && oldvdom.type === vdom.type) {
            if (oldvdom.type === "text") {
                updateTextNode(oldDom, vdom, oldvdom);
            } else {
                updateDomElement(oldDom, vdom, oldvdom);
            }
            // Set a reference to the newvddom in oldDom
            oldDom._virtualElement = vdom;

            // KEYS SUPPORT
            let keyedElements = {};
            for (let i = 0; i < oldDom.childNodes.length; i += 1) {
                const domElement = oldDom.childNodes[i];
                const key = getKey(domElement._virtualElement);

                if (key) {
                    keyedElements[key] = { domElement, index: i }; // modified to store old index
                }
            }

            // If no keys, process diff based on index
            if (Object.keys(keyedElements).length === 0) {
                // Recursively diff children based on index
                vdom.children.forEach((child, i) => {
                    diff(child, oldDom, oldDom.childNodes[i]);
                });
            } else {
                // Process keyed elements
                vdom.children.forEach((virtualElement, i) => {
                    const key = virtualElement.props.key;
                    if (key) {
                        const keyedDomElement = keyedElements[key];
                        if (keyedDomElement) {
                            // Position new elements correctly based on
                            // new vdom index
                            if (
                                oldDom.childNodes[i] &&
                                !oldDom.childNodes[i].isSameNode(keyedDomElement.domElement)
                            ) {
                                oldDom.insertBefore(
                                    keyedDomElement.domElement,
                                    oldDom.childNodes[i]
                                );
                            }
                            diff(virtualElement, oldDom, keyedDomElement.domElement);
                        } else {
                            // Mount: new element
                            mountElement(virtualElement, oldDom);
                        }
                    }
                });
            }

            let oldNodes = oldDom.childNodes;
            if (Object.keys(keyedElements).length === 0) {
                if (oldNodes.length > vdom.children.length) {
                    for (let i = oldNodes.length - 1; i >= vdom.children.length; i -= 1) {
                        let nodeToBeRemoved = oldNodes[i];
                        unmountNode(nodeToBeRemoved, oldDom);
                    }
                }
            } else {
                // Keyed removal
                console.log("KEYED REMOVAL:");
                if (oldNodes.length > vdom.children.length) {
                    for (let i = 0; i < oldDom.childNodes.length; i += 1) {
                        let oldChild = oldDom.childNodes[i];
                        let oldKey = oldChild.getAttribute("key");
                        let found = false;

                        for (let n = 0; n < vdom.children.length; n += 1) {
                            if (vdom.children[n].props.key == oldKey) {
                                // no need to type check
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            console.log("Delete this oldKey: ", oldChild);
                            unmountNode(oldChild, oldDom);
                        }
                    }
                }
            }

        }
    }

    function getKey(vdom) {
        return vdom.props.key;
    }

    function isSameComponentType(oldComponent, newVirtualElement) {
        return oldComponent && newVirtualElement.type === oldComponent.constructor;
    }

    function diffComponent(newVirtualElement, oldComponent, container, domElement) {
        if (isSameComponentType(oldComponent, newVirtualElement)) {
            updateComponent(newVirtualElement, oldComponent, container, domElement);
        } else {
            mountElement(newVirtualElement, container, domElement);
        }
    }

    // Step 19
    function createDomElement(vdom, container, oldDomElement, parentComponent) {
        let newDomElement = null;
        if (vdom.type === "text") {
            newDomElement = document.createTextNode(vdom.props.textContent);
        } else {
            newDomElement = document.createElement(vdom.type);
            updateDomElement(newDomElement, vdom);
        }
        // Setting ref to vdom to dom
        newDomElement._virtualElement = vdom;
        vdom.children.forEach((child) => {
            newDomElement.appendChild(createDomElement(child, newDomElement));
        });

        // Set refs
        if (vdom.props && vdom.props.ref) {
            vdom.props.ref(newDomElement);
        }

        return newDomElement;
    }

    // todo: 
    function updateComponent(newVirtualElement, oldComponent, container, domElement
    ) {
        // Invoke LifeCycle
        oldComponent.componentWillReceiveProps(newVirtualElement.props);
        if (oldComponent.shouldComponentUpdate(newVirtualElement.props)) {
            const prevProps = oldComponent.props;
            // Invoke LifeCycle
            oldComponent.componentWillUpdate(
                newVirtualElement.props,
                oldComponent.state
            );

            // Update component
            oldComponent.updateProps(newVirtualElement.props);

            // Generate new vdom
            const nextElement = oldComponent.render();
            nextElement.component = oldComponent;

            // Recursively diff
            diff(nextElement, container, domElement, oldComponent);

            // Invoke LifeCycle
            oldComponent.componentDidUpdate(prevProps);
        }
    }


    // TODO: 
    function unmountNode(domElement, parentComponent) {
        const virtualElement = domElement._virtualElement;

        if (!virtualElement) {
            domElement.remove();
            return;
        }

        // TODO:
        let oldComponent = domElement._virtualElement.component;
        if (oldComponent) {
            oldComponent.componentWillUnmount();
        }

        // Loop through child node to unmount all
        while (domElement.childNodes.length > 0) {
            unmountNode(domElement.firstChild);
        }

        // Set ref to null
        if (virtualElement.props && virtualElement.props.ref) {
            virtualElement.props.ref(null);
        }

        // Clear event handlers

        // Remove event handlers if any
        Object.keys(virtualElement.props).forEach(propName => {
            if (propName.slice(0, 2) === "on") {
                const event = propName.toLowerCase().slice(2);
                const handler = virtualElement.props[propName];
                domElement.removeEventListener(event, handler);
            }
        });

        domElement.remove();

    }

    function updateTextNode(domElement, newVirtualElement, oldVirtualElement) {
        if (newVirtualElement.props.textContent !== oldVirtualElement.props.textContent) {
            domElement.textContent = newVirtualElement.props.textContent;
        }
        // Set a reference to the newvddom in oldDom
        domElement._virtualElement = newVirtualElement;
    }

    const mountElement = function (vdom, container, oldDom) {
        if (typeof vdom.type === "function") {
            return mountComponent(vdom, container, oldDom);
        } else {
            return mountSimpleNode(vdom, container, oldDom);
        }
    };

    function isFunction(obj) {
        return obj && 'function' === typeof obj.type;
    }

    function isFunctionalComponent(vnode) {
        let nodeType = vnode && vnode.type;
        return nodeType && isFunction(vnode)
            && !(nodeType.prototype && nodeType.prototype.render);
    }

    function buildFunctionalComponent(vnode, context) {
        return vnode.type(vnode.props, context || {});
    }

    function buildStatefulComponent(vnode) {
        const component = new vnode.type(vnode.props);
        //TinyReact.Component.call(component, vnode.props);

        component.componentWillMount();
        const nextElement = component.render();
        nextElement.component = component;  // SET THE COMPONENT reference
        return nextElement;
    }

    function mountComponent(vdom, container, oldDomElement) {
        let nextvDom = null, component = null, newDomElement = null;
        if (isFunctionalComponent(vdom)) {
            nextvDom = buildFunctionalComponent(vdom);
        } else {
            nextvDom = buildStatefulComponent(vdom);
            component = nextvDom.component;
        }

        // Recursively render child components
        if (isFunction(nextvDom)) {
            return mountComponent(nextvDom, container, oldDomElement);
        } else {
            newDomElement = mountElement(nextvDom, container, oldDomElement);
        }

        // TODO: Add ref support
        if (component) {
            component.componentDidMount();
            if (component.props.ref) {
                component.props.ref(component);
            }
        }

        return newDomElement;
    }


    const mountSimpleNode = function (vdom, container, oldDomElement, parentComponent) {
        let newDomElement = null;
        const nextSibling = oldDomElement && oldDomElement.nextSibling;
        if (vdom.type === "text") {
            newDomElement = document.createTextNode(vdom.props.textContent);
        } else {
            newDomElement = document.createElement(vdom.type);
            updateDomElement(newDomElement, vdom);
        }

        // Setting reference to vdom to dom
        newDomElement._virtualElement = vdom;

        if (oldDomElement) {
            unmountNode(oldDomElement, parentComponent);
        }

        if (nextSibling) {
            container.insertBefore(newDomElement, nextSibling);
        } else {
            container.appendChild(newDomElement);
        }

        let component = vdom.component;
        if (component) {
            component.setDomElement(newDomElement);
        }

        vdom.children.forEach(child => {
            mountElement(child, newDomElement);
        });

        // TODO: Add ref support
        if (vdom.props && vdom.props.ref) {
            vdom.props.ref(newDomElement);
        }
    }

    function updateDomElement(domElement, newVirtualElement, oldVirtualElement = {}) {
        const newProps = newVirtualElement.props || {};
        const oldProps = oldVirtualElement.props || {};
        Object.keys(newProps).forEach(propName => {
            const newProp = newProps[propName];
            const oldProp = oldProps[propName];
            if (newProp !== oldProp) {
                if (propName.slice(0, 2) === "on") {
                    // prop is an event handler
                    let eventName = propName.toLowerCase().slice(2);

                    //todo:
                    if (eventName === "doubleclick") {
                        eventName = "dblclick";
                    }

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

    class Component {
        constructor(props) {
            this.props = props || {};
            // todo:
            this.state = {};
            this.prevState = {};
        }

        // NOTE: We are updating state synchronously and hence call back not required
        setState(nextState, callback) {
            if (!this.prevState) this.prevState = this.state;

            // This can be made more robust
            if (typeof nextState === "function") {
                this.state = Object.assign({}, this.state, nextState(this.state, this.props));
            } else {
                this.state = Object.assign({}, this.state, nextState);
            }

            let dom = this.getDomElement();
            let container = dom.parentNode;
            let newvdom = this.render(); // Invoke render of derived component
            newvdom.component = this;

            // Recursively diff
            diff(newvdom, container, dom);
        }

        // Helper methods
        setDomElement(dom) {
            this._dom = dom;
        }

        getDomElement() {
            return this._dom;
        }

        updateProps(props) {
            this.props = props;
        }

        // Lifecycle methods
        componentWillMount() { }
        componentDidMount() { }
        componentWillReceiveProps(nextProps) { }

        shouldComponentUpdate(nextProps, nextState) {
            return nextProps != this.props || nextState != this.state;
        }

        componentWillUpdate(nextProps, nextState) { }

        componentDidUpdate(prevProps, prevState) { }

        componentWillUnmount() { }
    }

    return {
        createElement,
        render,
        Component
    }
})();