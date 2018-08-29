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
        return dom;
    } else if (typeof vdom == 'string' || typeof vdom == 'number') {
        return mount(document.createTextNode(vdom));
    } 
}

