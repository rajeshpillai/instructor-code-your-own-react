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

    const render = function (vdom, container, oldDom = container.firstChild) {
        console.log("firstChild: ", oldDom);
        var dom = null;
        if (vdom.type === "text") {
            dom = createTextNode(vdom);
            dom._virtualElement = dom;
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
            } else {  // Handle fuunction ()
                newVdom = vdom.type(vdom.props);
            }

            dom = createDomElement(newVdom);
            dom._virtualElement = newVdom;
            container.appendChild(dom);
            
            newVdom.children.forEach(childElement => {
                return render(childElement, dom)
            });

            return dom;
        }
        else {
            dom = createDomElement(vdom);
            dom._virtualElement = dom;
            
            container.appendChild(dom);
            
            vdom.children.forEach(childElement => {
                return render(childElement, dom)
            });
            _updateProps(dom, vdom);
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
        }
    }

    return {
        createElement,
        render,
        Component
    }
}());