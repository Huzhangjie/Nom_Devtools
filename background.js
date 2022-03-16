// 作为content script 与 devtool 通信的桥
const connections = {};

chrome.runtime.onConnect.addListener(function (port) {
  const extensionListener = function (message, sender, sendResponse) {
    if (message.name == "NomPort") {
      connections[message.tabId] = port;
    }
  };
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);

    const tabs = Object.keys(connections);
    for (let i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// 接收内容脚本的消息，并给对应tab页发送消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('555555555555555', message, sender);
  // chrome.devtools.inspectedWindow.eval(`
  //   console.log('+++++++++++++++')
  // `)
  if (sender.tab) {
    const tabId = sender.tab.id;

    if (message.nomUIDetected) {
      // chrome.browserAction.setIcon({
      //     tabId,
      //     path: 'icons/icon-active.png',
      // });
      chrome.browserAction.setPopup({
          tabId,
          popup: 'popups/enabled.html',
      });
    }

    if (tabId in connections) {
      connections[tabId].postMessage(message);
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});
