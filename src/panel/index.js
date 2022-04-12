import { getRightRows } from "./helper.js";

let treeRef = null;
let rightRowsRef = null; // 右侧的 props, data, methods的rowsRef
let lastMousemoveNode = null; // 上一次 mouseover 的节点

const handlers = {
  init() {
    getElements();
  },
  updateTree(id, value) {
    value = value.children[0];
    chrome.devtools.inspectedWindow.eval(
      `console.log('updateTree------------', ${JSON.stringify(id)}, ${JSON.stringify(value)})
      `,
      {useContentScriptContext: true}
    );
    treeRef.update({ data: [_parseTreeData(value)] });
  },
};

window.contentScriptReceiver = (data) => {
  const handler = handlers[data.name];

  if (handler) {
    handler(data.id, data.value);
  }
};

new nomui.Component({
  children: [
    {
      component: "Flex",
      justify: "between",
      align: "center",
      styles: { border: ["bottom"] },
      cols: [
        {
          component: "Button",
          text: "NomDevtool",
          type: "text",
          tooltip: "点击跳转",
        },
        {
          component: "List",
          gutter: "sm",
          items: [
            {
              type: "focus",
              tooltip: "Select component in the page",
              onClick(args) {
                console.log(
                  "🚀 ~ file: basic.js ~ line 141 ~ onClick ~ args",
                  args
                );
              },
            },
            { type: "refresh", tooltip: "Force refresh" },
          ],
          itemDefaults: {
            component: "Icon",
          },
        },
      ],
    },
    {
      component: "Cols",
      strechIndex: 1,
      align: "start",
      items: [
        {
          component: "Tree",
          attrs: {
            style: {
              height: "100vh",
              overflowY: "auto",
            },
            onmousemove({ target }) {
              if (
                target.component.componentType !== "TreeNodeContent" ||
                target === lastMousemoveNode
                )
                return;
                lastMousemoveNode = target;

                chrome.devtools.inspectedWindow.eval(
                  `console.log('123', ${JSON.stringify(target.component.node.props.data) })`,
                  {
                    useContentScriptContext: true
                  }
                )
              chrome.devtools.inspectedWindow.eval(`
                window.postMessage({
                  name: 'TO_BACK_COMPONENT_MOUSE_OVER',
                  payload: ${JSON.stringify(target.component.node.props.data)}
                })
              `, { useContentScriptContext: true })
            },
          },
          ref: (c) => {
            treeRef = c;
          },
          expandable: { byIndicator: true },
          onNodeClick({ node }) {
            respond(`
              // console.log('------------------------')
              0 === false
            `, (val) => {
              chrome.devtools.inspectedWindow.eval(
                `console.log('val', ${JSON.stringify(val)})`,
                { useContentScriptContext: true }
              )
            })
            rightRowsRef.update({ items: getRightRows(node.props.data) });
          },
          dataFields: {
            key: "key",
            text: "componentType",
          },
          data: [],
        },
        {
          component: "Rows",
          attrs: {
            style: {
              height: "100vh",
              overflowY: "auto",
            },
          },
          ref: (c) => {
            rightRowsRef = c;
          },
          items: getRightRows(),
        },
      ],
    },
  ],
});

chrome.devtools.inspectedWindow.eval(
  `
  window.postMessage({
    name: 'initDevtools',
  })
`,
  // {
  //   useContentScriptContext: true,
  // }
);
