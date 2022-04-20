// 从inst中传过来的数据无法直接使用, children会不出来
function _parseTreeData(value) {
  return {
    ...value,
    componentType: `<${value.componentName || value.componentType}>`,
    children: value.children.map((child) => _parseTreeData(child)),
  };
}

// 展开配置
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

// 值为 null 或 undefined
function isNullish(val) {
  return val === null || val === undefined;
}

/**
 * @param {*} data 具体的对象数据
 * @param {*} contentType  'props' | 'data' | 'methods'
 * @returns
 */
function getContentChildren(data, contentType) {
  return Object.entries(data).map(([key, value]) => {
    let objectChildRef = null;

    const { valueText, hasExpand, textColor } = _getValueTextAndColor(
      value,
      contentType
    );

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
                  { children: `${key}: `, styles: { text: "indigo" } },
                  { children: valueText, styles: { text: textColor } },
                ],
              ],
            });
          },
          cols: [],
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
}

function _getValueTextAndColor(value, contentType) {
  const isValString = typeof value === "string";
  const isValNumber = typeof value === "number";
  const isValBoolean = typeof value === "boolean";
  const isValObject = value && typeof value === "object";
  const isValArray = Array.isArray(value);
  const isMethodsContent = contentType === "methods";

  const hasExpand = isValArray || isValObject;

  return {
    hasExpand,
    textColor:
      isNullish(value) || isValBoolean || isValNumber || isMethodsContent
        ? "blue"
        : null,
    valueText: isMethodsContent
      ? value.replace(/function (\(.+\)) {(.|\n)+$/, "f $1")
      : isValArray
      ? `Array[${value.length}]`
      : isValObject
      ? "Object"
      : isValString
      ? `"${value}"`
      : `${value}`,
  };
}

let rightContentRef = {};
// 右侧的 props, data, methods等数据
const getRightRows = (data) => {
  return ["props", "data", "methods"].map((item) => ({
    children: [
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
        children: data && data[item] && getContentChildren(data[item], item),
      },
      { tag: "hr" },
    ],
  }));
};

let pickingComponentModal = null;
function startPickingComponent() {
  pickingComponentModal = new nomui.Modal({
    content: {
      component: "Rows",
      styles: { padding: 2 },
      items: [
        {
          component: "Icon",
          type: "focus",
          styles: { text: ["success", "1d75x"] },
        },
        { children: "Click on a component on the page to select it" },
        {
          component: "Button",
          text: "Cancel",
          onClick() {
            pickingComponentModal.close();
            chrome.devtools.inspectedWindow.eval(
              `
              window.postMessage({
                name: 'TO_BACK_COMPONENT_PICK_CANCELED',
              })
            `
            );
          },
        },
      ],
    },
  });

  chrome.devtools.inspectedWindow.eval(
    `
    console.log('-----------------');
    window.postMessage({
      name: 'TO_BACK_COMPONENT_PICK',
    })
  `
  );
}
function stopPickingComponent() {
  pickingComponentModal.close();
}

let treeRef = null;
let rightRowsRef = null; // 右侧的 props, data, methods的rowsRef
let lastMousemoveNode = null; // 上一次 mouseover 的节点

const handlers = {
  init() {
    getElements();
  },
  updateTree(value) {
    value = value.children[0];
    chrome.devtools.inspectedWindow.eval(
      `console.log('updateTree------------', ${JSON.stringify(value)})`,
      { useContentScriptContext: true }
    );
    treeRef.update({ data: [_parseTreeData(value)] });
  },
  TO_FRONT_COMPONENT_PICK({ key }) {
    // 隐藏modal
    stopPickingComponent();

    treeRef.selectNode(key);
    const node = treeRef.getNode(key);
    node && rightRowsRef.update({ items: getRightRows(node.props.data) });
  },
  TO_FRONT_COMPONENT_PICK_CANCELED() {
    stopPickingComponent();
  },
};

window.contentScriptReceiver = (data) => {
  const handler = handlers[data.name];

  if (handler) {
    handler(data.payload);
  }
};

new nomui.Component({
  children: [
    {
      component: "Flex",
      justify: "between",
      align: "center",
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
              onClick() {
                startPickingComponent();
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
      component: "Flex",
      wrap: true,
      cols: [
        {
          span: 6,
          styles: { border: ["top", "right"] },
          children: {
            component: "Tree",
            attrs: {
              style: {
                height: "95vh",
                overflowY: "auto",
              },
              onmousemove({ target }) {
                if (
                  !target.component ||
                  target.component.componentType !== "TreeNodeContent" ||
                  target === lastMousemoveNode
                )
                  return;
                lastMousemoveNode = target;

                chrome.devtools.inspectedWindow.eval(
                  `
                  window.postMessage({
                    name: 'TO_BACK_COMPONENT_MOUSE_OVER',
                    payload: ${JSON.stringify(target.component.node.props.data)}
                  })
                `,
                  { useContentScriptContext: true }
                );
              },
              onmouseleave() {
                chrome.devtools.inspectedWindow.eval(
                  `
                  window.postMessage({
                    name: 'TO_BACK_COMPONENT_MOUSE_LEAVE',
                    payload: {}
                  })
                  `
                );
              },
            },
            ref: (c) => {
              treeRef = c;
            },
            expandable: { byIndicator: true },
            onNodeClick({ node }) {
              rightRowsRef.update({ items: getRightRows(node.props.data) });
            },
            dataFields: {
              key: "key",
              text: "componentType",
            },
            data: [],
          },
        },
        {
          span: 6,
          styles: { border: ["top"] },
          children: {
            component: "Rows",
            attrs: {
              style: {
                height: "95vh",
                overflowY: "auto",
              },
            },
            ref: (c) => {
              rightRowsRef = c;
            },
            items: getRightRows(),
          },
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
`
  // {
  //   useContentScriptContext: true,
  // }
);
