const handlers = {
  init: function () {
    if (window.$app) {
      window.$app.$actions.$init(window.$app);
    }
  },

};

window.contentScriptReceiver = (data) => {
  chrome.devtools.inspectedWindow.eval(`
    console.log('contentScriptReceiver', ${data});
  `)

  const handler = handlers[data.name];

  if (handler) {
    handler(data.id, data.value);
  }
};

const init = (callback) => {
  let command = `
    const app = document.querySelector('.nom-app')
    app.childNodes[0].classList.add('current-nom-target')
    console.log('111', comp)

    window.postMessage({
      name: 'initDevtools',
    })
  `

  // if (window.respond) {
  //   window.respond(command, callback);
  // } else {
  //     // extensionPanel.onShown还未触发，respond未初始化
  //     setTimeout(() => {
  //       init(callback);
  //     }, 100);
  // }
  chrome.devtools.inspectedWindow.eval(command
  //   , (value) => {
  //   chrome.devtools.inspectedWindow.eval(`
  //     console.log('value111111111111111', value)
  //   `)
  //   callback && callback(value);
  // }
  );
}
const initDevTools = (value) => {
  console.log(value)
}

init(initDevTools)

new nomui.Rows({
  items: [
    {
      component: 'Textbox',
      label: '查询的值'
    },
    {
      component: 'Flex',
      gap: 'small',
      cols: [
        {
          grow: 1,
          component: 'Tree',
          dataFields: {
            key: 'text',
          },
          data: [
            {
              text: '节点 1',
              children: [
                { text: '节点 1.1', children: [{ text: '节点 1.1.1' }, { text: '节点 1.1.2' }] },
                { text: '节点 1.2' },
              ],
            },
            {
              text: '节点 2',
              children: [{ text: '节点 2.1' }, { text: '节点 2.2' }],
            },
          ],
        },
        {
          component: 'StaticText',
          value: '我是静态文本'
        }
      ]
    }
  ]
})