/** @jsx TinyReact.createElement */

// Diffing native elements

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
        //return mountComponent(vdom, container,oldDom);
      } else {
        return mountSimpleNode(vdom, container, oldDom);
      }
    }
  
    function createDomElement(vdom, container, oldDomElement, parentComponent) {
      let newDomElement = null;
      if (vdom.type === "text") {
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
      
      return newDomElement;
    }
     
  
    function mountSimpleNode(vdom, container, oldDomElement, parentComponent) {
      let newDomElement = createDomElement(vdom, container, oldDomElement);
      
      // Setting ref to vdom to dom
      newDomElement._virtualElement = vdom;
      container.appendChild(newDomElement);

    
      return newDomElement;
    }
      
    //  The core diffing logic
    const diff = function (newvDom, container, oldDom) {
      let oldvDom = oldDom && oldDom._virtualElement;
      
      if (!oldDom) {
        mountElement(newvDom, container, oldDom);
      } else if (newvDom.type !== oldvDom.type) {
        // Replace
        let newDomElement = createDomElement(newvDom, oldDom);
        oldDom.parentNode.replaceChild(newDomElement, oldDom);

      } else {  // if type is same
        if (newvDom.type === "text") {
          updateTextNode(oldDom, newvDom, oldvDom);
        } else {
          updateDomElement(oldDom, newvDom, oldvDom);
        }
        newvDom.children.forEach((child,i) => {
          diff(child, oldDom, oldDom.childNodes[i]);
        });

        // Deleted extra node
        const oldNodes = oldDom.childNodes;
        if (oldNodes.length > newvDom.children.length) {
          for(let i = oldNodes.length -1;
              i >= newvDom.children.length; i-=1){
                  oldNodes[i].remove();
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


    function diffDomElement(vdom, oldDom, container) {
        
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

    function diffComponent (newVirtualElement, oldComponent, container, domElement) {
       
    }
    
    function handleComponent(newVirtualElement, oldComponent, container, domElement) {
       
    }    

   

    function mountComponent (vdom, container, oldDomElement) {
     
    }
  
    
    

    function renderFunctional(virtualElement) {
       
    }

    function renderStateful(virtualElement) {
       
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
  
  