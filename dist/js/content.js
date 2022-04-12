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
  if (e.source === window && e.data.name === "updateTree") {
    chrome.runtime.sendMessage({
      name: 'updateTree',
      value: e.data.data
    });
  }
}, false);
