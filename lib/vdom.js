var TinyReact = (() => {
  var base = null;

  const h = function(type, props, ...children) {
    return {
      type,
      props,
      children: [].concat.apply([], children)
    };
  };

  const creatEleForFunction = function(vNode) {
    var funcVNode = vNode();
    funcVNode.children.forEach(child => {
      return createDomElement(vNode);
    });
  };

  const createDomElement = function(vNode) {
    if (typeof vNode.type === "function") {
      if (TinyReact.Component.isPrototypeOf(vNode.type)) {
        //class -->instantiate and call Render method
        let funcVNode = new vNode.type(vNode.props);
        if (funcVNode.render) {
          return createDomElement(funcVNode.render());
        }
      } else {
        //functional component -> invoke the function
        let funcVNode = vNode.type(vNode.props);
        return createDomElement(funcVNode);
      }
    } else if (typeof vNode === "string") {
      return document.createTextNode(vNode);
    }
    var el = document.createElement(vNode.type);
    //Attributes/events
    for (let prop in Object(vNode.props)) {
      if (/^on/.test(prop)) {
        var eventName = prop.slice(2).toLowerCase();
        //el.removeEventListener(eventName, vNode.props[prop], false);
        //el.addEventListener(eventName, vNode.props[prop], false);
        el.removeEventListener(eventName, eventProxy, false);
        el.addEventListener(eventName, eventProxy, false);
        (el._listeners || (el._listeners = {}))[eventName] = vNode.props[prop];
      } else {
        el.setAttribute(prop, vNode.props[prop]);
      }
    }
    //Children
    if (vNode.children) {
      var chdn = [...vNode.children];
      chdn.map(function(child) {
        el.appendChild(createDomElement(child));
      });
    }
    return el;
  };

  const eventProxy = function(e) {
    return this._listeners[e.type](e);
  };

  const changed = function(node1, node2) {
    return (
      typeof node1 !== typeof node2 ||
      (typeof node1 === "string" && node1 !== node2) ||
      node1.type != node2.type
    );
  };

  const update = function(parent, oldNode, newNode, index = 0) {
    if (!oldNode) {
      parent.appendChild(createDomElement(newNode));
    } else if (!newNode) {
      parent.removeChild(parent.childNodes[index]);
    } else if (changed(oldNode, newNode)) {
      parent.replaceChild(createDomElement(newNode), parent.childNodes[index]);
    } else if (newNode.type) {
      //Diff Properties
      const props = Object.assign({}, oldNode.props, newNode.props);
      Object.keys(props).forEach(name => {
        let newProp = newNode.props[name];
        let oldProp = oldNode.props[name];
        let isEvent = /^on/.test(name);
        let eventName = isEvent ? name.slice(2).toLowerCase() : null;
        if (!newProp) {
          //Remove if newProp is null
          if (isEvent == true) {
            //Remove event
            parent.childNodes[index].removeEventListener(
              eventName,
              eventProxy,
              false
            );
          } else {
            //Remove attribute
            element.removeAttribute(name);
          }
        } else if (newProp !== oldProp) {
          if (parent.childNodes[index][name]) {
            let propValue = parent.childNodes[index][name];
            if (propValue != props[name]) {
              parent.childNodes[index][name] = props[name];
            }
          } else {
            if (isEvent == true) {
              //event
              parent.childNodes[index].removeEventListener(
                eventName,
                eventProxy,
                false
              );
              parent.childNodes[index].addEventListener(
                eventName,
                eventProxy,
                false
              );
              (parent.childNodes[index]._listeners ||
                (parent.childNodes[index]._listeners = {}))[eventName] =
                props[name];
            } else {
              //Attributes;
              let propValue = parent.childNodes[index].getAttribute(name);
              if (propValue != props[name]) {
                parent.childNodes[index].setAttribute(name, props[name]);
              }
            }
          }
        } //if (newProp !== oldProp)
      });

      //Diff Children
      var childLength = Math.max(
        newNode.children.length,
        oldNode.children.length
      );
      for (let i = 0; i < childLength; i++) {
        if (parent) {
          update(
            parent.childNodes[index],
            oldNode.children[i],
            newNode.children[i],
            i
          );
        }
      }
    }
  };

  const render = function(target, vNode) {
    var curDom = createDomElement(vNode);
    if (!base) {
      target.appendChild(curDom);
    } else {
      console.log("base", base);
      console.log("newVNode", vNode);
      update(target, base, vNode);
    }
    base = vNode;
  };

  class Component {
    constructor(props) {
      this.props = props;
      this.state = {};
    }

    render() {}

    setState(nextState) {
      this.state = Object.assign(this.state, nextState);
      //   this.render();
      render(document.getElementById("root"), this.render());
    }
  }

  return {
    h,
    render,
    Component
  };
})();
