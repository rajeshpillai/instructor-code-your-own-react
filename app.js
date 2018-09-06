/** @jsx TinyReact.h */

var state = ["item1", "item2", "item3"];

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

// function deleteData1(e) {
//   //console.log(e.target.attributes);

//   var item = e.target.attributes["data-val"].nodeValue;
//   console.log(item);
//   var data = state;
//   state = state.filter(t => {
//     return t != item;
//   });
//   reRender();
// }

function Header(props) {
  return <h1>Hello, Functional component {props.userName}</h1>;
}

class TodoApp extends TinyReact.Component {
  constructor(props) {
    super(props);
    this.addToDo = this.addToDo.bind(this);
    this.state = {
      //title: props.title,
      tasks: ["Task 1"]
    };
    this.count = 1;
  }

  addToDo() {
    this.count += 1;
    this.setState({
      //title: "New Title " + this.count,
      tasks: [...this.state.tasks, "New Title " + this.count]
    });
  }

  render() {
    let tasks = this.state.tasks.map(task => {
      //   return <div>{task}</div>;
      return <Todo task={task} />;
    });
    console.log("tasks", tasks);
    return (
      <div>
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
      //title: props.title,
      task: props.task
    };
  }

  render() {
    return (
      <div>
        <div>{this.state.task}</div>
      </div>
    );
  }
}

function reRender() {
  //   let list = (
  //     <ul>
  //       {state.map(item => {
  //         return (
  //           <li>
  //             {item}{" "}
  //             <a href="#" onClick={() => deleteData(item)}>
  //               X
  //             </a>
  //           </li>
  //         );
  //       })}
  //     </ul>
  //   );

  let comp = <Header userName="Urvashi" />;

  let todo = <Todo />;

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

  let viewComp = (
    <div>
      {comp}
      <TodoApp />
    </div>
  );

  let viewTodo = <Todo title="Task 1" />;

  TinyReact.render(document.getElementById("root"), viewComp);
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
