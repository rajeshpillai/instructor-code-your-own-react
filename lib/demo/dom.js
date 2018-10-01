/** @jsx TinyReact.createElement */

// TODO:  Adding keys

var TinyReact = (function () { 
  const createElement = function (type, attributes = {}, 
                                   ...children) {
    const childElements = [].concat(...children)
     .map(child => child instanceof Object
         ? child
         : createElement("text", { 
                  textContent: child
              }));
      
      return {
        
      type,
      children: childElements,
      props: Object.assign({ children: childElements }
                           , attributes)
    };
};


  const render = function (vdom, container, oldDom = container.firstChild) {
      // Step 3
      diff(vdom, container, oldDom);
  }

  const mountElement = function (vdom, container, oldDom) {
    if (typeof vdom.type === 'function') {
      return mountComponent(vdom, container,oldDom);
    } else {
      return mountSimpleNode(vdom, container, oldDom);
    }
  }

  function createDomElement(vdom, container, oldDomElement, parentComponent) {
    let newDomElement = null;
    if (typeof vdom.type === "function") {
      if (TinyReact.Component.isPrototypeOf(vdom.type)) {
        let klass = null;
        if (vdom.component) {
          klass = vdom.component;
        } else {
          klass = new vdom.type(vdom.props);
          if (klass.props.ref) {
            klass.props.ref(klass);
          }
        }

        let compvDom = klass.render();
        compvDom.component = klass;
        return mountElement(compvDom, container, oldDomElement);
      } else {
        newDomElement = mountElement(vdom, container, oldDomElement);
      }
    } else if (vdom.type === "text") {
      newDomElement = document.createTextNode(vdom.props.textContent);
    } else {
      newDomElement = document.createElement(vdom.type);
      updateDomElement(newDomElement, vdom);
    }      
    // Setting ref to vdom to dom
    newDomElement._virtualElement = vdom;
    vdom.children.forEach((child) => {
      newDomElement.appendChild(createDomElement(child, newDomElement));
    });

    // Set refs
    if (vdom.props && vdom.props.ref) {
      vdom.props.ref(newDomElement);
    } 
    
    return newDomElement;
  }
   

  function mountSimpleNode(vdom, container, oldDomElement, parentComponent) {
    let newDomElement = createDomElement(vdom, container, oldDomElement);
    
    // Setting ref to vdom to dom
    newDomElement._virtualElement = vdom;
    container.appendChild(newDomElement);

    let component = vdom.component;

    if (component) {
        component.setDomElement(newDomElement);
    }

    
    return newDomElement;
  }
    
  //  The core diffing logic
  const diff = function (newvDom, container, oldDom) {
    let oldvDom = oldDom && oldDom._virtualElement;
    
    if (!oldDom) {
      mountElement(newvDom, container, oldDom);
    } else if (newvDom.type !== oldvDom.type && (typeof newvDom.type !== "function"))  {
      // Replace
      let newDomElement = createDomElement(newvDom, oldDom);
      oldDom.parentNode.replaceChild(newDomElement, oldDom);

    } else {  // if type is same
      if (typeof newvDom.type === "function") {
        if (TinyReact.Component.isPrototypeOf(newvDom.type)) {
          let klass = null;
          if (newvDom.component) {
            klass = newvDom.component;
          } else {
            klass = new newvDom.type(newvDom.props);
            if (klass.props.ref) {
              klass.props.ref(klass);
            }
          }
          newvDom = klass.render();
          newvDom.component = klass;
        } else {
          newvDom = newvDom.type(newvDom.props);
        }
        diff(newvDom, container, oldDom);
      } else if (newvDom.type === "text") {
        updateTextNode(oldDom, newvDom, oldvDom);
      } else {
        updateDomElement(oldDom, newvDom, oldvDom);
      }

      let keyedElements = {};
      for (let i = 0; i < oldDom.childNodes.length; i += 1) {
        const domElement = oldDom.childNodes[i];
        const key = getKey(domElement._virtualElement);

        if (key) {
            keyedElements[key] = {domElement, index: i};   // store old index as well
        } 
      }

      // If no keys, process diff based on index
      if (Object.keys(keyedElements).length === 0) {
        newvDom.children.forEach((child,i) => {
            diff(child, oldDom, oldDom.childNodes[i]);
        });
      } else {
        // Process keyed elements
        newvDom.children.forEach((virtualElement, i) => {
            const key = virtualElement.props.key;
            if (key) {
                const keyedDomElement = keyedElements[key];
                if (keyedDomElement) {
                    // Position new elements correctly based on
                    // new vdom index 
                    if (
                        oldDom.childNodes[i] &&
                        !oldDom.childNodes[i].isSameNode(keyedDomElement.domElement)
                    ) {
                        oldDom.insertBefore(
                            keyedDomElement.domElement,
                            oldDom.childNodes[i]
                        );
                    }
                    diff(virtualElement, oldDom, keyedDomElement.domElement);
                }
                else {
                    // Mount: new element
                    mountElement(virtualElement, oldDom);
                }
            }
        });
    }


      // Deleted extra node
      const oldNodes = oldDom.childNodes;
      if (oldNodes.length > newvDom.children.length) {
        for(let i = oldNodes.length -1; i >= newvDom.children.length; i -= 1){
              // Remove event handlers if any
          let nodeToBeRemoved = oldNodes[i];
            Object.keys(oldDom._virtualElement.props).forEach((propName) => {
                  if (propName.slice(0, 2) === 'on') {
                      const event = propName.toLowerCase().slice(2);
                      const handler = oldDom._virtualElement.props[propName];
                      nodeToBeRemoved.removeEventListener(event, handler);
                  }
          });
          let oldComponent  = nodeToBeRemoved._virtualElement.component;
          if (oldComponent) {
            oldComponent.componentWillUnmount();
          }
          nodeToBeRemoved.remove();
        }
      }
    }
}

function updateTextNode(domElement, newVirtualElement, oldVirtualElement) {
  if (newVirtualElement.props.textContent !== oldVirtualElement.props.textContent) {
    domElement.textContent = newVirtualElement.props.textContent;
  }
  // save the virtualElement on the domElement
  // so that we can retrieve it next time
  domElement._virtualElement = newVirtualElement;       
}

  function getKey(vdom) {
      return vdom.props.key;
  }


  function isSameElementType(newvDom, oldvDom) {
      return oldvDom && newvDom.type === oldvDom.type;
  }

  function isSameComponentType(oldComponent, newVirtualElement) {
      return(
          oldComponent &&
          newVirtualElement.type === oldComponent.constructor
      );
  }


  function mountComponent(vdom, container, oldDomElement) {
    let newDom = null;
    if (TinyReact.Component.isPrototypeOf(vdom.type)) {
      let klass = null;
          if (vdom.component) {
            klass = vdom.component;
          } else {
            klass = new vdom.type(vdom.props);
            if (klass.props.ref) {
              klass.props.ref(klass);
            }
          }

      let compvDom = klass.render();
      compvDom.component = klass;
      
      newDom = mountElement(compvDom, container, oldDomElement);
    } else {
      newDom = mountElement(vdom.type(vdom.props), container, oldDomElement);
    }
    
    return newDom;
  }
    

  
  const eventProxy = function(e) {
    return this._listeners[e.type](e);
  };


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
          (domElement._listeners || (domElement._listeners = {}))[eventName] = newProp;
          //if (oldProp) {
            domElement.removeEventListener(eventName, eventProxy, false);
          //}
          domElement.addEventListener(eventName, eventProxy, false);
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
    
    // Not supporting callback now as, here setState is synchronous
    setState(state, callback) {
      if (!this.prevState) this.prevState = this.state;
      this.state = this._extend(
        this._extend({}, this.state),
        typeof state === 'function' ? state(this.state, this.props) : state
      );
      let dom = this.getDomElement();
      let container = dom.parentNode;
      let newVDom = this.render();  // This will invoke the derived class render menthod
      newVDom.component = this;
      diff (newVDom, container, dom);
    }
    
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

