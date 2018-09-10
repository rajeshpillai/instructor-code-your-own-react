var TinyReact = (function() {
  var baseInstance = null;
  const TEXT_TYPE = "TEXT";

  function createElement(type, props, ...children) {
    var childElements =
      children.length > 0
        ? flatten(children).filter(c => c != null && c !== false)
        : [];
    var childElements = childElements.map(child => {
      if (child instanceof Object) {
        return child;
      } else {
        return createElement(TEXT_TYPE, { nodeValue: child });
      }
    });

    return {
      type,
      props,
      children: childElements
    };
  }

  function flatten(arr) {
    return arr.reduce(
      (flat, toFlatten) =>
        flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
      []
    );
  }

  function render(vDom, target) {
    // if (!baseInstance) {
    //   //First Time
    //   var instance = createDomInstance(vDom);
    //   target.appendChild(instance.dom);
    // } else {
    //Diff (Apply Reconcilation)
    baseInstance = diff(target, baseInstance, vDom);
    //}
  }

  //   function diff(parentDom, oldInstance, newVDom) {
  //     if (!oldInstance) {
  //       //New Element append it to ParentDom
  //       let curInstance = createDomInstance(newVDom);
  //       parentDom.appendChild(curInstance.dom);
  //       return curInstance;
  //     } else if (!newVDom) {
  //       // Remove Element
  //       parentDom.removeChild(oldInstance.dom);
  //       return null;
  //     }
  //   }

  function diff(parentDom, oldInstance, newVDom) {
    if (!oldInstance) {
      //New Element append it to ParentDom
      let curInstance = createDomInstance(newVDom);
      parentDom.appendChild(curInstance.dom);
      return curInstance;
    } else if (!newVDom) {
      // Remove Element
      parentDom.removeChild(oldInstance.dom);
      return null;
    } else if (oldInstance.vDom.type !== newVDom.type) {
      //   if (typeof newVDom.type === "function") {
      //     diff(parentDom, oldInstance, createDomInstance(newVDom).vDom);
      //     return;
      //   }
      //Replace child
      let curInstance = createDomInstance(newVDom);
      parentDom.replaceChild(curInstance.dom, oldInstance.dom);
      return curInstance;
    } else if (typeof newVDom.type === "string") {
      // Update instance
      // debugger;
      updateDomProperties(
        oldInstance.dom,
        oldInstance.vDom.props,
        newVDom.props
      );
      oldInstance.childInstances = reconcileChildren(oldInstance, newVDom);
      oldInstance.vDom = newVDom;
      return oldInstance;
    } else {
      //Update composite instance
      //   oldInstance.publicInstance.props = newVDom.props;
      //   let newCompVDom = oldInstance.publicInstance.render();
      const oldChildInstance = oldInstance.childInstance;
      const childInstance = diff(parentDom, oldChildInstance, newVDom);
      let curInstance = {
        dom: childInstance.dom,
        childInstance: childInstance,
        vDom: newVDom
      };
      return curInstance;
    }
  }

  function createDomInstance(vDom) {
    let dom = null;
    if (typeof vDom.type == "string") {
      if (vDom.type == TEXT_TYPE) {
        dom = document.createTextNode("");
      } else {
        dom = document.createElement(vDom.type);
      }
      //Set Props
      updateDomProperties(dom, [], vDom.props);
      var instance = { dom, vDom };

      //Loop Children
      let childInstances = [];
      vDom.children.forEach(child => {
        var childInstance = createDomInstance(child);
        childInstances.push(childInstance);
        child = childInstance.vDom;
        dom.appendChild(childInstance.dom);
      });

      instance.childInstances = childInstances;
      return instance;
    } else {
      //Component
      console.log("component");
      const instance = {};
      const publicInstance = new vDom.type(vDom.props); //createPublicInstance(vDom, instance);
      publicInstance.__internalInstance = instance;
      console.log(publicInstance.__internalInstance);

      var compVNode = publicInstance.render();
      var compInstance = createDomInstance(compVNode);
      publicInstance.vDom = compVNode;
      publicInstance.dom = compInstance.dom;
      //   return {
      //     dom: compInstance.dom,
      //     vDom: compVNode,
      //     childInstances: compInstance.childInstances,
      //     publicInstance
      //   };
      Object.assign(instance, {
        dom: compInstance.dom,
        vDom: compVNode,
        childInstances: compInstance.childInstances,
        publicInstance
      });
      return instance;
    }
  }

  //   function createPublicInstance(element, internalInstance) {
  //     const { type, props } = element;
  //     const publicInstance = new type(props);
  //     publicInstance.__internalInstance = internalInstance;
  //     console.log(publicInstance.__internalInstance);
  //     return publicInstance;
  //   }

  function updateDomProperties(dom, prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");
    const isAttribute = name => !isEvent(name) && name != "children";

    const props = Object.assign({}, prevProps, nextProps);
    Object.keys(props)
      .filter(isAttribute)
      .forEach(name => {
        let newPropValue = nextProps[name];
        let oldPropValue = prevProps[name];
        if (!newPropValue) {
          //Remove attribute
          dom.removeAttribute(name);
        } else if (newPropValue !== oldPropValue) {
          dom[name] = newPropValue;
        }
      });

    Object.keys(props)
      .filter(isEvent)
      .forEach(name => {
        let newPropValue = nextProps[name];
        let oldPropValue = prevProps[name];
        const eventType = name.toLowerCase().substring(2);
        if (!oldPropValue) {
          dom.addEventListener(eventType, newPropValue);
        } else if (!newPropValue) {
          //Remove event
          // dom.removeEventListener(
          //     eventType,
          //     eventProxy,
          //     false
          //   );
        } else if (newPropValue !== oldPropValue) {
          dom.addEventListener(eventType, nextProps[name]);
        }
      });

    // if (prevProps) {
    //   // Remove event listeners
    //   Object.keys(prevProps)
    //     .filter(isEvent)
    //     .forEach(name => {
    //       const eventType = name.toLowerCase().substring(2);
    //       dom.removeEventListener(eventType, prevProps[name]);
    //     });
    //   // Remove attributes
    //   Object.keys(prevProps)
    //     .filter(isAttribute)
    //     .forEach(name => {
    //       dom[name] = null;
    //     });
    // }

    // if (nextProps) {
    //   // Set attributes
    //   Object.keys(nextProps)
    //     .filter(isAttribute)
    //     .forEach(name => {
    //       dom[name] = nextProps[name];
    //     });

    //   // Add event listeners
    //   Object.keys(nextProps)
    //     .filter(isEvent)
    //     .forEach(name => {
    //       const eventType = name.toLowerCase().substring(2);
    //       dom.addEventListener(eventType, nextProps[name]);
    //     });
    // }
  }

  function reconcileChildren(instance, vDom) {
    const dom = instance.dom;
    const childInstances = instance.childInstances;
    const nextChildVDoms = vDom.children || [];
    const newChildInstances = [];
    const count = Math.max(childInstances.length, nextChildVDoms.length);
    for (let i = 0; i < count; i++) {
      const childInstance = childInstances[i];
      const childElement = nextChildVDoms[i];
      const newChildInstance = diff(dom, childInstance, childElement);
      newChildInstances.push(newChildInstance);
    }
    return newChildInstances.filter(instance => instance != null);
  }

  class Component {
    constructor(props) {
      this.props = props;
      this.state = {};
    }

    setState(partialState) {
      this.state = Object.assign(this.state, partialState);
      let newCompVDom = this.render();
      var instance = createDomInstance(newCompVDom);
      //var test = this.setVDomChilds(instance, newCompVDom);
      //this.__internalInstance.vDom = newCompVDom;
      //updateInstance(this.__internalInstance);
      this.__internalInstance.vDom = this.__internalInstance.publicInstance.vDom;
      const parentDom = this.__internalInstance.dom.parentNode;
      //const vDom = newCompVDom; //this.__internalInstance.vDom;
      diff(parentDom, this.__internalInstance, newCompVDom);
    }

    // setVDomChilds(instance, vDom) {
    //   if (!vDom.children) {
    //     return;
    //   }
    //   for (let i = 0; i < vDom.children.length; i++) {
    //     if (typeof vDom.children[i].type == "function") {
    //       vDom.children[i] = instance.childInstances[i];
    //     }
    //     this.setVDomChilds(instance.childInstances[i], vDom.children[i]);
    //   }
    //   return vDom;
    // }
  }

  //   function updateInstance(internalInstance) {
  //     const parentDom = internalInstance.dom.parentNode;
  //     const vDom = internalInstance.vDom;
  //     diff(parentDom, internalInstance, vDom);
  //   }

  return {
    createElement,
    render,
    Component
  };
})();
