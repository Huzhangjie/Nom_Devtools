import { getRightRows, startPickingComponent, stopPickingComponent } from './helper.js'
import { _parseTreeData } from '../utils'

let treeRef = null
let rightRowsRef = null // 右侧的 props, data, methods的rowsRef
let lastMousemoveNode = null // 上一次 mouseover 的节点

const handlers = {
  init() {
    getElements()
  },
  updateTree(value) {
    value = value.children[0]
    chrome.devtools.inspectedWindow.eval(
      `console.log('updateTree------------', ${JSON.stringify(value)})`,
      { useContentScriptContext: true },
    )
    treeRef.update({ data: [_parseTreeData(value)] })
  },
  TO_FRONT_COMPONENT_PICK({ key }) {
    // 隐藏modal
    stopPickingComponent()

    treeRef.selectNode(key)
    const node = treeRef.getNode(key)
    node && rightRowsRef.update({ items: getRightRows(node.props.data) })
  },
  TO_FRONT_COMPONENT_PICK_CANCELED() {
    stopPickingComponent()
  },
}

window.contentScriptReceiver = (data) => {
  const handler = handlers[data.name]

  if (handler) {
    handler(data.payload)
  }
}

new nomui.Component({
  children: [
    {
      component: 'Flex',
      justify: 'between',
      align: 'center',
      cols: [
        {
          component: 'Button',
          text: 'NomDevtool',
          type: 'text',
          tooltip: '点击跳转',
        },
        {
          component: 'List',
          gutter: 'sm',
          items: [
            {
              type: 'focus',
              tooltip: 'Select component in the page',
              onClick() {
                startPickingComponent()
              },
            },
            { type: 'refresh', tooltip: 'Force refresh' },
          ],
          itemDefaults: {
            component: 'Icon',
          },
        },
      ],
    },
    {
      component: 'Flex',
      wrap: true,
      cols: [
        {
          span: 6,
          styles: { border: ['top', 'right'] },
          children: {
            component: 'Tree',
            attrs: {
              style: {
                height: '95vh',
                overflowY: 'auto',
              },
              onmousemove({ target }) {
                if (
                  !target.component ||
                  target.component.componentType !== 'TreeNodeContent' ||
                  target === lastMousemoveNode
                )
                  return
                lastMousemoveNode = target

                chrome.devtools.inspectedWindow.eval(
                  `
                  window.postMessage({
                    name: 'TO_BACK_COMPONENT_MOUSE_OVER',
                    payload: ${JSON.stringify(target.component.node.props.data)}
                  })
                `,
                  { useContentScriptContext: true },
                )
              },
              onmouseleave() {
                chrome.devtools.inspectedWindow.eval(
                  `
                  window.postMessage({
                    name: 'TO_BACK_COMPONENT_MOUSE_LEAVE',
                    payload: {}
                  })
                  `,
                )
              },
            },
            ref: (c) => {
              treeRef = c
            },
            expandable: { byIndicator: true },
            onNodeClick({ node }) {
              rightRowsRef.update({ items: getRightRows(node.props.data) })
            },
            dataFields: {
              key: 'key',
              text: 'componentType',
            },
            data: [],
          },
        },
        {
          span: 6,
          styles: { border: ['top'] },
          children: {
            component: 'Rows',
            attrs: {
              style: {
                height: '95vh',
                overflowY: 'auto',
              },
            },
            ref: (c) => {
              rightRowsRef = c
            },
            items: getRightRows(),
          },
        },
      ],
    },
  ],
})

chrome.devtools.inspectedWindow.eval(
  `
  window.postMessage({
    name: 'initDevtools',
  })
`,
  // {
  //   useContentScriptContext: true,
  // }
)
