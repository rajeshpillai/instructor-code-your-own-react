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
class TodoItem extends TinyReact.Component {
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

TinyReact.render(<TodoItem />, root);


