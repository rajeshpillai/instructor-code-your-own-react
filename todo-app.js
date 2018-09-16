/**** Demo *****/
/** @jsx TinyReact.createElement */
const root = document.getElementById("root");
let Header = (
  <h2>Todo App</h2>
);

const TodoItem = function (props) {
  return (
    <li className="todo-item">{props.task.title}</li>
  );
}

class TodoApp extends TinyReact.Component {
  constructor(props) {
    super(props); 
    this.addTodo = this.addTodo.bind(this);
    this.state = {
      tasks: [{id: 1, title: "Task 1"}],
    };
  }

  addTodo() {
    this.setState({
      tasks: [...this.state.tasks,
              {id: +new Date(), title:"New Title " + this.state.tasks.length}]
    });
   
  }
  render() {
    let tasksUI = this.state.tasks.map((task, index) => {
      return (
        <TodoItem
          key={task.id}
          task={task}
          index={index}
          onDelete={this.deleteTodo}
          onEditTask={this.onEditTask}>
        </TodoItem>
      );
    });
    
    return (
      <div>
         {Header}
        <input type="button" onClick={this.addTodo} value="Add Todo" />
        <ul>
         {tasksUI}
        </ul>
      </div>
    );
  }
}

TinyReact.render(<TodoApp />, root);
