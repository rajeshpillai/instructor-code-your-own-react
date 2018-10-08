// 1. createElement Stub
// 2. createElement Basic Implementation
// 3. createElement Handle true/false short circuiting
// 4. createElement Remove undefined nodes (because of true/false short circuiting)
// 5. render native dom elements (only top level)


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
        if (!oldDom) {
            mountElement(vdom, container, oldDom);
        }
    };

    const mountElement = function (vdom, container, oldDom) {
        if (typeof vdom.type === "function") {
        } else {
            return mountSimpleNode(vdom, container, oldDom);
        }
    };

    const mountSimpleNode = function (vdom, container, oldDomElement, parentComponent) {
        let newDomElement = null;
        const nextSibling = oldDomElement && oldDomElement.nextSibling;
        if (vdom.type === "text") {
            newDomElement = document.createTextNode(vdom.props.textContent);
        } else {
            newDomElement = document.createElement(vdom.type);
        }

        // Setting reference to vdom to dom
        newDomElement._virtualElement = vdom;

        if (nextSibling) {
            container.insertBefore(newDomElement, nextSibling);
        } else {
            container.appendChild(newDomElement);
        }
    }


    return {
        createElement,
        render
    }
}());