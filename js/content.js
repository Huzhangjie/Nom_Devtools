// dom加载完成后注入自定义JS
document.addEventListener("DOMContentLoaded", function () {
  injectCustomJs();
});

function injectCustomJs(jsPath) {
  // jsPath = jsPath || "js/detector.js";
  jsPath = jsPath || "js/get-inst.js";
  var temp = document.createElement("script");
  temp.setAttribute("type", "text/javascript");
  temp.src = chrome.runtime.getURL(jsPath);
  temp.onload = function () {
    // 放在页面不好看，执行完后移除掉
    this.parentNode.removeChild(this);
  };
  document.head.appendChild(temp);
}


window.addEventListener("message", (e) => {
  if (e.source === window && e.data.name === "initDevtools") {
    getInst()
  }
  // if (e.source === window && e.data.name === "initGetInst") {
    // let bodyComp = document.querySelector('.nom-panel')
    // console.log("🚀 ~ file: content.js ~ line 6 ~ bodyComp", bodyComp, bodyComp.component)
    // let value = JSON.stringify(component || {}, getCircularReplacer())
    // console.log("🚀 value-------------------",  value)
    // chrome.runtime.sendMessage({
    //   name: 'updateTree',
    //   value: []
    // });
  //   const current = document.querySelector(".current-nom-target");
  //   const { component } = current;
  //   console.log('222222222222222222 current', current, component)
  //   if (component) {
  //     const obj = JSON.stringify(component,getCircularReplacer())

  //     console.log("🚀 ~ file: content.js ~ line 34 ~ window.addEventListener ~ obj", obj)
  //     chrome.runtime.sendMessage({
  //       name: 'updateTree',
  //       value: JSON.parse(obj)
  //     });
  //   } 
  // }
}, false);

// 处理JSON.stringify循环引用报错
// const getCircularReplacer = () => {
//   const seen = new WeakSet();
//   return (key, value) => {
//     if (typeof value === "object" && value !== null) {
//       if (seen.has(value)) {
//         return;
//       }
//       seen.add(value);
//     }
//     return value;
//   };
// };

// 审查元素改变时调用此方法，给当前元素添加唯一标识并发送消息触发自定义JS内部的监听事件
function getInst1(ele) {
  console.log("🚀 ~ file: content.js ~ line 63 ~ getInst1 ~ ele", ele)
  const old = document.querySelectorAll('.current-nom-target')
  if (old.length) {
    for (let i=0; i<old.length; i++) {
      old[i].classList.remove('current-nom-target')
    }
  }
  if(!ele) {
    ele = document.querySelector('.nom-panel')
  }
  ele.classList.add('current-nom-target')
  console.log('00000000000000000', ele)
  window.postMessage({name: 'initGetInst'})
}

// // 监听最新的NomInst信息，通信给devtool.js
// window.addEventListener(
//   "message",
//   function (event) {
//     console.log('33333333333333', event);
//     if (event.data && event.data.title === "NomInst") {
//       console.log('33333333-1111111111111111', event);
//       chrome.runtime.sendMessage(event.data.params)
//     }
//   },
//   false
// );
