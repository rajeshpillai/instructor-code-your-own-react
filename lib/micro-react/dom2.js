/** @jsx TinyReact.createElement */

var TinyReact = (function () { 
    const createElement = function (type, attributes = {}, 
                                     ...children) {
      const childElements = [].concat(...children)
      .map(child => child instanceof Object
           ? child
           : createElement("text", { 
        textContent: child }));
      return {
        type,
        children: childElements,
        props: Object.assign({ children: childElements }
                             , attributes)
      };
    };
    const render = function (vdom, container, oldDom = container.firstChild) {
      diff(vdom, container, oldDom);
    }
    
    //  The core diffing logic
    const diff = function (vdom, container, oldDom, parentComponent) {
        let oldVirtualDom = oldDom && oldDom._virtualElement;
        let oldComponent = oldVirtualDom && oldVirtualDom.component;

        if (typeof vdom.type === 'function') {
            diffComponent(vdom, oldComponent, container, oldDom, parentComponent);
        } else if (oldVirtualDom && oldVirtualDom.type === vdom.type &&
            oldComponent === vdom.component) {
                if (oldVirtualDom.type === 'text') {
                    updateTextNode(oldDom, vdom, oldVirtualDom);
                } else {
                    updateDomElement(oldDom, vdom, oldVirtualDom);
                }

                // Save the virtual dom on the dom element
                oldDom._virtualElement = vdom;
                vdom.children.forEach((childElement, i) => {
                    diff(childElement, oldDom, oldDom.childNodes[i]);
                });
                // remove extra children
                const oldChildren = oldDom.childNodes;
                if (oldChildren.length > vdom.children.length) {
                    for (let i = oldChildren.length - 1; i >= vdom.children.length; i -= 1) {
                        oldChildren[i].remove();
                    }
                }
        } else {
            mountElement(vdom, container, oldDom);
        }
    }

    function diffComponent (newVirtualElement, oldComponent, container, domElement, parentComponent) {
        if (
            oldComponent &&
            newVirtualElement.type === oldComponent.constructor
        ) {
            oldComponent.componentWillReceiveProps(newVirtualElement.props);

            if (oldComponent.shouldComponentUpdate(newVirtualElement.props)) {
                const prevProps = oldComponent.props;
                oldComponent.componentWillUpdate(newVirtualElement.props, oldComponent.state);

                // update component
                oldComponent.updateProps(newVirtualElement.props);
                const nextElement = oldComponent.render();
                nextElement.component = parentComponent || oldComponent;

                const childComponent = oldComponent.getChild();

                if (childComponent) {
                    diffComponent(
                        nextElement,
                        childComponent,
                        container,
                        domElement,
                        oldComponent
                    );
                } else {
                    diff(nextElement, container, domElement, oldComponent);
                }

                oldComponent.componentDidUpdate(prevProps);
            }
        } else {
            let component = oldComponent;
            while (component) {
                component.componentWillUnmount();
                component._didUnmount = true;
                component.setDomElement(null);
                component = component.getChild();
            }

            mountElement(newVirtualElement, container, domElement, parentComponent);
        }
    }
    
    // Handle Components
    const mountElement = function (vdom, container, oldDom) {
      if (typeof vdom.type === 'function') {
        return mountComponent(vdom, container,oldDom);
      } else {
        return mountSimpleNode(vdom, container, oldDom);
      }
    }

    function mountComponent (virtualElement, container, oldDomElement, parentComponent) {
        const component = new virtualElement.type(virtualElement.props);
        //component.setStateCallback(Reconciler.handleComponentStateChange);

        const nextElement = component.render();

        if (parentComponent) {
            const root = parentComponent.getRoot();
            nextElement.component = root;
            parentComponent.setChild(component);
        } else {
            nextElement.component = component;
        }

        component.componentWillMount();

        if (typeof nextElement.type === 'function') {
            mountComponent(nextElement, container, oldDomElement, component);
        } else {
            mountElement(nextElement, container, oldDomElement, parentComponent);
        }

        component.componentDidMount();

        if (component.props.ref) {
            component.props.ref(component);
        }
    }

    function mountSimpleNode(virtualElement, container, oldDomElement, parentComponent){
        let newDomElement;
        const nextSibling = oldDomElement && oldDomElement.nextSibling;

        if (virtualElement.type === 'text') {
            newDomElement = document.createTextNode(virtualElement.props.textContent);
        } else {
            newDomElement = document.createElement(virtualElement.type);
            // set dom-node attributes
            updateDomElement(newDomElement, virtualElement);
        }

        // save the virtualElement on the domElement
        // so that we can retrieve it next time
        newDomElement._virtualElement = virtualElement;

        // remove the old node from the dom if one exists
        if (oldDomElement) {
            unmountNode(oldDomElement, parentComponent);
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

        // recursively call mountElement with all child virtualElements
        virtualElement.children.forEach((childElement) => {
            mountElement(childElement, newDomElement);
        });

        if (virtualElement.props.ref) {
            virtualElement.props.ref(newDomElement);
        }
    }

    /*
      Helper methods
    */
    function updateTextNode(domElement, newVirtualElement, oldVirtualElement) {
        if (newVirtualElement.props.textContent !== oldVirtualElement.props.textContent) {
            domElement.textContent = newVirtualElement.props.textContent;
        }
        // save the virtualElement on the domElement
        // so that we can retrieve it next time
        domElement._virtualElement = newVirtualElement;
    }

    function updateDomElement(domElement, newVirtualElement, oldVirtualElement={}) {
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

    function unmountNode (domElement, parentComponent){
        const virtualElement = domElement._virtualElement;
        if (!virtualElement) {
            domElement.remove();
            return;
        }

        if (!parentComponent) {
            let component = virtualElement.component;
            while (component && !component._didUnmount) {
                component.componentWillUnmount();
                component.setDomElement(undefined);
                component = component.getChild();
            }
        }

        while (domElement.childNodes.length > 0) {
            unmountNode(domElement.firstChild);
        }

        if (virtualElement.props.ref) {
            virtualElement.props.ref(null);
        }

        Object.keys(virtualElement.props).forEach((propName) => {
            if (propName.slice(0, 2) === 'on') {
                const event = propName.toLowerCase().slice(2);
                const handler = virtualElement.props[propName];
                domElement.removeEventListener(event, handler);
            }
        });

        domElement.remove();
    }
      
    class Component {
      constructor(props) {
        this.props = props;
        this.state = {};
      }
      
      setState(partialState) {
        this.state = Object.assign({},this.state || {}, partialState);
        let dom = this.getDomElement();
        let container = dom.parentNode;
        let newVDom = this.render();  // This will invoke the derived class render menthod
        newVDom.component = this;
        diff (newVDom, container, dom);
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

      setChild(component) {
        this._child = component;
        component._parentComponent = this;
     }
      getChild() {
        return this._child;
     }

      // Virtual lifecycle events

      componentWillMount(){}
      componentDidMount() {}
      componentWillReceiveProps(nextProps) { }
      
      shouldComponentUpdate(nextProps, nextState) {
          return nextProps != this.props || nextState != this.state;
      }

      componentWillUpdate(nextProps, nextState){ }

      componentDidUpdate(prevProps, prevState){}
    
      componentWillUnmount() {}

    }
   return {
     createElement,
     render,
     Component
   }
  }());
  
  