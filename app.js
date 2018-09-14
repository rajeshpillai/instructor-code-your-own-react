/** @jsx TinyReact.createElement */

const root = document.getElementById("root");

class TodoApp extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.addToDo = this.addToDo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.state = {
      header: "# Todos: 0",
      tasks: props.tasks || [],
      sortOrder: "asc",
    };
    this.count = 0;
  }

  addToDo() {
    //alert("Adding todo...");
    this.count += 1;
    this.setState({
      header: "# Todos: " + this.count,
      tasks: [...this.state.tasks, {id: +new Date(), title:"New Title " + this.count}]
    });

    //render(this.state.tasks); // Call global render, to force render
  }

  deleteTodo(task) {
    console.log(task);
    var tasks = this.state.tasks.filter(t => {
      return t.id != task.id;
    });

    this.setState({
      header: "# Todos: " + tasks.length,
      tasks
    });
  }

  onEditTask = (task, index) => {
    console.log("task", task, index);
    var tasks = this.state.tasks.map((t, i) => {
      if (t.id == task.id) {
        t = task;
      }
      return t;
    });

    this.setState({
      tasks
    });
  };

  sortToDo=()=> {
    let tasks =  null;
    let sortOrder = this.state.sortOrder;
    if (!sortOrder) {
      tasks = this.state.tasks.sort((a, b) => +(a.title > b.title) || -(a.title < b.title));
      sortOrder = "asc";
    } else if (sortOrder === "asc") {
      sortOrder = "desc";
      tasks = this.state.tasks.sort((a, b) => +(b.title > a.title) || -(b.title < a.title));
    } else  {
      sortOrder = "asc";
      tasks = this.state.tasks.sort((a, b) => +(a.title > b.title) || -(a.title < b.title));
    }
    console.log("Sorted Tasks: ", tasks);
    this.setState({
      tasks,
      sortOrder
    });
  }

  render() {
    let tasks = this.state.tasks.map((task, index) => {
      //   return <div>{task}</div>;
      return (
        <Todo
          key={task.id}
          task={task}
          index={index}
          onDelete={this.deleteTodo}
          onEditTask={this.onEditTask}>
        </Todo>
      );
    });
    console.log("tasks", tasks);
    return (
      <div>
        <Header title={this.state.header} />
        <input type="button" onClick={this.addToDo} value="Add Todo" />
        <input type="button" onClick={this.sortToDo} value="Sort" />
        <div>{tasks}</div>
        <TodoFooter></TodoFooter>

      </div>
    );
  }
}

class TodoFooter extends TinyReact.Component {
  render () {
    return (
      <div>copyright &copy; 2018 free</div>
    )
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
    let task = {
      id: this.props.task.id,
      title: this.input.value
    }
    this.props.onEditTask(task, this.state.index);
  }


  render() {
    const textBoxView = () => {
      if (this.state.editable) {
        return (
          <span>
            <input
              type="text"
              value={this.props.task.title}
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
        {this.props.task && this.props.task.title}
        <a href="#" onClick={() => this.props.onDelete(this.props.task)}>
          X
        </a>{" "}
        <a href="#" onClick={() => this.toggleEditableForm()}>
          Edit
        </a>
        {textBoxView()}
        {this.props.children}
      </div>
    );
  }
}

//console.log("Component: ",<TodoApp />);

//const simpleElement = <div className="app">Div 1</div>;
//console.log("simple:render: ", TinyReact.render(simpleElement, root));

function onClick (e) {
  //alert(e.target.innerText);
}

const nestedElement = (
  <ul className="todos" onClick={onClick}>
    <li className="todo-item">Task 1</li>
    <li className="todo-item">Task 2</li>
    <li className="todo-item">Task 3</li>
  </ul>
);

//console.log("Nested: ", nestedElement);
//console.log("nested:render: ", TinyReact.render(nestedElement, root));

// Adding functional component
const Header = function (props) {
  let title = props.title || " <no title>";
  return (
    <h1>Header {title}</h1>
  )
}

//console.log("function:vdom: ", Header);
//console.log("function:render: ", TinyReact.render(<Header title="Header 1" />, root));

console.log("component:vdom: ", TodoApp);
console.log("component:render: ", TinyReact.render(<TodoApp />, root));

function render(tasks) {
  alert(JSON.stringify(tasks));
  //TinyReact.render(<TodoApp tasks={tasks} />, root);
}

//TinyReact.render(<TodoApp />, document.getElementById("root"));

