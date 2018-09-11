/** @jsx TinyReact.createElement */

var state = ["item1", "item2", "item3"]; //, "item2", "item3"];

var timer = null;

function addData() {
  console.log("call updateData.....");
  var item = "item" + (state.length + 1);
  state.push(item);
  reRender();
}

function startTimer() {
  timer = setInterval(function() {
    console.log("call updateData.....");
    var item = "item" + (state.length + 1);
    state.push(item);
    reRender();
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function deleteData(item) {
  //console.log(e.target.attributes);

  //var item = e.target.attributes["data-val"].nodeValue;
  console.log(item);
  var data = state;
  state = state.filter(t => {
    return t != item;
  });
  reRender();
}

function deleteData1(e) {
  //console.log(e.target.attributes);

  var item = e.target.attributes["data-val"].nodeValue;
  console.log(item);
  var data = state;
  state = state.filter(t => {
    return t != item;
  });
  reRender();
}

const MSG = ":->child message";
class Footer extends TinyReact.Component {
  render() {
    return (
      <ol>
        <li>
          Class components
          <ol>
            <li>constructor</li>
            <li>render {MSG}</li>
          </ol>
        </li>
        <li>setState</li>
        <li>Diffing</li>
      </ol>
    );
  }
}

class App extends TinyReact.Component {
  state = {
    stories: [
      { name: "Didact introduction", url: "http://bit.ly/2pX7HNn" },
      { name: "Rendering DOM elements ", url: "http://bit.ly/2qCOejH" },
      { name: "Element creation and JSX", url: "http://bit.ly/2qGbw8S" },
      { name: "Instances and reconciliation", url: "http://bit.ly/2q4A746" },
      { name: "Components and state", url: "http://bit.ly/2rE16nh" }
    ]
  };

  onDelete = name => {
    let stories = this.state.stories.filter(story => {
      return story.name !== name;
    });

    this.setState({
      stories
    });
  };

  render() {
    return (
      <div>
        <h1>Didact Stories</h1>
        {/* <TodoApp /> */}
        <ul>
          {this.state.stories.map(story => {
            return (
              <Story
                onDelete={this.onDelete}
                name={story.name}
                url={story.url}
              />
            );
          })}
        </ul>
        <Footer />
      </div>
    );
  }
}

class Story extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.state = { likes: Math.ceil(Math.random() * 100) };
  }
  like() {
    this.setState({
      likes: this.state.likes + 1
    });
  }

  delete(name) {
    this.props.onDelete(name);
  }

  render() {
    const { name, url } = this.props;
    const { likes } = this.state;
    const likesElement = <span />;
    return (
      <li>
        <button onClick={e => this.like()}>
          {likes}
          <b>❤️</b>
        </button>
        <a href={url}>{name}</a>
        <button onClick={e => this.delete(name)}>x</button>
      </li>
    );
  }
}

function Header(props) {
  return <h1>Hello, Functional component {props.userName}</h1>;
}

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
    //this.props.onEditTask(this.state.task, this.state.index);
  }

  //   onChangeTask(e) {
  //     console.log(e.target.value);
  //     // alert(this.input.value);
  //     e.preventDefault();
  //     this.setState({
  //       task: e.target.value
  //     });
  //   }

  render() {
    // const textBoxView = (
    //   <span>
    //     <input
    //       type="text"
    //       value={this.state.task}
    //       onChange={e => this.onChangeTask(e)}
    //     />
    //     <input type="button" value="Save" onClick={() => this.saveTask()} />
    //   </span>
    // );

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

class MyComponent extends TinyReact.Component {
  render() {
    return <div>This is a custom comopnent.</div>;
  }
}

function reRender() {
  let list = (
    <ul>
      {state.map(item => {
        return (
          <li>
            {item}{" "}
            <a href="#" onClick={() => deleteData(item)}>
              X
            </a>
          </li>
        );
      })}
    </ul>
  );

  //   let comp = <Header userName="Urvashi" />;

  //   let todo = <Todo />;

  //   let list1 = (
  //     <ul>
  //       {state.map(item => {
  //         return (
  //           <li>
  //             {item}
  //             <a href="#" data-val={item} onClick={deleteData1}>
  //               X
  //             </a>
  //           </li>
  //         );
  //       })}
  //     </ul>
  //   );
  //   let view = (
  //     <div>
  //       <input type="button" value="Add" onClick={addData} />
  //       <input type="button" value="Start Timer" onClick={startTimer} />
  //       <input type="button" value="Stop" onClick={stopTimer} />
  //       {list}
  //     </div>
  //   );

  //   let viewComp = (
  //     <div>
  //       {/* {comp} */}
  //       {/* <TodoApp /> */}
  //       <App />
  //     </div>
  //   );

  //   let viewTodo = <Todo title="Task 1" />;

  TinyReact.render(<TodoApp />, document.getElementById("root"));
  //TinyReact.render(document.getElementById("root"), list);
}

reRender();

// setTimeout(function(){
//     //TinyReact.update(document.getElementById("root"),list1,list2,1);
//     TinyReact.render(document.getElementById("root"),list2);
//     // setTimeout(function(){
//     //     TinyReact.render(document.getElementById("root"),list3);
//     //     setTimeout(function(){
//     //         TinyReact.render(document.getElementById("root"),list4);
//     //     },2000)
//     // },2000)
// },2000)
