import { highlight, unHighlight } from './highlighter'
import { getCircularReplacer, getComponentTree } from '../utils'
import ComponentPicker from './component-picker'

const componentPicker = new ComponentPicker()

window.addEventListener(
  'message',
  function (event) {
    console.log('1111111111111', event)
    if (!event.data) return
    const { name, payload } = event.data

    if (name === 'initDevtools') {
      getInst()
    } else if (name === 'TO_BACK_COMPONENT_MOUSE_OVER') {
      hightlightDOM(payload)
    } else if (name === 'TO_BACK_COMPONENT_MOUSE_LEAVE') {
      unHighlight()
    } else if (name === 'TO_BACK_COMPONENT_PICK') { // 给 window加上 mouseover事件
      componentPicker.startSelecting()
    } else if (name === 'TO_BACK_COMPONENT_PICK_CANCELED') { // 去掉 window 的mouseover事件
      componentPicker.stopSelecting()
    }
  },
  false,
)

// 从dom节点中获取完整的 componentData 的数据
function getInst() {
  const current = document.querySelector('.nom-app')
  const { component } = current
  if (component) {
    const obj = getComponentTree(component)
    console.log('🚀 ~ file: get-inst.js ~ line 20 ~ getInst ~ obj', obj)
    window.postMessage({
      name: 'updateTree',
      payload: JSON.parse(JSON.stringify(obj, getCircularReplacer())),
    })
  }
}

/**
 * @param {string} __nom_selector 选择器
 * @param {key} key component的Key
 */
function hightlightDOM({ __nom_selector, key }) {
  highlight({ __nom_selector, key })
}
