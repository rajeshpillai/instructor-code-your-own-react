var TinyReact = (() => {
  var base = null;

  const h = function(type, props, ...children) {
    var childElements = [].concat
      .apply([], children)
      .filter(c => c != null && c !== false)
      .map(child => {
        if (typeof child === "string") {
          return h("text", { textContent: child });
        }
        // else if (typeof child.type === "function") {
        //   if (TinyReact.Component.isPrototypeOf(child.type)) {
        //     var vNode = new child.type(child.props);
        //     if (vNode.render) {
        //       return vNode.render();
        //     }
        //   }
        //   else {
        //     //functional component -> invoke the function
        //     let funcVNode = child.type(child.props);
        //     return funcVNode;
        //   }
        // }
        else {
          return child;
        }
      })
      .filter(child => child);

    // const childElements = [].concat
    //   .apply([], children)
    //   .map(
    //     child =>
    //       typeof child === "string" ? h("text", { textContent: child }) : child
    //   )
    //   .filter(child => child);

    // console.log("h", {
    //   type,
    //   props,
    //   children: childElements // [].concat.apply([], children)
    // });

    return {
      type,
      props,
      children: childElements // [].concat.apply([], children)
    };
  };

  const createDomElement = function(vNode) {
    if (typeof vNode.type === "function") {
      if (TinyReact.Component.isPrototypeOf(vNode.type)) {
        //class -->instantiate and call Render method
        let funcVNode = new vNode.type(vNode.props);
        if (funcVNode.render) {
          var domEle = createDomElement(funcVNode.render());
          funcVNode._domInstance = domEle;
          vNode._domInstance = domEle;
          funcVNode.base = funcVNode.render();
          //domEle._vDom = funcVNode.base;
          //base = funcVNode.render();
          return domEle;
          //return createDomElement(funcVNode.render());
        }
      } else {
        //functional component -> invoke the function
        let funcVNode = vNode.type(vNode.props);
        let domEle = createDomElement(funcVNode);
        vNode._domInstance = domEle;
        return domEle;
      }
    } else if (typeof vNode === "string") {
      let domEle = document.createTextNode(vNode);
      vNode._domInstance = domEle;
      return domEle;
    } else if (vNode.type === "text") {
      let domEle = document.createTextNode(vNode.props.textContent);
      vNode._domInstance = domEle;
      return domEle;
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
      // var chdn = [...vNode.children];
      var chdn = flatten(vNode.children);
      chdn.map(function(child) {
        let childDomeEle = createDomElement(child);
        chdn._domInstance = childDomeEle;
        el.appendChild(childDomeEle);
      });
    }
    //    vNode._domInstance = el;
    el.vNode = vNode;
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
      newNode._domInstance = createDomElement(newNode);
    } else if (!newNode) {
      parent.removeChild(parent.childNodes[index]);
    } else if (changed(oldNode, newNode)) {
      console.log("Changed");
      console.log("oldNode", oldNode);
      console.log("newNode", newNode);

      //   if (newNode.type != oldNode.type) {
      //     console.log(createDomElement(newNode));

      //     //document.insertAfter(parent);
      //     //parent.appendChild(createDomElement(newNode));
      //   } else {
      //   if (oldNode.type === "text") {
      //     //if (newVirtualElement.props.textContent !== oldVirtualElement.props.textContent) {
      //     parent.textContent = newNode.props.textContent;
      //     //}
      //   }
      //   //   if (parent.nodeName == "#text") {
      //   //     parent.textContent += createDomElement(newNode).textContent;
      //   //   }
      // else {
      parent.replaceChild(createDomElement(newNode), parent.childNodes[index]);
      newNode._domInstance = createDomElement(newNode);
      //}
      //}
    } else if (newNode.type) {
      //Diff Properties
      if (typeof newNode.type === "function" && newNode.type == oldNode.type) {
        update(
          //parent.childNodes[index],
          //parent._domInstance,
          parent,
          getVNodeOfTypeFunction(oldNode).children,
          getVNodeOfTypeFunction(newNode).children
        );
      }
      if (newNode.type === "text") {
        var ele = parent;
        if (newNode.props.textContent !== oldNode.props.textContent) {
          //Text is divided in nodes e.g.
          //<div>{this.state.title} This is Todo App</div> ===> {this.state.title} , This is Todo App
          //So to update correct text node within the text e need to iterate throught nextsiblings to reach the correct text to be updated
          for (let j = 0; j < index; j++) {
            ele = ele.nextSibling ? ele.nextSibling : ele;
          }
          ele.textContent = newNode.props.textContent;
        }
      } else {
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
            //if (newProp !== oldProp)
            if (
              parent &&
              parent.childNodes[index] &&
              parent.childNodes[index][name]
            ) {
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
      }

      //Diff Children
      //   newNode.children = flatten(newNode.children);
      //   oldNode.children = flatten(oldNode.children);

      //   if (
      //     typeof oldNode.type === "function" &&
      //     typeof newNode.type === "function"
      //   ) {
      //     console.log("aaaaaaaaaaaaaaaaaaaa");
      //     oldNode.children = getVNodeOfTypeFunction(oldNode);
      //     newNode.children = getVNodeOfTypeFunction(newNode);
      //   }
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
          //parent.childNodes[index].vNode = newNode;
        }
      }
    }
  };

  const getVNodeOfTypeFunction = function(node) {
    if (TinyReact.Component.isPrototypeOf(node.type)) {
      var vNode = new node.type(node.props);
      if (vNode.render) {
        return vNode.render();
      }
    } else {
      //functional component -> invoke the function
      let funcVNode = node.type(node.props);
      return funcVNode;
    }
  };

  const render = function(target, vNode, compBase) {
    var curDom = createDomElement(vNode);
    if (!base) {
      target.appendChild(curDom);
    } else {
      console.log("compBase", compBase);
      console.log("base", base);
      console.log("newVNode", vNode);
      update(target, compBase ? compBase : base, vNode);
    }
    base = vNode;
    return vNode;
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
      //render(document.getElementById("root"), this.render());
      this.compBase = this.compBase ? this.compBase : this.base;
      this.compBase = render(this._domInstance, this.render(), this.compBase);
    }
  }

  function flatten(arr) {
    return arr.reduce(
      (flat, toFlatten) =>
        flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
      []
    );
  }

  return {
    h,
    render,
    Component
  };
})();
