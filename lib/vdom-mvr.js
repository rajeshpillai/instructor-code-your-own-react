var TinyReact = (function() {
  function createElement(type, attributes = {}, ...children) {
    const childElements = []
      .concat(...children)
      .map(
        child =>
          child instanceof Object
            ? child
            : createElement("text", { textContent: child })
      );
    return {
      type,
      children: childElements,
      props: Object.assign({ children: childElements }, attributes)
    };
  }

  const Reconciler = {
    diff: (virtualElement, container, oldDomElement, parentComponent) => {
      const oldVirtualElement = oldDomElement && oldDomElement._virtualElement;
      const oldComponent = oldVirtualElement && oldVirtualElement.component;

      if (typeof virtualElement.type === "function") {
        Reconciler.diffComponent(
          virtualElement,
          oldComponent,
          container,
          oldDomElement,
          parentComponent
        );
      } else if (
        oldVirtualElement &&
        oldVirtualElement.type === virtualElement.type
      ) {
        if (oldVirtualElement.type === "text") {
          Reconciler.updateTextNode(
            oldDomElement,
            virtualElement,
            oldVirtualElement
          );
        } else {
          Reconciler.updateDomElement(
            oldDomElement,
            virtualElement,
            oldVirtualElement
          );
        }
        // save the virtualElement on the domElement
        // so that we can retrieve it next time
        oldDomElement._virtualElement = virtualElement;
        virtualElement.children.forEach((childElement, i) => {
          Reconciler.diff(
            childElement,
            oldDomElement,
            oldDomElement.childNodes[i]
          );
        });
        // remove extra children
        const oldChildren = oldDomElement.childNodes;
        if (oldChildren.length > virtualElement.children.length) {
          for (
            let i = oldChildren.length - 1;
            i >= virtualElement.children.length;
            i -= 1
          ) {
            oldChildren[i].remove();
          }
        }
      } else {
        Reconciler.mountElement(virtualElement, container, oldDomElement);
      }
    },
    mountSimpleNode: (virtualElement, container, oldDomElement) => {
      let newDomElement;
      const nextSibling = oldDomElement && oldDomElement.nextSibling;
      if (virtualElement.type === "text") {
        newDomElement = document.createTextNode(
          virtualElement.props.textContent
        );
      } else {
        newDomElement = document.createElement(virtualElement.type);
        // set dom-node attributes
        Reconciler.updateDomElement(newDomElement, virtualElement);
      }
      // save the element on the domElement
      // so that we can retrieve it next time
      newDomElement._virtualElement = virtualElement;
      // remove the old node from the dom if one exists
      if (oldDomElement) {
        oldDomElement.remove();
      }
      // add the newly created node to the dom
      if (nextSibling) {
        container.insertBefore(newDomElement, nextSibling);
      } else {
        container.appendChild(newDomElement);
      }
      // add reference to domElement into component
      let component = virtualElement.component;
      while (component) {
        component.setDomElement(newDomElement);
        component = component.getChild();
      }

      //   console.log("virtualElement", virtualElement);
      //   console.log("virtualElement.children", virtualElement.children);

      // recursively call mountElement with all child elements
      virtualElement.children.forEach(childElement => {
        Reconciler.mountElement(childElement, newDomElement);
      });
    },
    mountElement: (element, container, oldDomNode, parentComponent) => {
      if (typeof element.type === "function") {
        Reconciler.mountComponent(
          element,
          container,
          oldDomNode,
          parentComponent
        );
      } else {
        Reconciler.mountSimpleNode(element, container, oldDomNode);
      }
    },
    mountComponent: (
      virtualElement,
      container,
      oldDomElement,
      parentComponent
    ) => {
      let component = null;
      let newVdom = null;
      if (TinyReact.Component.isPrototypeOf(virtualElement.type)) {
        //Stateful component
        component = new virtualElement.type(virtualElement.props);
        newVdom = component.render();
      } else {
        //functional component
        newVdom = virtualElement.type(virtualElement.props);
      }

      //   if (parentComponent) {
      //     const root = parentComponent.getRoot();
      //     newVdom.component = root;
      //     parentComponent.setChild(component);
      //   } else {
      newVdom.component = component;
      // }

      //Reconciler.diff(nextElement, container, oldDomElement);
      if (typeof newVdom.type === "function") {
        Reconciler.mountComponent(newVdom, container, oldDomElement, component);
      } else {
        Reconciler.mountElement(
          newVdom,
          container,
          oldDomElement,
          parentComponent
        );
      }
    },
    diffComponent: (
      newVirtualElement,
      oldComponent,
      container,
      domNode,
      parentComponent
    ) => {
      if (
        // are these the same constructor
        oldComponent &&
        newVirtualElement.type === oldComponent.constructor
      ) {
        // update component
        oldComponent.updateProps(newVirtualElement.props);
        const nextElement = oldComponent.render();
        nextElement.component = parentComponent || oldComponent;
        const childComponent = oldComponent.getChild();

        if (childComponent) {
          Reconciler.diffComponent(
            nextElement,
            childComponent,
            container,
            domNode,
            oldComponent
          );
        } else {
          Reconciler.diff(nextElement, container, domNode, oldComponent);
        }
      } else {
        let component = oldComponent;
        while (component) {
          component.setDomElement(null);
          component = component.getChild();
        }

        Reconciler.mountElement(
          newVirtualElement,
          container,
          domNode,
          parentComponent
        );
      }
    },
    updateTextNode: (domElement, newVirtualElement, oldVirtualElement) => {
      if (
        newVirtualElement.props.textContent !==
        oldVirtualElement.props.textContent
      ) {
        domElement.textContent = newVirtualElement.props.textContent;
      }
      // save a reference to the virtual element into the domElement
      // so that we can retrieve it the next time
      domElement._virtualElement = newVirtualElement;
    },

    updateDomElement: (
      domElement,
      newVirtualElement,
      oldVirtualElement = {}
    ) => {
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
            domElement.setAttribute(propName, newProps[propName]);
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
  };

  function render(vdom, container) {
    Reconciler.diff(vdom, container, container.firstChild);
  }

  class Component {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
    updateProps(newProps) {
      this.props = newProps;
    }
    getDomElement() {
      return this._domElement;
    }

    setDomElement(domElement) {
      this._domElement = domElement;
    }

    setChild(component) {
      this._child = component;
      component._parentComponent = this;
    }

    getChild() {
      return this._child;
    }

    getRoot() {
      let component = this;
      let res;
      while (component) {
        res = component;
        component = component._parentComponent;
      }
      return res;
    }

    setState(partialState) {
      this.state = Object.assign({}, this.state || {}, partialState);
      //this.render();
      //TinyReact.render(this.render(), document.getElementById("root"));

      const newVdom = this.render();
      newVdom.component = this.getRoot();

      // start the normal diffing process here
      const domElement = this.getDomElement();
      const container = domElement.parentNode;
      const childComponent = this.getChild();
      if (childComponent) {
        Reconciler.diffComponent(
          newVdom,
          childComponent,
          container,
          domElement,
          component
        );
      } else {
        Reconciler.diff(newVdom, container, domElement, this);
      }
    }

    render() {}
  }

  return {
    createElement,
    render,
    Component
  };
})();
