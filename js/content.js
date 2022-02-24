// dom加载完成后注入自定义JS
document.addEventListener("DOMContentLoaded", function () {
  injectCustomJs();
});

function injectCustomJs(jsPath) {
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

// 审查元素改变时调用此方法，给当前元素添加唯一标识并发送消息触发自定义JS内部的监听事件
function getInst(ele) {
  const old = document.querySelectorAll('.current-nom-target')
  if (old.length) {
    for (let i=0; i<old.length; i++) {
      old[i].classList.remove('current-nom-target')
    }
  }
  ele.classList.add('current-nom-target')
  window.postMessage("initGetInst")
}

// 监听最新的NomInst信息，通信给devtool.js
window.addEventListener(
  "message",
  function (event) {
    if (event.data && event.data.title === "NomInst") {
      chrome.runtime.sendMessage(event.data.params)
      
    }
  },
  false
);