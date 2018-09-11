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
        var dom = null;
        switch(vdom.type) {
            case "text":
                container.appendChild(createTextNode(vdom));
                break;
            default:
                dom = createDomElement(vdom);
                container.appendChild(dom);
                vdom.children.forEach(childElement => {
                    render(childElement, dom )   
                });
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