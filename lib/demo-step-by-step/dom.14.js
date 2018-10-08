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


        if (!oldDom) {
            mountElement(vdom, container, oldDom);
        }
        else if (typeof vdom.type === "function") {
            diffComponent(vdom, null, container, oldDom);
        }
        else if (oldvdom && oldvdom.type === vdom.type) {
            if (oldvdom.type === "text") {
                updateTextNode(oldDom, vdom, oldvdom);
            } else {
                updateDomElement(oldDom, vdom, oldvdom);
            }
            // Set a reference to the newvddom in oldDom
            oldDom._virtualElement = vdom;

            // Recursively diff children
            vdom.children.forEach((child, i) => {
                diff(child, oldDom, oldDom.childNodes[i]);
            });

            let oldNodes = oldDom.childNodes;
            if (oldNodes.length > vdom.children.length) {
                for (let i = oldNodes.length - 1; i >= vdom.children.length; i -= 1) {
                    let nodeToBeRemoved = oldNodes[i];
                    unmountNode(nodeToBeRemoved, oldDom);
                }
            }
        }
    }

    function diffComponent(newVirtualElement, oldComponent, container, domElement) {
        if (!oldComponent) {
            mountElement(newVirtualElement, container, domElement);
        }
    }

    function unmountNode(domElement, parentComponent) {
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

    function buildStatefulComponent(virtualElement) {
        const component = new virtualElement.type(virtualElement.props);
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
            // TODO: stateful
            nextvDom = buildStatefulComponent(vdom);
            component = nextvDom.component;
        }

        // Recursively render child components
        if (isFunction(nextvDom)) {
            return mountComponent(nextvDom, container, oldDomElement);
        } else {
            newDomElement = mountElement(nextvDom, container, oldDomElement);
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

        // TODO: Remove old nodes
        if (oldDomElement) {
            unmountNode(oldDomElement, parentComponent);
        }

        if (nextSibling) {
            container.insertBefore(newDomElement, nextSibling);
        } else {
            container.appendChild(newDomElement);
        }

        vdom.children.forEach(child => {
            mountElement(child, newDomElement);
        });
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

    class Component {
        constructor(props) {
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
}());