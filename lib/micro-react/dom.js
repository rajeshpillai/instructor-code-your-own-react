var TinyReact = (function () {
    const createElement = function (type, attributes = {}, ...children) {
        const childElements = [].concat(children)
            .map(child => child instanceof Object 
                    ? child
                    : createElement("text", {textContent: child}));
        return {
            type,
            children: childElements,
            props: Object.assign({children: childElements}, attributes)
        };
    }

    const render = function (vdom, container) {
        switch(vdom.type) {
            case "text":
                container.appendChild(createTextNode(vdom));
                break;
            default:
                container.appendChild(createDomElement(vdom));
                break;
        }
    }

    function createTextNode(vdom, container) {
        return document.createTextNode(vdom.props.textContent);
    }

    function createDomElement(vdom) {
        return document.createElement(vdom.type);
    }

    class Component {

    }

    return {
        createElement,
        render,
        Component
    }
}());