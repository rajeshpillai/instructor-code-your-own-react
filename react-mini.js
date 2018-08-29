/* Scroll down to reach playground: */
/** @jsx createElement */
const createElement = (type, props, ...children) => {
    if (props === null) props = {};
    return {type, props, children};
};

console.log(createElement);