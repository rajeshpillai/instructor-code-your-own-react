/** @jsx createElement */
const list = (<ul className="todos">
    <li className="todo-item">Build your own reactJS</li>
    <li className="todo-item">Build your own expressJS</li>
</ul>);

/*  The equivalent JS code
const list = createElement('ul', {className: 'todos'},
    createElement('li', {className: 'todo-item'}, 'Build your own reactJS'),
    createElement('li', {className: 'todo-item'}, 'Build your own expressJS'),
);

*/

console.log(list);

render(list, document.getElementById("root"));