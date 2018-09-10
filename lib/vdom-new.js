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
    if (!baseInstance) {
      //First Time
      var instance = createDomInstance(vDom);
      target.appendChild(instance.dom);
    } else {
      //Diff (Apply Reconcilation)
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
        dom.appendChild(childInstance.dom);
      });

      instance.childInstances = childInstances;
      return instance;
    } else {
      //Component
      console.log("component");
      var publicInstance = new vDom.type(vDom.props);
      var compVNode = publicInstance.render();
      var compInstance = createDomInstance(compVNode);
      return {
        dom: compInstance.dom,
        vDom: compVNode.vDom,
        childInstances: compInstance.childInstances,
        publicInstance
      };
    }
  }

  function updateDomProperties(dom, prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");
    const isAttribute = name => !isEvent(name) && name != "children";

    if (prevProps) {
      // Remove event listeners
      Object.keys(prevProps)
        .filter(isEvent)
        .forEach(name => {
          const eventType = name.toLowerCase().substring(2);
          dom.removeEventListener(eventType, prevProps[name]);
        });
      // Remove attributes
      Object.keys(prevProps)
        .filter(isAttribute)
        .forEach(name => {
          dom[name] = null;
        });
    }

    if (nextProps) {
      // Set attributes
      Object.keys(nextProps)
        .filter(isAttribute)
        .forEach(name => {
          dom[name] = nextProps[name];
        });

      // Add event listeners
      Object.keys(nextProps)
        .filter(isEvent)
        .forEach(name => {
          const eventType = name.toLowerCase().substring(2);
          dom.addEventListener(eventType, nextProps[name]);
        });
    }
  }

  class Component {
    constructor(props) {
      this.props = props;
    }
  }

  return {
    createElement,
    render,
    Component
  };
})();
