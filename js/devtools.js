// 与后台页面消息通信-长连接
// const port = chrome.runtime.connect({ name: "nomui_devtools" });

// // 往后台页面发送消息
// port.postMessage({
//   name: "NomPort",
//   tabId: chrome.devtools.inspectedWindow.tabId,
// });

// // 创建自定义侧边栏
// chrome.devtools.panels.elements.createSidebarPane("NomUI", function (sidebar) {
//   chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
//     chrome.devtools.inspectedWindow.eval("getInst($0)", {
//       useContentScriptContext: true,
//     });
//   });
//   // 监听后台页面消息，更新审查元素的NomUI面板
//   port.onMessage.addListener((msg) => {
//     console.log('4444444444444', msg);
//     sidebar.setObject(msg);
//   });
// });

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

      // 与后台网页消息通信-长连接
      const port = chrome.runtime.connect({ name: "devtools" });
      // 监听来自页面中的事件，content-sctipt background devtool
      port.onMessage.addListener((message) => {
        console.log("🚀 ~ file: .port", message)
      });
      port.postMessage({
        name: "original",
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
      // 执行代码
      const sendMessageToBackground = (message, callback) => {
        chrome.devtools.inspectedWindow.eval(message, (value) => {
          callback && callback(value);
        });
      };

      extensionPanel.onShown.addListener((panelWindow) => {
        let obj = '123'

        // _window = panelWindow;
        // // 审查窗口
        // _window.inspectedWindow = chrome.devtools.inspectedWindow;

        chrome.devtools.inspectedWindow.eval(`
          console.log('3333333333333333333',  obj);
        `,
        {
            useContentScriptContext: true,
          }
        );
        // _window.respond = function (msg, callback) {
        //   sendMessageToBackground(msg, callback);
        // };

        // while (contentScriptData.length !== 0) {
        //   _window.contentScriptReceiver(contentScriptData.shift());
        // }
      });

      // extensionPanel.onHidden.addListener((e) => {
      //   chrome.devtools.inspectedWindow.eval(`
      //     console.log('this', this, ${e})
      //   `);
      // });
    }
  );
}
