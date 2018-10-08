// 1. createElement Stub
// 2. createElement Basic Implementation
// 3. createElement Handle true/false short circuiting
// 4. createElement Remove undefined nodes (because of true/false short circuiting)

const TinyReact = (function () {
    function createElement(type, attributes = {}, ...children) {
        let childElements = [].concat(...children).reduce(
            (acc,child) => {
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

    function createElementxx(type, attributes = {}, ...children) {
        let childElements = [].concat(...children).filter(
            (child) => {
                if (child != null && child !== true && child !== false) {
                    if (child instanceof Object) {
                        return child;
                    }
                    else if (typeof child == "number") {
                        child = String(child);
                    }
                    return createElement("text", {
                        textContent: child
                    });
                }
            }
        );

        return {
            type,
            children: childElements.filter((c)=>c!==undefined),
            props: Object.assign({ children: childElements.filter((c)=>c!==undefined) }, attributes)
        }
    }

    function createElementx(type, attributes = {}, ...children) {
        const childElements = [].concat(...children).map(
            child =>
                child instanceof Object
                    ? child
                    : createElement("text", {
                        textContent: child
                    })
        );
        return {
            type,
            children: childElements,
            props: Object.assign({children: childElements}, attributes)
        }
    }

    return {
        createElement
    }
}());