// 检测页面是否挂载
window.addEventListener("message", (e) => {
  if (e.source === window && e.data.nomUIDetected) {
    chrome.runtime.sendMessage(e.data);
  }
});
function detect(win) {
  setTimeout(() => {
    if (win.nomui) {
      win.postMessage({
        name: "paintRecording",
        nomUIDetected: true,
      }, "*");
    } else {
      win.postMessage({
        name: "paintRecording",
        nomUIDetected: false,
      }, "*");
    }
  }, 100);
}

if (document instanceof HTMLDocument) {
  const script = document.createElement("script");
  script.textContent = ";(" + detect.toString() + ")(window)";
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}
