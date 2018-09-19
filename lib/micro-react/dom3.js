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
    const diff = function (newvDom, container, oldDom) {
        let oldvDom = oldDom && oldDom._virtualElement;
        let oldComponent = oldvDom && oldvDom.component;

        if (typeof newvDom.type === "function") {
            console.log("Handle Components");
            diffComponent(newvDom, oldComponent,container);
        } else if (!oldDom) {
            mountElement(newvDom, container, oldDom);
        } 
        else  if (isSameElementType(newvDom, oldvDom)) {
            diffDomElement(newvDom, oldDom, container);
            //Recursively diff children
            oldDom._virtualElement = newvDom;
            newvDom.children.forEach((child,i) => {
                diff(child, oldDom, oldDom.childNodes[i]);
            });
        } 
    }

    function diffDomElement(vdom, oldDom, container) {
        let oldvDom = oldDom && oldDom._virtualElement;
        if (isSameElementType(vdom, oldvDom)) {
            if (oldvDom.type === 'text'){
                updateTextNode(oldDom, vdom, oldvDom);
            } else{
                updateDomElement(oldDom,vdom,oldvDom);
            }
        } else {
            mountElement(vdom,container, oldDom);
        }
    }
''
    function isSameElementType(newvDom, oldvDom) {
        return newvDom.type === oldvDom.type;
    }

    function isSameComponentType(oldComponent, newVirtualElement) {
        return(
            oldComponent &&
            newVirtualElement.type === oldComponent.constructor
        );
    }

    function diffComponent (newVirtualElement, oldComponent, container, domElement) {
        if (isSameComponentType(oldComponent, newVirtualElement)){
            console.log("Component Type is same: ");
        } else { // New component
            console.log("Component type is different");
            mountElement(newVirtualElement, container, domElement);
        }
    }
    
    // Handle Components
    const mountElement = function (vdom, container, oldDom) {
      console.log("mountElement enter => ");
      if (typeof vdom.type === 'function') {
        console.log("====type is function ==> ");
        return mountComponent(vdom, container,oldDom);
      } else {
        console.log("====type is not function ==> ");
        return mountSimpleNode(vdom, container, oldDom);
      }
    }

    function mountComponent (vdom, container, oldDomElement) {
        let nextvDom = null;    
        let component = null;
        if (TinyReact.Component.isPrototypeOf(vdom.type)){
            nextvDom = renderStateful(vdom);
            component = nextvDom.component;
        } else {
            nextvDom = renderFunctional(vdom);
        }

        // Recursively render child components
        if (typeof nextvDom.type === "function") {
            mountComponent(nextvDom, container, oldDomElement);
        } else {
            mountElement(nextvDom, container, oldDomElement);
        }

        if (component) {
            component.componentDidMount();
            if (component.props.ref) {
                component.props.ref(component);
            }
        }



    }

    function renderFunctional(virtualElement) {
        const nextElement = virtualElement.type(virtualElement.props);    
        return nextElement;
    }

    function renderStateful(virtualElement) {
        const component = new virtualElement.type(virtualElement.props);
        //component.setStateCallback(Reconciler.handleComponentStateChange);
        // Invoke LifeCycle
        component.componentWillMount();
        const nextElement = component.render();
        nextElement.component = component;
        return nextElement;
    }

    function mountSimpleNode(vdom, container, oldDomElement, parentComponent){
        console.log("mountSimpleNode enter => ");
        let newDomElement;
        const nextSibling = oldDomElement && oldDomElement.nextSibling;

        if (vdom.type === "text") {
            newDomElement = document.createTextNode(vdom.props.textContent);
        } else {
            newDomElement = document.createElement(vdom.type);
            // Set domnode attributes
            updateDomElement(newDomElement, vdom);
        }

        newDomElement._virtualElement = vdom;

        // Add the newly created node to the DOM
        if (nextSibling) {
            container.insertBefore(newDomElement, nextSibling);
        } else {
            container.appendChild(newDomElement);
        }

        // Add reference to dom element into component
        let component = vdom.component;
        if (component) {
            component.setDomElement(newDomElement);
        }

        // Recursively call mountElement with all child vdoms
        vdom.children.forEach((childElement) => {
            mountElement(childElement, newDomElement);
        });

        // Set refs
        if (vdom.props && vdom.props.ref) {
            vdom.props.ref(newDomElement);
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
  
  