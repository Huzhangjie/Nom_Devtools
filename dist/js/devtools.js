// 与后台页面消息通信-长连接
let created = false;
let checkCount = 0;

chrome.devtools.network.onNavigated.addListener(createPanelIfHasNomUI);
const checkVueInterval = setInterval(createPanelIfHasNomUI, 1000);
createPanelIfHasNomUI();

function createPanelIfHasNomUI() {
  if (created || checkCount++ > 10) {
    return;
  }
  chrome.devtools.inspectedWindow.eval("!!(window.nomui)", (hasNomUI) => {
    if (!hasNomUI || created) {
      return;
    }
    clearInterval(checkVueInterval);
    created = true;
    createPanels();
  });
}

function createPanels() {
  chrome.devtools.panels.create(
    "NomUI",
    "icon.png",
    "../panel.html",
    function (extensionPanel) {
      let _window;
      const contentScriptData = [];

      // 1.与后台网页消息通信-长连接
      const port = chrome.runtime.connect({ name: "devtools" });
      // chrome.tabs.getCurrent(tab => {
      // chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {file: 'js/get-inst.js'});
      // })

      // 2.搭桥: 此步骤后，调动 background的即可通知到当前 devtools中
      port.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        name: "original",
      });

      // 3.监听来自页面中的事件，content-sctipt background devtool
      port.onMessage.addListener((message) => {
        // 3.1 通过 contentScriptReceiver 实现 devtools和 panelWindow 间的通信
        if (_window && _window.contentScriptReceiver) {
          _window.contentScriptReceiver(message);
        } else {
          // 3.2 panel页面还没 show过, 则先将事件存下来
          contentScriptData.push(message);
        }
      });

      // 执行代码
      const sendMessageToBackground = (message, callback) => {
        chrome.devtools.inspectedWindow.eval(message, (value) => {
          callback && callback(value);
        });
      };

      extensionPanel.onShown.addListener((panelWindow) => {
        _window = panelWindow;

        // 审查窗口
        _window.inspectedWindow = chrome.devtools.inspectedWindow;
    
        
        _window.inspectedWindow.eval(`
          console.log('_window.onShown', ${JSON.stringify(contentScriptData)}, ${contentScriptData.length})
        `,{
          useContentScriptContext: true
        })
        _window.respond = function (msg, callback) {
          sendMessageToBackground(msg, callback);
        };

        while (contentScriptData.length !== 0) {
          _window.contentScriptReceiver(contentScriptData.shift());
        }
      });
    }
  );
}
