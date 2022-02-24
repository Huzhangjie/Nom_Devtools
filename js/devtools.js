// 与后台页面消息通信-长连接
const port = chrome.runtime.connect({ name: "nomui_devtools" });

// 往后台页面发送消息
port.postMessage({
  name: "NomPort",
  tabId: chrome.devtools.inspectedWindow.tabId,
});

// 创建自定义侧边栏
chrome.devtools.panels.elements.createSidebarPane("NomUI", function (sidebar) {
  chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
    chrome.devtools.inspectedWindow.eval("getInst($0)", {
      useContentScriptContext: true,
    });
  });
  // 监听后台页面消息，更新审查元素的NomUI面板
  port.onMessage.addListener((msg) => {
    sidebar.setObject(msg);
  });
});


