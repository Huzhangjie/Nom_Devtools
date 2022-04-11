const INDICATOR_PROPS = {
  component: "Icon",
  expandable: {
    expandedProps: {
      type: "sort-down",
    },
    collapsedProps: {
      type: "sort-right",
    },
  },
};

function proxyConsole(msg, type = '----') {
  chrome.devtools.inspectedWindow.eval(
    `console.log('${type}', ${JSON.stringify(msg)})`,
    {
      useContentScriptContext: true
    }
  );
}

let treeRef = null;
let rightRowsRef = null; // 右侧的 props, data, methods的rowsRef
let lastMousemoveNode = null; // 上一次 mouseover 的节点
const rightContentRef = {};


const handlers = {
  init() {
    getElements();
  },
  updateTree(id, value) {
    value = value.children[0];
    chrome.devtools.inspectedWindow.eval(
      `
      console.log('updateTree------------', ${JSON.stringify(id)}, ${JSON.stringify(
        value
      )})
    `,
      {
        useContentScriptContext: true,
      }
    );
    // treeRef.update({data: value})
    treeRef.update({ data: [_parseTreeData(value)] });
  },
};

function _parseTreeData(value) {
  return {
    ...value,
    componentType: `<${value.componentName || value.componentType}>`,
    children: value.children.map((child) => _parseTreeData(child)),
  };
}

window.contentScriptReceiver = (data) => {
  const handler = handlers[data.name];

  if (handler) {
    handler(data.id, data.value);
  }
};

// 具体的 props, data 数据部分 key, value
const getContentChildren = (data, level = 1) => {
  return Object.entries(data).map(([key, value]) => {
    let objectChildRef = null;
    const isValueString = typeof value === "string";
    const isValueNumber = typeof value === "number";
    console.log("🚀 ~ file: basic.js ~  ~ level", level, isValueNumber);
    const isValueObject = nomui.utils.isPlainObject(value);
    const isValueArray = Array.isArray(value);

    const hasExpand = isValueArray || isValueObject;

    const valueText = isValueObject
      ? "Object"
      : isValueArray
      ? `Array[${value.length}]`
      : isValueString
      ? `"${value}"`
      : value;

    return {
      component: "Flex",
      attrs: { style: { paddingLeft: `20px` } },

      rows: [
        {
          gap: "small",
          expandable: {
            byClick: true,
            target: () => {
              return objectChildRef;
            },
            byIndicator: true,
            indicator: INDICATOR_PROPS,
          },
          onConfig: ({ inst }) => {
            inst.setProps({
              cols: [
                hasExpand && inst.getExpandableIndicatorProps(false),
                ...[
                  {
                    tag: "span",
                    children: `${key}: `,
                    styles: { text: "indigo" },
                  },
                  { tag: "span", children: valueText },
                ],
              ],
            });
          },
          cols: [
            { tag: "span", children: `${key}: `, styles: { text: "indigo" } },
            { tag: "span", children: valueText },
          ],
        },
        hasExpand && {
          hidden: true,
          ref: (c) => {
            objectChildRef = c;
          },
          children: getContentChildren(value),
        },
      ],
    };
  });
};

// 右侧的 props, data, methods等数据
const getRightRows = (data) => {
  return ["props", "data", "methods"].map((item) => ({
    children: [
      { tag: "hr" },
      {
        component: "Flex",
        gap: "small",
        onConfig: ({ inst }) => {
          inst.setProps({
            cols: [inst.getExpandableIndicatorProps(true), item],
          });
        },
        expandable: {
          byClick: true,
          target: () => {
            return rightContentRef[`${item}Ref`];
          },
          indicator: INDICATOR_PROPS,
        },
      },
      {
        ref: (c) => {
          rightContentRef[`${item}Ref`] = c;
        },
        children: data && data[item] && getContentChildren(data[item]),
      },
    ],
  }));
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
