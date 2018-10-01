/**** Demo *****/
/** @jsx TinyReact.createElement */
const root = document.getElementById("root");

// Step 0:  createElement

// Step 1:  Rendering simple native elements

// Step 1.1 : Setting props and event handlers

// Step 2:  Diffing native elements

// Step 4:  Adding support for ref.

// Step 5:  Functional Components

// Step 6:  Props

// Step 7:  Diffing functional Components

// Step 8:  Stateful Components

// Step 9:  Diffing Stateful Components

/***** IMMPLEMENTATION NOTES */
// Convert the below Hello into its equivalent VDOM.

// Step 0:  createElement

var Hello = (
  <div>
    <h1 className="header">Hello React!</h1>
    <h2>(coding nirvana)</h2>
    <h3>(This will change)</h3>
    <button onClick={() => alert("Hi!")}>Click me!</button>
    <h3>This will be deleted</h3>
  </div>
);

// For Babel to covert this into its equivalent JS code,
// We have to implement createElement method.

console.log(Hello);

// Step 1 & 2:  Rendering simple native elements
//TinyReact.render(Hello, root);

// Step 3: Diffing Native element
var NewHello = (
  <div>
    <h1 className="header">Hello Tiny React</h1>
    <h2>(coding nirvana)</h2>
    <h3>(I said already. This changed!)</h3>
    <button onClick={() => alert("Tiny React!")}>Click me!</button>
  </div>
);

// setTimeout(function() {
//   alert("Re-rendering!!");
//   TinyReact.render(NewHello, root);
// }, 3000);

var Greeting = function(props) {
  return (
    <div className="greeting">
      <h1 className="header">Welcome {props.message}</h1>
      <h2>NOT CHANGED</h2>
    </div>
  );
};

// TinyReact.render(<Greeting message="Hello FS" />, root);

// setTimeout(function() {
//   alert("Re-rendering..");
//   TinyReact.render(<Greeting message="Greeeting Voila! Changed!!" />, root);
// }, 2000);

class Title extends TinyReact.Component {
  render() {
    return <h2>Nested Component</h2>;
  }
}

class Alert extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Default title"
    };
  }

  render() {
    return (
      <div className="alert-container">
        <Title />
        <h2 className="alert-title">Are you sure this works?</h2>
        <h3>{this.state.title}</h3>

        <button
          onClick={() => {
            this.setState({ title: "New Title" });
          }}
        >
          Change Title
        </button>
      </div>
    );
  }
}

//TinyReact.render(<Alert title="Sure ?" />, root);


// Case type change:  old is native and new is component
let old = (
  <div>
    <p>1</p>
    <p>2</p>
  </div>
)

// TinyReact.render(old, root);

// setTimeout(function() {
//   alert("Re-rendering..");
//   TinyReact.render(<Alert title="Sure ?" />, root);
// }, 2000);

//TODO:  Case type change:  old is component and new is native
// Need to optimize this case (as items are not replaced, but added and removed.)


//TinyReact.render(<Alert title="Sure ?" />, root);

// setTimeout(function() {
//   alert("Re-rendering..");
//   TinyReact.render(old, root);
// }, 2000);


//////******************************* TODO APP */
let Header = props => {
  return (
    <div>
      <h1 style="color:green">{props.text}</h1>
      <h6>(double click on todo to mark as completed)</h6>
    </div>
  );
};

class TodoItem extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.logging = true;
  }

  log(msg) {
    if (this.logging) {
      console.log(msg);
    }
  }
  componentDidMount() {
    this.log("2. TodoItem:cdm");
  }
  componentWillMount() {
    this.log("1. TodoItem:cwu");
  }
  componentWillReceiveProps(nextProps) {
    this.log("TodoItem:cwrp: ", nextProps);
  }
  componentWillUnmount() {
    this.log("TodoItem:cwu: " + this.props.task.title);
  }

  handleEdit = task => {
    this.props.onUpdateTask(task.id, this.textInput.value);
  };

  editView = props => {
    if (props.task.edit) {
      return (
        <span>
          <input
            type="text"
            className="editItemInput"
            value={props.task.title}
            ref={input => (this.textInput = input)}
          />
          <button
            type="button"
            onClick={() => this.handleEdit(this.props.task)}
          >
            <i class="fas fa-save" />
          </button>
        </span>
      );
    }
    return props.task.title;
  };

  render() {
    let className = "todo-item ";
    if (this.props.task.completed) {
      className += "strike";
    }
    return (
      <li
        key={this.props.key}
        className={className}
        onDblClick={() => this.props.onToggleComplete(this.props.task)}
      >
        {this.editView(this.props)}
        <div className="todo-actions">
          <button
            type="button"
            onClick={() => this.props.onToggleEdit(this.props.task)}
          >
            <i class="fas fa-edit" />
          </button>
          <button
            type="button"
            className="btnDelete"
            onClick={() => this.props.onDelete(this.props.task)}
          >
            <i class="fas fa-trash" />
          </button>
        </div>
      </li>
    );
  }
}

class TodoApp extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.addTodo = this.addTodo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.onToggleEdit = this.onToggleEdit.bind(this);
    this.onUpdateTask = this.onUpdateTask.bind(this);
    this.onToggleComplete = this.onToggleComplete.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.state = {
      tasks: [{ id: 1, title: "Task 1", edit: false }],
      sortOrder: "asc"
    };
  }

  onKeyDown(e) {
    if (e.which === 13) {
      this.addTodo();
    }
  }
  deleteTodo(task) {
    var tasks = this.state.tasks.filter(t => {
      return t.id != task.id;
    });

    this.setState({
      header: "# Todos: " + tasks.length,
      tasks
    });
  }

  addTodo() {
    if (this.newTodo.value.trim() == "") {
      alert("You don't wanna do anything !");
      return;
    }
    let newTodo = {
      id: +new Date(),
      title: this.newTodo.value,
      edit: false
    };
    this.setState({
      tasks: [...this.state.tasks, newTodo]
    });

    this.newTodo.value = "";
    this.newTodo.focus();
  }

  sortToDo = () => {
    let tasks = null;
    let sortOrder = this.state.sortOrder;
    if (!sortOrder) {
      tasks = this.state.tasks.sort(
        (a, b) => +(a.title > b.title) || -(a.title < b.title)
      );
      sortOrder = "asc";
    } else if (sortOrder === "asc") {
      sortOrder = "desc";
      tasks = this.state.tasks.sort(
        (a, b) => +(b.title > a.title) || -(b.title < a.title)
      );
    } else {
      sortOrder = "asc";
      tasks = this.state.tasks.sort(
        (a, b) => +(a.title > b.title) || -(a.title < b.title)
      );
    }
    this.setState({
      tasks,
      sortOrder
    });
  };

  onUpdateTask(taskId, newTitle) {
    //alert(newTitle);
    var tasks = this.state.tasks.map(t => {
      if (t.id === taskId) {
        t.title = newTitle;
        t.edit = !t.edit;
      }
      return t;
    });

    this.setState({
      tasks
    });
  }

  // Uses setstate with fn argument
  onToggleEdit(task) {
    var tasks = this.state.tasks.map(t => {
      if (t.id === task.id) {
        t.edit = !t.edit;
      } else {
        //t.edit = false; // Force, due to bug in ref.
      }
      return t;
    });

    // this.setState({
    //   tasks
    // });
    this.setState((state, props) => ({
      tasks
    }));
  }

  onToggleComplete(task) {
    var tasks = this.state.tasks.map(t => {
      if (t.id === task.id) {
        t.completed = !t.completed;
      }
      return t;
    });

    this.setState({
      tasks
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
          onToggleEdit={this.onToggleEdit}
          onToggleComplete={this.onToggleComplete}
          onUpdateTask={this.onUpdateTask}
        />
      );
    });

    let sortIcon = <i class="fas fa-sort-alpha-down" />;
    if (this.state.sortOrder === "asc") {
      sortIcon = <i class="fas fa-sort-alpha-up" />;
    } else {
      sortIcon = <i class="fas fa-sort-alpha-down" />;
    }

    return (
      <div className="container">
        <Header text="Todo App" />

        <div className="todo-input-container">
          <input
            type="text"
            className="addItemInput"
            onKeyDown={this.onKeyDown}
            ref={newTodo => (this.newTodo = newTodo)}
            placeholder="what do you want to do today?"
          />
          <button
            type="button"
            className="addItemButton"
            onClick={this.addTodo}
            value="Add Todo"
          >
            Add Todo
          </button>
          <button type="button" onClick={this.sortToDo} value="Sort">
            {sortIcon}
          </button>
        </div>
        <ul className="todos">{tasksUI}</ul>
      </div>
    );
  }
}

TinyReact.render(<TodoApp />, root);
