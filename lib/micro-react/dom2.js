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
    const diff = function (vdom, container, oldDom) {
      let oldVDom = oldDom && oldDom._virtualElement;
      if (!oldVDom) {
        // Create new dom element 
        if (typeof vdom.type === 'function') {
          console.log("fn: ",vdom.type);
          return mountElement(vdom, container, oldDom);
        } else {
          console.log("el: ",vdom.type);
          return  mountSimpleNode(vdom,container,oldDom);
        }
      }
      else if (!vdom) {
        console.log("no vdom");
      }
      // If old vdom exist
      else if (changed(oldVDom, vdom)) {
          // Replace child.  Same number of element but
          // element changed
          console.log("changed:fn");
          let newDom = mountElement(vdom, container, oldDom);
          container.replaceChild(newDom, oldDom);
      } else {
        if (typeof vdom.type === 'function') {
            return mountElement(vdom,oldVDom);
        } else {
            // Text or dom element
            if (vdom.type === "text" || vdom.type === "number") {
                updateTextNode(oldDom, vdom, oldVDom);
            } else {
                updateDomElement(oldDom, vdom, oldVDom);
            }
        }
        vdom.children.forEach((childElement, i) => {
            let newChildVDom = getNewVDomForComponent(childElement, oldVDom);
            diff(newChildVDom, oldDom, oldDom.childNodes[i]);
        });
      }

       // TODO: Pending
       let oldDomChilds = oldDom.childNodes;
       if (oldDomChilds.length > vdom.children.length) {
           for(let i = oldDomChilds.length-1; i >= vdom.children.length; i--){
               oldDomChilds[i].remove();
           }
       }
       
    }

    const changed = function (oldVDom, newVDom) {
        return (
            (typeof oldVDom !== typeof newVDom ||
                oldVDom.type !== newVDom.type) && 
                newVDom.type !== 'function'
        );
    }

    const updateTextNode = function (dom, newVDom, oldVDom = {}) {
        if (newVDom.props.textContent !== oldVDom.props.textContent) {
            dom.textContent = newVDom.props.textContent;
        }
        dom._virtualElement = newVDom;
    }

    const updateDomElement = function (dom, newVDom, oldVDom = {}) {
        _updateProps(dom, newVDom, oldVDom);
        dom._virtualElement.props = newVDom.props;
    }

    /*
    Mount a simple node
    */
    function mountSimpleNode(vdom, container, oldDom) {
      var dom = null;
      if (vdom.type === "text") {
        dom = createTextNode(vdom);
        // Assign the vdom to the dom element (for diffing)
        dom._virtualElement = vdom;
        container.appendChild(dom);
        return dom;
      } else {
        dom = createDomElement(vdom);
        dom._virtualElement = vdom;
  
        // Updates props
        _updateProps(dom, vdom);
  
        container.appendChild(dom);
  
        // Call diff recursively to handle childs
        vdom.children.forEach(childElement => {
          return diff(childElement, dom)
        });
  
        // Handle refs
        if (vdom.props.ref) {
          vdom.props.ref(dom);
        }
        return dom;
      }
    } 
    
    const mountComponent = function (vdom, container, oldDom) {
      let dom = null;
      let oldVDom = oldDom && oldDom._virtualElement && oldDom._virtualElement;
      let newVDom = getNewVDomForComponent(vdom, oldVDom);
      
      let component = newVDom.component;
      
      dom = createDomElement(newVDom);
      dom._virtualElement = newVDom;
      
      if (component) {
        component.setDomElement(dom);
        if (component.props.ref) {
          component.props.ref(component);
        }
      }
      container.appendChild(dom);
      newVDom.children.forEach(childElement => {
        return diff(childElement, dom);
      });
      
      return dom;
    }
    
    const getNewVDomForComponent = function (vdom, oldVDom) {
      let newVDom = null;
      // if (TinyReact.Component.isPrototypeOf(vdom.type)) {
      if (typeof vdom.type === "function") {
        let component = null;
        let newVDom = null;
        if (TinyReact.Component.isPrototypeOf(vdom.type)) {
          if (oldVDom && oldVDom.component) {
            component = oldVDom.component;
            component.updateProps(vdom.props);
            newVDom = component.render();
          } else {
            component =new vdom.type(vdom.props);
            newVDom = component.render();
            newVDom.component = component;
          }
        } else {
          newVDom = vdom.type(vdom.props);
        }
        return newVDom;
      }
      else {
        return vdom;
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
    /*
      Helper methods
    */
    function createTextNode(vdom, container) {
      return document.createTextNode(vdom.props.textContent);
    }
  
    function createDomElement(vdom) {
      console.log(`creating ${vdom.type}`);
      return document.createElement(vdom.type);
    }
    
    function _updateProps(domElement, newVirtualElement, oldVirtualElement={}) {
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
      
    }
   return {
     createElement,
     render,
     Component
   }
  }());
  
  