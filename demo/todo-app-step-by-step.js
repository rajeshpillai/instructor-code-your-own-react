/** @jsx TinyReact.createElement */

/*** Step 1,2,3,4 - createElement */

const root = document.getElementById("root");

var Step1 = (
  <div>
    <h1 className="header">Hello Tiny React!</h1>
    <h2>(coding nirvana)</h2>
    <div>nested 1<div>nested 1.1</div></div>
    <h3>(OBSERVE: This will change)</h3>
    {2 == 1 && <div>Render this if 2==1</div>}
    {2 == 2 && <div>{2}</div>}
    <span>This is a text</span>
    <button onClick={() => alert("Hi!")}>Click me!</button>
    <h3>This will be deleted</h3>
    2,3
  </div>
);

console.log(Step1);

// Step 5,6,7 -> Render native dom elements

//TinyReact.render(Step1, root);

// Step 8 -> Diffing native elements
var Step8 = (
  <div>
    <h1 className="header">Hello Tiny React!</h1>
    <h2>(coding nirvana)</h2>
    <div>nested 1<div>nested 1.1</div></div>
    <h3>(OBSERVE: I said it!!)</h3>
    {2 == 1 && <div>Render this if 2==1</div>}
    {2 == 2 && <div>{2}</div>}
    <span>This is a text</span>
    <button onClick={() => alert("Hi!")}>Click me!</button>
  </div>
);

// setTimeout(() => {
//   alert("Re-rendering...");
//   TinyReact.render(Step8, root);
// }, 3000);

// Step 10: Rendering functional Components
var Greeting = function (props) {
  return (
    <div className="greeting">
      <h1 className="header">Functional Component</h1>
      <h2>NOT CHANGED</h2>
      <div>{props.children}</div>
    </div>
  );
};

//TinyReact.render(<Greeting />, root);


var GreetingWithProps = function (props) {
  return (
    <div className="greeting">
      <h1 className="header">Welcome {props.message}</h1>
      <h2>NOT CHANGED</h2>
    </div>
  );
};

//TinyReact.render(<GreetingWithProps message="Good Day!!" />, root);

// Step 12: Nest functional Components

var GreetingWithNested = function (props) {
  return (
    <div className="greeting">
      <h1 className="header">Functional Component</h1>
      <h2>{props.message}</h2>
      <div>{props.children}</div>
    </div>
  );
};

var Footer = function (props) {
  return (
    <h4>{props.children}</h4>
  );
}

// STEP: 13 -> Diff functional Component

// TinyReact.render(
//   <GreetingWithNested message="Good Day!!">
//     <Footer>&copy; free to use</Footer>
//   </GreetingWithNested>,
//   root);


// setTimeout(function () {
//   alert("Re-rendering in 3 seconds!!");
//   TinyReact.render(<GreetingWithNested message="Greeeting Voila! Changed!!" />, root);
// }, 3000);


// STEP 14 -> Render stateful component

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

        <button
          onClick={() => {
            this.setState((prevState, props) => {
              return {
                title: "from functional setState"
              }
            });
          }}
        >
          Change Title using functional setState
        </button>

        <Footer>&copy; free to use</Footer>
      </div>
    );
  }
}

//TinyReact.render(<Alert title="Sure ?" />, root);

// Step 17 -> Diffing stateful component
class Stateful extends TinyReact.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  render() {
    return (
      <div>
        <h2>{this.props.title.toString()}</h2>
        <button onClick={update}>Update</button>
      </div>
    );
  }
}

//TinyReact.render(<Stateful title="Task 1" />, root);

function update() {
  TinyReact.render(<Stateful title={new Date()} />, root);
}


// Step 18 -> Adding ref support
class TodoItemX extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      task: {
        title: "Task 1"
      }
    }
    this.updateTodo = this.updateTodo.bind(this);
  }

  updateTodo() {
    let newValue = this.input.value;  // grab the dom and get the value
    let task = Object.assign({}, this.state.task);
    task.title = newValue;
    this.setState({
      task
    });
  }

  render() {
    return (
      <div>
        <h2>{this.state.task.title}</h2>
        <input type="text" ref={(input) => { this.input = input }}></input>
        <button onClick={this.updateTodo}>Update</button>
      </div>
    );
  }
}

//TinyReact.render(<TodoItemX />, root);

// Step 19-> Old is component and new is native dom

let newElement = (
  <div>
    <p>1</p>
    <p>2</p>
  </div>
);


// TinyReact.render(<Alert title="Sure ?" />, root);

// setTimeout(function () {
//   alert("Re-rendering in 5 seconds..");
//   TinyReact.render(newElement, root);
// }, 5000);


// Step 2o-> Add support for onDoubleClick event

class EventTest extends TinyReact.Component {
  constructor() {
    super();
    this.onDoubleClick = this.onDoubleClick.bind(this);
  }

  onDoubleClick(e) {
    alert(e.target);
  }
  render() {
    return (
      <h2 onDoubleClick={this.onDoubleClick}>Double click on me!</h2>
    );
  }
}

//TinyReact.render(<EventTest />, root);

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

  log(...args) {
    if (this.logging) {
      for (let i = 0; i < args.length; i++) {
        console.log(args[i]);
      }
    }
  }
  componentDidMount() {
    this.log("2. TodoItem:cdm");
  }
  componentWillMount() {
    this.log("1. TodoItem:cwu");
  }

  shouldComponentUpdate(nextProps, nextState) {
    let result = nextProps.task != this.props.task;
    return result;
  }

  componentWillReceiveProps(nextProps) {
    this.log("TodoItem:cwrp: ", JSON.stringify(nextProps));
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
            <i className="fas fa-save" />
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
            <i className="fas fa-edit" />
          </button>
          <button
            type="button"
            className="btnDelete"
            onClick={() => this.props.onDelete(this.props.task)}
          >
            <i className="fas fa-trash" />
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
    //let state = JSON.parse(JSON.stringify(this.state));

    var tasks = this.state.tasks.map(t => {
      return t.id !== taskId ?
        t :
        Object.assign({}, t, { title: newTitle, edit: !t.edit });
    });

    this.setState({
      tasks
    });
  }

  // Uses setstate with fn argument
  onToggleEdit(task) {
    //let state = JSON.parse(JSON.stringify(this.state));

    let tasks = this.state.tasks.map(t => {
      return t.id !== task.id ?
        t :
        Object.assign({}, t, { edit: !t.edit });
    });

    this.setState({
      tasks
    });
    // this.setState((state, props) => ({
    //   tasks
    // }));
  }

  onToggleComplete(task) {
    let tasks = this.state.tasks.map(t => {
      return t.id !== task.id ?
        t :
        Object.assign({}, t, { completed: !t.completed });
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

    let sortIcon = <i className="fas fa-sort-alpha-down" />;
    if (this.state.sortOrder === "asc") {
      sortIcon = <i className="fas fa-sort-alpha-up" />;
    } else {
      sortIcon = <i className="fas fa-sort-alpha-down" />;
    }

    return (
      <div className="container">
        <Header text="Todo App (TinyReact)" />

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



