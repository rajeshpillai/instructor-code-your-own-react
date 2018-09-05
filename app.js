/** @jsx TinyReact.h */

var state = ["item1", "item2"];

function addData() {
  console.log("call updateData.....");
  var item = "item" + (state.length + 1);
  state.push(item);
  reRender();
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
  let view = (
    <div>
      <input type="button" value="Add" onClick={addData} />
      {list}
    </div>
  );
  TinyReact.render(document.getElementById("root"), view);
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
