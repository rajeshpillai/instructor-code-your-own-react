/** @jsx TinyReact.createElement */

const root = document.getElementById("root");

class TodoApp extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.addToDo = this.addToDo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.state = {
      header: "Test",
      tasks: ["Task 1"]
    };
    this.count = 1;
  }

  addToDo() {
    this.count += 1;
    this.setState({
      header: "Header " + this.count,
      tasks: [...this.state.tasks, "New Title " + this.count]
    });
  }

  deleteTodo(task) {
    console.log(task);
    var tasks = this.state.tasks.filter(t => {
      return t != task;
    });

    this.setState({
      tasks
    });
  }

  onEditTask = (task, index) => {
    console.log("task", task, index);
    var tasks = this.state.tasks.map((t, i) => {
      if (i == index) {
        t = task;
      }
      return t;
    });

    this.setState({
      tasks
    });
  };

  render() {
    let tasks = this.state.tasks.map((task, index) => {
      //   return <div>{task}</div>;
      return (
        <Todo
          task={task}
          index={index}
          onDelete={this.deleteTodo}
          onEditTask={this.onEditTask}
        />
      );
    });
    console.log("tasks", tasks);
    return (
      <div>
        <Header userName={this.state.header} />
        <div>{tasks}</div>
        <input type="button" onClick={this.addToDo} value="Add Todo" />
      </div>
    );
  }
}

class Todo extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      editable: false,
      index: props.index
    };
  }

  toggleEditableForm() {
    this.setState({
      editable: !this.state.editable
    });
  }

  saveTask(e) {
    console.log("save Task");
    this.toggleEditableForm();
    this.props.onEditTask(this.input.value, this.state.index);
  }


  render() {
    const textBoxView = () => {
      if (this.state.editable) {
        return (
          <span>
            <input
              type="text"
              value={this.props.task}
              ref={input => (this.input = input)}
              //   onChange={e => this.onChangeTask(e)}
            />
            <input type="button" value="Save" onClick={() => this.saveTask()} />
          </span>
        );
      }
      return "";
    };

    return (
      <div>
        {this.props.task}
        <a href="#" onClick={() => this.props.onDelete(this.props.task)}>
          X
        </a>{" "}
        <a href="#" onClick={() => this.toggleEditableForm()}>
          Edit
        </a>
        {textBoxView()}
      </div>
    );
  }
}

//console.log("Component: ",<TodoApp />);

const simpleElement = <div className="app">Div 1</div>;
console.log("simple:render: ", TinyReact.render(simpleElement, root));

function onClick (e) {
  alert(e.target.innerText);
}

const nestedElement = (
  <ul className="todos" onClick={onClick}>
    <li className="todo-item">Task 1</li>
    <li className="todo-item">Task 2</li>
    <li className="todo-item">Task 3</li>
  </ul>
);

//console.log("Nested: ", nestedElement);
console.log("nested:render: ", TinyReact.render(nestedElement, root));

// Adding functional component
const Header = function (props) {
  let title = props.title || " <no title>";
  return (
    <h1>Header {title}</h1>
  )
}

console.log("function:vdom: ", Header);
console.log("function:render: ", TinyReact.render(<Header title="Header 1" />, root));

//TinyReact.render(<TodoApp />, document.getElementById("root"));

