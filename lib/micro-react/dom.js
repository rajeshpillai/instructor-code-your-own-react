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
        
    }

    class Component {

    }

    return {
        createElement,
        render,
        Component
    }
}());