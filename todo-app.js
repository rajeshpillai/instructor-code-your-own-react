/**** Demo *****/
/** @jsx TinyReact.createElement */
const root = document.getElementById("root");
let Header = (
  <h2>Todo App</h2>
);

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

class TodoItem extends TinyReact.Component{
  constructor(props) {
    super(props);
  }
  componentDidMount(){
    console.log("2. TodoItem:cdm");
  }
  componentWillMount(){
    console.log("1. TodoItem:cwu");
  }
  componentWillReceiveProps(nextProps) {
    console.log("TodoItem:cwrp: ", nextProps);
  }
  componentWillUnmount(){
      console.log("TodoItem:cwu");
  }

  handleEdit =(task)=> {
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
    return (
      <li className="todo-item">{this.editView(this.props)}
        <input type="button" onClick={() => this.props.onDelete(this.props.task)} value="x" />
        <input type="button" onClick={() => this.props.onToggleEdit(this.props.task)} value="e" />
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
    this.state = {
      tasks: [{id: 1, title: "Task 1", edit: false}],
      sortOrder: "asc",
    };
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
   
  }

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

  onToggleEdit(task) {
    var tasks = this.state.tasks.map(t => {
     if (t.id === task.id) {
       t.edit = !t.edit;
     } else {
       t.edit = false; // Force, due to bug in ref.
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
          onUpdateTask={this.onUpdateTask}>
        </TodoItem>
      );
    });
    
    return (
      <div>
         {/* {Header} */}
         <input type="text" ref={(newTodo)=>this.newTodo = newTodo} placeholder="what do you want to do today?"/>
        <input type="button" onClick={this.addTodo} value="Add Todo" />
        <input type="button" onClick={this.sortToDo} value="Sort" />
        <ul>
         {tasksUI}
        </ul>
      </div>
    );
  }
}

TinyReact.render(<TodoApp />, root);
