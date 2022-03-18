let treeRef = null;

const handlers = {
  updateTree(id, value) {
    chrome.devtools.inspectedWindow.eval(`
      console.log('updateTree.....', ${JSON.stringify(id)}, ${JSON.stringify(value)})
    `,{
      useContentScriptContext: true
    })

    treeRef.update({ data: JSON.parse(JSON.stringify(value))});
  }
};

window.contentScriptReceiver = (data) => {
  const handler = handlers[data.name];

  if (handler) {
    handler(data.id, data.value);
  }
};


new nomui.Rows({
  items: [
    {
      component: "Textbox",
      label: "查询的值",
    },
    {
      component: "Flex",
      gap: "small",
      cols: [
        {
          grow: 1,
          component: "Tree",
          ref: (c) => {
            treeRef = c;
          },
          dataFields: {
            key: "text",
          },
          data: [
            {
              text: "节点 1",
              children: [
                {
                  text: "节点 1.1",
                  children: [{ text: "节点 1.1.1" }, { text: "节点 1.1.2" }],
                },
                { text: "节点 1.2" },
              ],
            },
            {
              text: "节点 2",
              children: [{ text: "节点 2.1" }, { text: "节点 2.2" }],
            },
          ],
        },
        {
          component: "StaticText",
          value: "我是静态文本",
        },
      ],
    },
  ],
});

// chrome.devtools.inspectedWindow.eval(`
//   console.log('1111111111');
//   window.postMessage({
//     name: 'initDevtools',
//   })
// `,{
//   useContentScriptContext: true,
// });