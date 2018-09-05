
var TinyReact = (() =>{
    
    var base = null;

    const h = function(type,props,...children){
      return {
        type,
        props,
        children
      }   
    }
    
   
    const createDomElement = function(vNode){
      if(typeof vNode === "string"){
        return document.createTextNode(vNode);
      }
      
      var el = document.createElement(vNode.type);
      
      for (let prop in Object(vNode.props)){
        el.setAttribute(prop,vNode.props[prop]);
      }
      
      if(vNode.children){
        vNode.children.map(function(child){
            el.appendChild(createDomElement(child));
          })
      }
     
      
      return el;
    }
    
    const changed = function(node1,node2){
      return typeof node1 !== typeof node2 ||
             (typeof node1 === "string"  && node1 !== node2) ||
             node1.type != node2.type;
    }
    
    const update = function(parent,oldNode,newNode, index=1){
      if(!oldNode){
        parent.appendChild(createDomElement(newNode));
      } else if(!newNode){
        parent.removeChild(parent.childNodes[index]);
      } else  if(changed(oldNode, newNode)){
        parent.replaceChild(createDomElement(newNode),parent.childNodes[index]);
      } else if(newNode.type) {
        
        const props = Object.assign({}, oldNode.props, newNode.props);
		Object.keys(props).forEach(name => {   
            if(parent.childNodes[index][name])         {
                parent.childNodes[index][name] = props[name];
            } else {
                parent.childNodes[index].setAttribute(name,props[name]);
            }
            
        });
       
        var childLength =Math.max(newNode.children.length,oldNode.children.length);      
        for (let i=0;i<childLength; i++){
            update(parent.childNodes[index],oldNode.children[i], newNode.children[i],i)
        }
      }
      
    };
    
    const render = function(target, vNode){
      //debugger
      var curVdom = createDomElement(vNode);
      if(!base){
        base = vNode;
        target.appendChild(curVdom);
      } else {
          update (target,base,vNode)
      } 
      
      //target.appendChild(curVdom);
    };
    
     return {
        h,
       render,
       update
      }
    
  })();
  
 