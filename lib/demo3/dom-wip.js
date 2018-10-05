var TinyReact = (function () {
  function createElement(type, attributes, ...children) {
    const childElements = [].concat(...children).map(
        child =>
          child instanceof Object
            ? child
            : createElement("text", {
                textContent: child
              })
      );
  
      let props = {};
      Object.assign(props,{ children: childElements }, attributes);
      if (Object.freeze) {
        Object.freeze(props);
      }
      return {
        type,
        children: childElements,
        props: props
      };
  }
  
  var rootInstance = null;
  function render(vdom, container, oldDom = container.firstChild) {
    const prevInstance = rootInstance;
    const nextInstance = diff(container, prevInstance, vdom);
    rootInstance = nextInstance;
  }
  

  function diff(parentDom, instance, element) {
    if (!instance) {
      const newInstance = instantiate(element);
      parentDom.appendChild(newInstance.dom);
      return newInstance;
    } else if (!element) {
      parentDom.removeChild(instance.dom);
      return null;
    } else if (instance.element.type !== element.type) {
      // Replace instance
      const newInstance = instantiate(element);
      parentDom.replaceChild(newInstance.dom, instance.dom);
      return newInstance;
    } 
    else if (typeof element.type === "string") {
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.childInstances = reconcileChildren(instance, element);
      instance.element = element;
      return instance;
    } else {
      
      instance.publicInstance.props = _.cloneDeep(instance.publicInstance.prevProps);
      
      if (!instance.publicInstance.shouldComponentUpdate(element.props, instance.publicInstance.state)) {
        return instance;
      }
      instance.publicInstance.props = element.props;
      const childElement = instance.publicInstance.render();
      const oldChildInstance = instance.childInstance;
      const childInstance = diff(
        parentDom,
        oldChildInstance,
        childElement
      );
      instance.dom = childInstance.dom;
      instance.childInstance = childInstance;
      instance.element = element;
      return instance;
    }
  }

  function instantiate(element) {
    const { type, props } = element;
    const isDomElement = typeof type === "string";
    if (isDomElement) {
      const isTextElement = type === "text";
      const dom = isTextElement
        ? document.createTextNode("")
        : document.createElement(type);
        
      updateDomProperties(dom, [], props);
      const childElements = props.children || [];
      const childInstances = childElements.map(instantiate);
      const childDoms = childInstances.map(child => child.dom);
      childDoms.forEach(childDom => dom.appendChild(childDom));

      const instance = { dom, element, childInstances };
      return instance;

    } else {
      // Instantiate component element
      const instance = {};
      const publicInstance = createPublicInstance(element, instance);
      //Update composite instance
      if (!publicInstance.prevProps) {
        publicInstance.prevProps = _.cloneDeep(publicInstance.props);
      }
      const childElement = publicInstance.render();
      const childInstance = instantiate(childElement);
      const dom = childInstance.dom;

      Object.assign(instance, { dom, element, childInstance, publicInstance });
      
      return instance;
    }
  }

  function reconcileChildren(instance, element) {
    const dom = instance.dom;
    const childInstances = instance.childInstances;
    const nextChildElements = element.props.children || [];
    const newChildInstances = [];
    const count = Math.max(childInstances.length, nextChildElements.length);
    for (let i = 0; i < count; i++) {
      const childInstance = childInstances[i];
      const childElement = nextChildElements[i];
      const newChildInstance = diff(dom, childInstance, childElement);
      newChildInstances.push(newChildInstance);
    }
    return newChildInstances.filter(instance => instance != null);
  }

  function createPublicInstance(element, internalInstance) {
    const { type, props } = element;
    const publicInstance = new type(props);
    // Set refs
    if (props && props.ref) {
      props.ref(element.dom);
    } 

    publicInstance.__internalInstance = internalInstance;
    return publicInstance;
  }

  function updateDomProperties(dom, prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");
    const isAttribute = name => !isEvent(name) && name != "children";

    // Remove event listeners
    Object.keys(prevProps).filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

    // Remove attributes
    // Object.keys(prevProps).filter(isAttribute).forEach(name => {
    //   dom[name] = null;
    // });

    // Set attributes
    Object.keys(nextProps).filter(isAttribute).forEach(name => {
      if (dom[name] !== nextProps[name]) {
        dom[name] = nextProps[name];

      }
    });

    // Add event listeners
    Object.keys(nextProps).filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

    if (nextProps && nextProps.ref) {
      nextProps.ref(dom);
    } 
  }
  
  function updateInstance(internalInstance) {
    const parentDom = internalInstance.dom.parentNode;
    const element = internalInstance.element;
    diff(parentDom, internalInstance, element);
  }
  
  class Component {
    constructor(props) {
      this.nextState = {};
      this.state = {};
      this.props = props || {};
    }

    componentWillMount() {}
    componentDidMount() {}
    componentWillReceiveProps(nextProps) {}

    shouldComponentUpdate(nextProps, nextState) {
      return true;
    }

    componentWillUpdate(nextProps, nextState) {}

    componentDidUpdate(prevProps, prevState) {}

    componentWillUnmount() {}
    
    setState(partialState) {
      this.state = Object.assign({}, this.state, partialState);
      updateInstance(this.__internalInstance);
    }

   

   

    ///*** NOTES */
    /*
      Lifecycle events:
      1. Initialization -> setup props and state
      2. Mounting -> componentWillMount(), rnder(), componentDidMount()
      3. Updation 
           props -> componentWillReceiveProps(), shouldComponentUpdate(), ComponentWillUpdate(),
                     render(), componentDidUpdate()
           state -> shouldcomponentUpdate(), componentWillUpdate(), render(), componentDidUpdate()
      4. Unmounting -> componentWillUnmount()

    */
  }   

  return {
    createElement,
    render,
    Component
  };
})();

