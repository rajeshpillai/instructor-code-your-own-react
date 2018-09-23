/**** Demo *****/
/** @jsx TinyReact.createElement */
const root = document.getElementById("root");
let Header = (props) => {
  return (
    <div>
      <h2>{props.text}</h2>
      <h6>(double click on todo to mark as completed)</h6>
    </div>  
  );
}

// const TodoItem = function (props) {
//   let textInput = null;
//   function handleEdit(task) {
//     props.onUpdateTask(props.task.id, textInput.value);
//   }
//   const editView = (props) => {
//     if (props.task.edit) {
//       return (
//         <span>
//           <input
//             type="text"
//             value={props.task.title}
//             ref={input => textInput = input}
//           />
//           <input type="button" value="Save" onClick={() => handleEdit(props.task)} />
//         </span>
//       );
//     }
//     return props.task.title;
//   };

//   return (
//     <li className="todo-item">{editView(props)}
//       <input type="button" onClick={() => this.props.onDelete(this.props.task)} value="x" />
//       <input type="button" onClick={() => this.props.onToggleEdit(this.props.task)} value="e" />
//     </li>
//   );
// }

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

  handleEdit = (task) => {
    this.props.onUpdateTask(task.id, this.textInput.value);
  }

  editView = (props) => {
    if (props.task.edit) {
      return (
        <span>
          <input
            type="text"
            value={props.task.title}
            ref={input => this.textInput = input}
          />
          <input type="button" value="Save" onClick={() => this.handleEdit(this.props.task)} />
        </span>
      );
    }
    return props.task.title;
  };

  render() {
    let className = "todo-item ";
    if (this.props.task.completed) {
      className += "todo-item-completed";
    }
    return (
      <li className={className} onDblClick={() => this.props.onToggleComplete(this.props.task)}>{this.editView(this.props)}
        <div className="todo-actions">
          <input type="button" onClick={() => this.props.onDelete(this.props.task)} value="x" />
          <input type="button" onClick={() => this.props.onToggleEdit(this.props.task)} value="e" />
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
      sortOrder: "asc",
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
    let newTodo = {
      id: +new Date(),
      title: this.newTodo.value,
      edit: false
    }
    this.setState({
      tasks: [...this.state.tasks,
        newTodo]
    });

    this.newTodo.value = "";
    this.newTodo.focus();
  }

  sortToDo = () => {
    let tasks = null;
    let sortOrder = this.state.sortOrder;
    if (!sortOrder) {
      tasks = this.state.tasks.sort((a, b) => +(a.title > b.title) || -(a.title < b.title));
      sortOrder = "asc";
    } else if (sortOrder === "asc") {
      sortOrder = "desc";
      tasks = this.state.tasks.sort((a, b) => +(b.title > a.title) || -(b.title < a.title));
    } else {
      sortOrder = "asc";
      tasks = this.state.tasks.sort((a, b) => +(a.title > b.title) || -(a.title < b.title));
    }
    this.setState({
      tasks,
      sortOrder
    });
  }

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
          keyxxx={task.id}
          task={task}
          index={index}
          onDelete={this.deleteTodo}
          onToggleEdit={this.onToggleEdit}
          onToggleComplete={this.onToggleComplete}

          onUpdateTask={this.onUpdateTask}>
        </TodoItem>
      );
    });

    return (
      <div>
        {/* <Header text="Todo App" /> */}
        <input type="text" 
          onKeyDown={this.onKeyDown}
          ref={(newTodo) => this.newTodo = newTodo} placeholder="what do you want to do today?" />
        <input type="button" onClick={this.addTodo} value="Add Todo" />
        <input type="button" onClick={this.sortToDo} value="Sort" />
        <ul className="todos">
          {tasksUI}
        </ul>
      </div>
    );
  }
}

class MessageContainer extends TinyReact.Component {
  render() {
    return <Message />
  }
}

class Message extends TinyReact.Component {
  render() {
    return (
      <Message2>
        Hello from Message!
           </Message2>
    );
  }
}

class Message2 extends TinyReact.Component {
  render() {
    return (
      <div>
        <p>
          <span>{this.props.children}</span>
        </p>
        <Message3></Message3>
        <button>Click me</button>
      </div>
    );
  }
}
class Message3 extends TinyReact.Component {
  render() {
    return (
      <div>
        Here is message 3!
            </div>
    );
  }
}

class Hello extends TinyReact.Component {
  constructor(props){
    super(props);
    this.onAdd = this.onAdd.bind(this);
    this.onRemove = this.onRemove.bind(this);
    
    this.state.items = [
      "list 1", "list 2"
    ];
  }
  componentDidMount() {
    document.addEventListener("click", this.onAdd);
  }
  componentWillUnmount() {
    document.removeListener("click", onAdd); 
  }

  onAdd(){
    let item = "list " + (+new Date());
    this.setState({
      items: [...this.state.items,item]
    });
  }
  
  onRemove(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    let temp = e.target.textContent;
    let items = this.state.items.filter((item) => {
     return item != temp;
    });
    this.setState({
      items
    })
  }
  
  render() {
    let lists = this.state.items.map((item) => {
      return <li>
        <a 
          onClick={this.onRemove}
          href="#">{item}</a>
      </li>
    })
    return (
      <ol>
        {lists}
      </ol>
    );
  } 
}

// TinyReact.render(<Hello />, root);
//TinyReact.render(<TodoApp />, root);

//TinyReact.render(<MessageContainer />, root);

TinyReact.render(<TodoApp />, root);