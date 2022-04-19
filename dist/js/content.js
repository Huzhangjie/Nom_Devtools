// dom加载完成后注入自定义JS
document.addEventListener('DOMContentLoaded', function () {
  injectCustomJs()
})

function injectCustomJs(jsPath) {
  jsPath = jsPath || "js/detector.js";
  var temp = document.createElement('script')
  temp.setAttribute('type', 'text/javascript')
  temp.src = chrome.runtime.getURL(jsPath)
  temp.onload = function () {
    // 放在页面不好看，执行完后移除掉
    this.parentNode.removeChild(this)
  }
  document.head.appendChild(temp)
}

window.addEventListener(
  'message',
  (e) => {
    const { name, payload } = e.data
    if (e.source !== window) return

    // detector判断是存在nomui后，引入get-inst.js
    if(name === 'NOM_DETECTOR') {
      injectCustomJs('js/get-inst.js')
      chrome.runtime.sendMessage(e.data);

    } else if (name === 'updateTree') {
      chrome.runtime.sendMessage({
        name: 'updateTree',
        payload,
      })
    } else if (name === 'TO_FRONT_COMPONENT_PICK') { // 选中dom 找到对应的 panel节点
      chrome.runtime.sendMessage({
        name: 'TO_FRONT_COMPONENT_PICK',
        payload,
      })
    } else if (name === 'TO_FRONT_COMPONENT_PICK_CANCELED') {
      chrome.runtime.sendMessage({
        name: 'TO_FRONT_COMPONENT_PICK_CANCELED',
        payload,
      })
    }
  },
  false,
)
