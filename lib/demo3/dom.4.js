/** @jsx TinyReact.createElement */

// 1. createElement
// 2. render native elements
// 3. diffing native elements
// 4. deleting extra nodes

var TinyReact = (function() {
  const createElement = function(type, attributes = {}, ...children) {
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
      props: Object.assign({ children: childElements }, attributes)
    };
  };

  const render = function(vdom, container, oldDom = container.firstChild) {
    diff(vdom, container, oldDom);
  };

  //  The core diffing logic
  const diff = function(vdom, container, oldDom) {
    // Grab the old dom/com references
    let oldvdom = oldDom && oldDom._virtualElement;

    //todo: component

    if (!oldDom) {
      mountElement(vdom, container, oldDom);
    } else if (typeof vdom.type === "function") {
    } else if (oldvdom && oldvdom.type === vdom.type) {
      if (oldvdom.type === "text") {
        updateTextNode(oldDom, vdom, oldvdom);
      } else {
        updateDomElement(oldDom, vdom, oldvdom);
      }
      oldDom._virtualElement = vdom;

      // Recursively diff children
      vdom.children.forEach((child, i) => {
        diff(child, oldDom, oldDom.childNodes[i]);
      });

      // Remove old dom nodes
      let oldNodes = oldDom.childNodes;
      if (oldNodes.length > vdom.children.length) {
        for (let i = oldNodes.length - 1; i >= vdom.children.length; i -= 1) {
          //oldNodes[i].remove();
          let nodeToBeRemoved = oldNodes[i];
          unmountNode(nodeToBeRemoved, oldDom);
        }
      }
    }
  };

  const mountElement = function(vdom, container, oldDom) {
    if (typeof vdom.type === "function") {
    } else {
      return mountSimpleNode(vdom, container, oldDom);
    }
  };

  function mountSimpleNode(vdom, container, oldDomElement, parentComponent) {
    let newDomElement = null;
    const nextSibling = oldDomElement && oldDomElement.nextSibling;
    if (vdom.type === "text") {
      newDomElement = document.createTextNode(vdom.props.textContent);
    } else {
      newDomElement = document.createElement(vdom.type);
      updateDomElement(newDomElement, vdom);
    }

    // Setting reference to vdom to dom
    newDomElement._virtualElement = vdom;
    if (nextSibling) {
      container.insertBefore(newDomElement, nextSibling);
    } else {
      container.appendChild(newDomElement);
    }

    // Render children
    vdom.children.forEach(child => {
      mountElement(child, newDomElement);
    });
  }

  function getKey(vdom) {
    return vdom.props.key;
  }

  function diffDomElement(vdom, oldDom, container) {}

  function isSameElementType(newvDom, oldvDom) {
    return oldvDom && newvDom.type === oldvDom.type;
  }

  function isSameComponentType(oldComponent, newVirtualElement) {
    return oldComponent && newVirtualElement.type === oldComponent.constructor;
  }

  function diffComponent(
    newVirtualElement,
    oldComponent,
    container,
    domElement
  ) {}

  function handleComponent(
    newVirtualElement,
    oldComponent,
    container,
    domElement
  ) {}

  function mountComponent(vdom, container, oldDomElement) {}

  function renderFunctional(virtualElement) {}

  function renderStateful(virtualElement) {}

  function updateTextNode(domElement, newVirtualElement, oldVirtualElement) {
    if (
      newVirtualElement.props.textContent !==
      oldVirtualElement.props.textContent
    ) {
      domElement.textContent = newVirtualElement.props.textContent;
    }
    // save the virtualElement on the domElement
    // so that we can retrieve it next time
    domElement._virtualElement = newVirtualElement;
  }

  function updateDomElement(
    domElement,
    newVirtualElement,
    oldVirtualElement = {}
  ) {
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

  function unmountNode(domElement, parentComponent) {
    domElement.remove();
  }

  class Component {
    constructor(props) {}

    _extend(obj, props) {
      for (let i in props) obj[i] = props[i];
      return obj;
    }

    updateProps(props) {
      this.props = props;
    }

    setDomElement(dom) {
      this._domElement = dom;
    }

    getDomElement() {
      return this._domElement;
    }

    // Virtual lifecycle events

    componentWillMount() {}
    componentDidMount() {}
    componentWillReceiveProps(nextProps) {}

    shouldComponentUpdate(nextProps, nextState) {
      return nextProps != this.props || nextState != this.state;
    }

    componentWillUpdate(nextProps, nextState) {}

    componentDidUpdate(prevProps, prevState) {}

    componentWillUnmount() {}
  }
  return {
    createElement,
    render,
    Component
  };
})();
