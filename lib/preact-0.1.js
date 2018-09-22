setTimeout(function demo() {
	
	addEventListener('touchstart', e => (e.preventDefault(), false) );
	
	/** @jsx h */
	class Description extends Component {
		render() {
			return (
				<div>
					<span>Hi there! Move your mouse around and click, and watch the squirrel go.</span>
				</div>
			);
		}
	}
	
	/** @jsx h */
	class Cursor extends Component {
		render({ x, y, label, color, big }) {
			let left = Math.round(x) || 0;
			let top = Math.round(y) || 0;
			return (
				<div id="cursor"
					style={{ left, top, borderColor:color }}
					class={{ big, label }}>
						{ label ? (<span class="label">{ x },{ y }</span>) : null }
				</div>
			);
		}
	}
	
	
	const COUNT = 100;
	const LOOPS = 8;

	class Main extends Component {
		componentDidMount() {
			addEventListener('mousemove', this.setMouse.bind(this));
			addEventListener('mousedown', this.setBig.bind(this, true));
			addEventListener('mouseup', this.setBig.bind(this, false));
			setInterval( λ => this.setState({ counter: this.state.counter+1  }), 20);
		}
		getInitialState() {
			return { x:0, y:0, big:false, counter:0 };
		}
		setMouse({ pageX:x, pageY:y }) {
			this.setState({ x, y });
			return false;
		}
		setBig(big) {
			this.setState({ big });
		}
		render(props, state) {
			let { x, y, big, counter } = state,
				cursors = [],
				count = COUNT + Math.round(Math.sin(counter/90*2*Math.PI)*COUNT*0.5),
				loops = LOOPS;
			for (let i=0; i<count; i++) {
				let x = state.x + Math.sin(i/count*loops*2*Math.PI)*(20+i*2),
					y = state.y + Math.cos(i/count*loops*2*Math.PI)*(20+i*2),
					hue = (i/count*loops*255 + counter*10)%255,
					color = `hsl(${hue},100%,50%)`;
				cursors.push(
					<Cursor x={x} y={y} big={big} color={color} />
				);
			}
			
			return (
				<div id="main">
					<Description />
					<Cursor x={x} y={y} big={big} label />
					{ cursors }
				</div>
			);
		}
	}
	
	render(<Main />, document.body );
}, 100);



const EMPTY = {};
const NO_RENDER = { render: false };
const DOM_RENDER = { build: true };
const NON_DIMENSION_PROPS = `
	boxFlex boxFlexGroup columnCount fillOpacity flex flexGrow
	flexPositive flexShrink flexNegative fontWeight lineClamp
	lineHeight opacity order orphans strokeOpacity widows zIndex zoom
`.trim().split(/\s+/g).reduce( (acc, prop) => (acc[prop] = true, acc), {});

let slice = Array.prototype.slice;


let options = {
	collapseTextNodes: false
};

let hooks = {};

//export { options, hooks };


/*export*/ 
function render(component, parent) {
	let built = build(null, component),
		c = built._component;
	if (c) hook(c, 'componentWillMount');
	parent.appendChild(built);
	if (c) hook(c, 'componentDidMount');
	return build;
}


hooks.vnode = ({ attributes }) => {
	if (!attributes) return;

	let s = attributes.style;
	if (s && !s.substring) {
		attributes.style = styleObjToCss(s);
	}

	let c = attributes['class'];
	if (attributes.hasOwnProperty('className')) {
		c = attributes['class'] = attributes.className;
		delete attributes.className;
	}
	if (c && !c.substring) {
		attributes['class'] = hashToClassName(c);
	}
};

function styleObjToCss(s) {
	let str = '',
		sep = ': ',
		term = '; ';
	for (let prop in s) if (s.hasOwnProperty(prop)) {
		let val = s[prop];
		str += jsToCss(prop);
		str += sep;
		str += val;
		if (typeof val==='number' && !NON_DIMENSION_PROPS.hasOwnProperty(prop)) {
			str += 'px';
		}
		str += term;
	}
	return str;
}

function hashToClassName(c) {
	let str = '';
	for (let prop in c) {
		if (c[prop]) {
			if (str) str += ' ';
			str += prop;
		}
	}
	return str;
}

let jsToCss = s => s.replace(/([A-Z])/,'-$1').toLowerCase();


/** Provides a base Component class with an API similar to React. */
/*export*/ 
class Component {
	constructor() {
		this._dirty = false;
		this.props = hook(this, 'getDefaultProps') || {};
		this.state = hook(this, 'getInitialState') || {};
		hook(this, 'initialize');
	}

	destroy() {
		hook(this, 'componentWillUnmount');
	}

	shouldComponentUpdate(props, state) {
		return true;
	}

	setState(state) {
		extend(this.state, state);
		this.triggerRender();
	}

	setProps(props, opts=EMPTY) {
		let d = this._disableRendering===true;
		this._disableRendering = true;
		hook(this, 'componentWillReceiveProps', props, this.props);
		this.props = props;
		this._disableRendering = d;
		if (opts.render!==false) {
			this.triggerRender();
		}
	}
	
	triggerRender() {
		this._dirty = true;
		renderQueue.add(this);
	}

	render(props, state) {
		return h('div', { component:this.constructor.name }, props.children);
	}

	_render(opts=EMPTY) {
		if (this._disableRendering===true) return;
		
		this._dirty = false;

		if (hook(this, 'shouldComponentUpdate', this.props, this.state)===false) return;

		hook(this, 'componentWillUpdate');

		let rendered = hook(this, 'render', this.props, this.state);
		
	
		if (this.base || opts.build===true) {
			let base = build(this.base, rendered);
			if (this.base && base!==this.base) {
				this.base.parentNode.insertBefore(base, this.base);
				this.base.parentNode.removeChild(this.base);
			}
			this.base = base;
		}
		

		hook(this, 'componentDidUpdate');
	}
}



/** jsx hyperscript generator
 *  To use, add the directive:
 *  /** @jsx h *\/
 *  import { render, h } from 'react-compat';
 *  render(<span>foo</span>, document.body);
 */
/*export*/ 
function h(nodeName, attributes, ...args) {
	let children = null,
		sharedArr = [],
		arr, lastSimple;
	if (args.length) {
		//children = [].concat(...args).filter(notEmpty);
		children = [];
		for (let i=0; i<args.length; i++) {
			if (Array.isArray(args[i])) {
				arr = args[i];
			}
			else {
				arr = sharedArr;
				arr[0] = args[i];
			}
			for (let j=0; j<arr.length; j++) {
				let child = arr[j];
				let simple = notEmpty(child) && !isVNode(child);
				if (simple) child = String(child);
				if (simple && lastSimple) {
					children[children.length-1] += child;
				}
				else if (child!==null && child!==undefined) {
					children.push(child);
				}
				lastSimple = simple;
			}
		}
	}

	let p = new VNode(nodeName, attributes, children);
	hook(hooks, 'vnode', p);
	return p;
}

class VNode {
	constructor(nodeName, attributes, children) {
		this.nodeName = nodeName;
		this.attributes = attributes;
		this.children = children;
	}
}
VNode.prototype.__isVNode = true;




/** invoke a hook method gracefully */
function hook(obj, name, ...args) {
	let fn = obj[name];
	if (fn && typeof fn==='function') return fn.apply(obj, args);
}

function isVNode(obj) {
	return obj && obj.__isVNode===true;
}

function notEmpty(x) {
	return x!==null && x!==undefined;
}

function isSameNodeType(node, vnode) {
	if (node.nodeType===3) {
		return typeof vnode==='string';
	}
	let nodeName = vnode.nodeName;
	if (typeof nodeName==='function') return node._componentConstructor===nodeName;
	return node.nodeName.toLowerCase()===nodeName;
}


function buildComponentFromVNode(dom, vnode) {
	let c = dom && dom._component;
	if (c) {
		if (dom._componentConstructor===vnode.nodeName) {
			//console.log('updating component', vnode.nodeName);
			let props = getNodeProps(vnode);
			c.setProps(props);
			//console.log(props);
			return dom;
		}
		else {
			console.log('unmounting component', c.constructor.name);
			delete dom._component;
			hook(c, 'componentWillUnmount');
			if (c.base && c.base.parentNode) {
				c.base.parentNode.removeChild(c.base);
			}
			hook(c, 'componentDidUnmount');
		}
	}
	//else {
	//	console.log('creating new component', !!dom, vnode.nodeName.name)
	//}

	//let component = new vnode.nodeName();
	let component = componentRecycler.create(vnode.nodeName);
	// component.__key = key;

	let props = getNodeProps(vnode);
	component.setProps(props, NO_RENDER);
	component._render(DOM_RENDER);

	let node = component.base;
	node._component = component;
	node._componentConstructor = vnode.nodeName;
	return node;
}



/** Apply differences in a given vnode (and it's deep children) to a real DOM Node. */
function build(dom, vnode) {
	let out = dom,
		nodeName = vnode.nodeName;

	if (typeof nodeName==='function') {
		return buildComponentFromVNode(dom, vnode);
	}
	
	if (typeof vnode==='string') {
		// vnode = { nodeName:'x-text', text:vnode };
		if (dom) {
			if (dom.nodeType===3) {
				//console.log('updating text node', vnode);
				dom.textContent = vnode;
				return dom;
			}
			else {
				console.log('text node replacing DOM: ', dom.nodeType);
				if (dom.nodeType===1) recycler.collect(dom);
			}
		}
		return document.createTextNode(vnode);
	}

	if (!dom) {
		//console.log('creating '+nodeName);
		out = recycler.create(nodeName);
	}
	else if (dom.nodeName.toLowerCase()!==nodeName) {
		out = recycler.create(nodeName);
		appendChildren(out, slice.call(dom.childNodes));
		// reclaim element nodes
		if (dom.nodeType===1) recycler.collect(dom);
	}

	// apply attributes
	let old = getNodeAttributes(out) || EMPTY,
		attrs = vnode.attributes || EMPTY;

	// removed attributes
	if (old!==EMPTY) {
		for (let name in old) {
			if (old.hasOwnProperty(name) && (!attrs.hasOwnProperty(name) || attrs[name]===null)) {
				setAccessor(out, name, null, old[name]);
			}
		}
	}

	// new & updated attributes
	if (attrs!==EMPTY) {
		for (let name in attrs) {
			if (attrs.hasOwnProperty(name)) {
				let value = attrs[name];
				if (value!==null) {
					let prev = getAccessor(out, name, old[name]);
					if (value!==prev) {
						setAccessor(out, name, value, prev);
					}
				}
			}
		}
	}

	// apply text contents
	if (vnode.text && vnode.text!==out._vnodeContent) {
		out._vnodeContent = vnode.text;
		setContent(out, vnode.text);
	}


	let children = slice.call(out.childNodes);
	let keyed = {};
	for (let i=children.length; i--; ) {
		let t = children[i].nodeType;
		let key;
		if (t===3) {
			key = t.key;
		}
		else if (t===1) {
			key = children[i].getAttribute('key');
		}
		else {
			continue;
		}
		if (key) keyed[key] = children.splice(i, 1)[0];
	}
	let newChildren = [];

	if (vnode.children) {
		for (let i=0, vlen=vnode.children.length; i<vlen; i++) {
			let vchild = vnode.children[i];
			let attrs = vchild.attributes;
			let key, child;
			if (attrs) {
				key = attrs.key;
				child = key && keyed[key];
			}

			// attempt to pluck a node of the same type from the existing children
			if (!child) {
				let len = children.length;
				if (children.length) {
					for (let j=0; j<len; j++) {
						if (isSameNodeType(children[j], vchild)) {
							child = children.splice(j, 1)[0];
							break;
						}
					}
				}
			}
		
			// morph the matched/found/created DOM child to match vchild (deep)
			newChildren.push(build(child, vchild));
		}
	}

	// apply the constructed/enhanced ordered list to the parent
	for (let i=0, len=newChildren.length; i<len; i++) {
		// we're intentionally re-referencing out.childNodes here as it is a live array (akin to live NodeList)
		if (out.childNodes[i]!==newChildren[i]) {
			let child = newChildren[i],
				c = child._component,
				next = out.childNodes[i+1];
			if (c) hook(c, 'componentWillMount');
			if (next) {
				out.insertBefore(child, next);
			}
			else {
				out.appendChild(child);
			}
			if (c) hook(c, 'componentDidMount');
		}
	}
	
	// remove orphaned children
	for (let i=0, len=children.length; i<len; i++) {
		let child = children[i],
			c = child._component;
		if (c) hook(c, 'componentWillUnmount');
		child.parentNode.removeChild(child);
		if (c) {
			hook(c, 'componentDidUnmount');
			componentRecycler.collect(c);
		}
		else if (child.nodeType===1) {
			recycler.collect(child);
		}
	}
	
	return out;
}


let renderQueue = {
	items: [],
	pending: false,
	add(component) {
		//if (renderQueue.items.indexOf(component)===-1) {
		//	renderQueue.items.push(component);
		//}
		//if (renderQueue.pending) return;
		//renderQueue.pending = true;
		if (renderQueue.items.push(component)!==1) return;
		//requestAnimationFrame(renderQueue.process);
		setTimeout(renderQueue.process, 0);
		//postMessage('render','*');
		//renderQueue.process();
		//let img = new Image();
		//img.onerror = renderQueue.process;
		//img.src = '';
	},
	process() {
		let items = renderQueue.items,
			len = items.length;
		//renderQueue.pending = false;
		if (!len) return;
		//renderQueue.items.length = 0;
		renderQueue.items = [];
		while (len--) {
			//if (items[len]._dirty===true) {
				items[len]._render();
			//}
		}
	}
};
//addEventListener('message', e => e.data==='render' && renderQueue.process() );


/** Typed DOM node factory with reclaimation */
let recycler = {
	nodes: {},
	collect(node) {
		let name = node.nodeName;
		recycler.clean(node);
		let list = recycler.nodes[name] || (recycler.nodes[name] = []);
		list.push(node);
	},
	create(nodeName) {
		let list = recycler.nodes[name];
		if (list && list.length) {
			return list.splice(0, 1)[0];
		}
		return document.createElement(nodeName);
	},
	clean(node) {
		node.remove();

		let attrs = Object.keys(node.attributes);
		for (let i=attrs.length; i--; ) {
			node.removeAttribute(attrs[i]);
		}

		if (node.childNodes.length>0) {
			console.warn(`Warning: Recycler collecting <${node.nodeName}> with ${node.childNodes.length} children.`);
			slice.call(node.childNodes).forEach(recycler.collect);
		}
	}
};


let componentRecycler = {
	components: {},
	collect(component) {
		let name = component.constructor.name;
		let list = componentRecycler.components[name] || (componentRecycler.components[name] = []);
		list.push(component);
	},
	create(ctor) {
		let name = ctor.name,
			list = componentRecycler.components[name];
		if (list && list.length) {
			return list.splice(0, 1)[0];
		}
		return new ctor();
	}
};


/** Attempt to set the contents of a node via a prioritized accessor list. */
function setContent(node, content) {
	let accessor = node.setValue || node.setText || node.setContent;
	if (typeof accessor==='function') {
		accessor.call(node, content);
	}
	else if ('textContent' in node) {
		node.textContent = content;
	}
	else {
		console.warn(`Unable to set content for <${node.nodeName}>`);
	}
}


let appendChildren = (parent, children) => {
	parent.appendChild(children);
};

try {
	appendChildren(document.createElement('div'), [
		document.createElement('div'),
		document.createElement('div')
	]).childNodes[1].nodeName;
} catch(err) {
	appendChildren = (parent, children) => {
		for (let i=0; i<children.length; i++)
			parent.appendChild(children[i]);
	};
}


function getAccessor(node, name, value) {
	if (name==='class') return node.getClass ? node.getClass() : node.className;
	if (name==='style') return node.getStyle ? node.getStyle() : node.style.cssText;
	return getComplexAccessor(node, name, value);
}

function getComplexAccessor(node, name, value) {
	let uc = 'g'+nameToAccessor(name).substring(1);
	if (node[uc] && typeof node[uc]==='function') {
		return node[uc]();
	}
	return value;
}


/** Attempt to set via an accessor method, falling back to setAttribute().
 *	Automatically detects and adds/removes event handlers based for "attributes" beginning with "on".
 *	If `value=null`, triggers attribute/handler removal.
 */
function setAccessor(node, name, value, old) {
	if (name==='class') {
		node.className = value;
	}
	else if (name==='style') {
		node.style.cssText = value;
	}
	else {
		setComplexAccessor(node, name, value, old);
	}
}

function setComplexAccessor(node, name, value, old) {
	if (name.substring(0,2)==='on') {
		if (value===null) {
			node.removeEventListener(name, old);
		}
		else {
			node.addEventListener(name, value);
		}
		return;
	}

	let uc = nameToAccessor(name);
	if (node[uc] && typeof node[uc]==='function') {
		node[uc](value);
	}
	else if (value!==null) {
		node.setAttribute(name, value);
	}
	else {
		node.removeAttribute(name);
	}
}

function nameToAccessor(name) {
	let c = nameToAccessorCache[name];
	if (!c) {
		c = 'set' + name.charAt(0).toUpperCase() + name.substring(1);
		nameToAccessorCache[name] = c;
	}
	return c;
}
let nameToAccessorCache = {};


function getNodeAttributes(node) {
	let list = node.attributes;
	if (!list.getNamedItem) return list;
	if (list.length) return getAttributesAsObject(list);
}

function getAttributesAsObject(list) {
	let attrs = {};
	for (let i=list.length; i--; ) {
		let item = list[i];
		attrs[item.name] = item.value;
	}
	return attrs;
}


function getNodeProps(vnode) {
	let props = extend({}, vnode.attributes);
	if (vnode.children) {
		props.children = vnode.children;
	}
	if (vnode.text) {
		props._content = vnode.text;
	}
	return props;
}


function extend(obj, props) {
	for (let i in props) if (props.hasOwnProperty(i)) {
		obj[i] = props[i];
	}
	return obj;
}


