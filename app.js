 /** @jsx TinyReact.h */

// var todos= [
//         {id: 1, title: "Build your own reactJS", completed: false},
//         {id: 2, title: "Build your own expressJS", completed: false},
//         {id: 3, title: "Advaned NodeJS", completed: true},
// ];

//

// let li = todos.map(todo => {
//     return <li key={todo.id} className="todo-item">
//         {todo.title}
//     </li>
// });

// console.log("todos: ", li);

// const list = (
//     <ul style={{color: "blue"}} className="todos">
//         {li}
//     </ul>
// );

// /*  The equivalent JS code
// const list = createElement('ul', {className: 'todos'},
//     createElement('li', {className: 'todo-item'}, 'Build your own reactJS'),
//     createElement('li', {className: 'todo-item'}, 'Build your own expressJS'),
// );

// */

// console.log(list);

// render(list, document.getElementById("root"));

 //console.log(TinyReact);
  
  
  //console.log("sasas");
  
   //console.log(TinyReact.h("ul",null,null));
  
//    TinyReact.render(document.getElementById("root"),<div>Hello !!</div>);

//    TinyReact.render(document.getElementById("root"),<span>Hello World !!</span>);

 //TinyReact.render(document.getElementById("root"),<div>Hello !!</div>);

   
  
  //console.log(TinyReact.render(document.getElementById("root"), {type:"div",props:null,children:["Hello World"]}));
   

// var list1 = (<ul test="aaa">
//                 <li style="background:yellow" >item1</li>
//                 <li>item2</li>
//                 <li>test
//                         <ul>
//                             <li>abc</li>
//                         </ul>
//                     </li>
//             </ul>);

//   var list2 = (<ul test="bbb">
//                     <li style="background:cyan">item1</li>
//                     <li>item2</li>
//                     <li>item3</li>
//                     <li>test
//                         <ul>
//                             <li>def</li>
//                         </ul>
//                     </li>
//                 </ul>);
//   var list3 = (<ul><li>item11</li><li>item2</li><li>item3</li></ul>);

//   var list4 = (<ul><li>item11</li><li>item2</li><li>item31</li></ul>);

// TinyReact.render(document.getElementById("root"),list1);
// TinyReact.render(document.getElementById("root"),list2);

 var state=["item1","item2","item3"];


// // var li = state.map(item=>{
// //     return (<li>{item}</li>)
// // })

// var list = (
//     <ul>
//         {state.map(item=>{
//             return (<li>{item}</li>)
//         })
//         }
//     </ul>
// );

// var view=(
//     <div>
//         <input type="button" value="Update" onClick={updateData}></input>
//         {list}
//     </div>
// );

// TinyReact.render(document.getElementById("root"),view);

function updateData(){
    console.log("call updateData.....");
    var item = "item" + (state.length+1);
    state.push(item);

    reRender();
}

function reRender(){

    // var li = state.map(item=>{
    //     return (<li>{item}</li>)
    // })

    let list = (
        <ul>
            {state.map(item=>{
                return (<li>{item}</li>)
            })
            }
        </ul>
    );
    let view=(
        <div>
            <input type="button" value="Update" onClick={updateData}></input>
            {list}
        </div>
    );



    TinyReact.render(document.getElementById("root"),view);
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
