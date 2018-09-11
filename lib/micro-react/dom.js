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
        if(vdom.type === "text") {
            dom = createTextNode(vdom);
            container.appendChild(createTextNode(vdom));
            return dom;
        }
         else {
            dom = createDomElement(vdom);
            container.appendChild(dom);
            vdom.children.forEach(childElement => {
                return render(childElement, dom )   
            });
            return dom;
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