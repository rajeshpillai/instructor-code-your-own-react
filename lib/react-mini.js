/** @jsx createElement */
const createElement = (type, props, ...children) => {
    if (props === null) props = {};
    return {type, props, children};
};

/* render () */
const render = (vdom, parent = null) => {
    const mount = parent ? (el => parent.appendChild(el)): (el => el);
    console.log("typeof vdom: ", typeof vdom, typeof vdom.type);
    if (typeof vdom === "object" && typeof vdom.type === "string") {
        console.log("vdom.type is string: ", vdom);
        const dom = mount(document.createElement(vdom.type));
        //for (const child of [/* flatten */].concat(...vdom.children)) {
        for (const child of [...vdom.children]) {
            render(child, dom);
        }
        for(const prop in vdom.props) {
            setAttribute(dom, prop, vdom.props[prop]);
        }
        return dom;
    } else if (typeof vdom == 'string' || typeof vdom == 'number') {
        return mount(document.createTextNode(vdom));
    } else {
        throw new Error(`Invalid VDOM: ${vdom}.`);
    }
}

const setAttribute = (dom, key, value) => {
    // Handle event
    if (typeof value === 'function' && key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
    } else if (key == 'checked' || key == 'value' || key == 'className') {
        console.log(`setting ${key} with value ${value}`);
        dom[key] = value;
    } else if (key == 'style' && typeof value == 'object') {
        console.log(`setting ${dom.style} with value ${value}`);
        Object.assign(dom.style, value);
    } else if (key == 'ref' && typeof value == 'function') {
        value(dom);
    } else if (key == 'key') {
        dom.__key = value;
    } else if (typeof value != 'object' && typeof value != 'function') {
        dom.setAttribute(key, value);
    }
};
