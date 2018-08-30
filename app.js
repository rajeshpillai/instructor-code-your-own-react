var todos= [
        {id: 1, title: "Build your own reactJS", completed: false},
        {id: 2, title: "Build your own expressJS", completed: false},
        {id: 3, title: "Advaned NodeJS", completed: true},
];

/** @jsx createElement */

let li = todos.map(todo => {
    return <li key={todo.id} className="todo-item">
        {todo.title}
    </li>
});

console.log("todos: ", li);

const list = (
    <ul style={{color: "blue"}} className="todos">
        {li}
    </ul>
);

/*  The equivalent JS code
const list = createElement('ul', {className: 'todos'},
    createElement('li', {className: 'todo-item'}, 'Build your own reactJS'),
    createElement('li', {className: 'todo-item'}, 'Build your own expressJS'),
);

*/

console.log(list);

render(list, document.getElementById("root"));