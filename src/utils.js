// 从inst中传过来的数据无法直接使用, children会不出来
export function _parseTreeData(value) {
  return {
    ...value,
    componentType: `<${value.componentName || value.componentType}>`,
    children: value.children.map((child) => _parseTreeData(child)),
  }
}

// 展开配置
export const INDICATOR_PROPS = {
  component: 'Icon',
  expandable: {
    expandedProps: {
      type: 'sort-down',
    },
    collapsedProps: {
      type: 'sort-right',
    },
  },
}

// 无法从dom带到devtools的 key
export const IGNORE_COMP_KEYS = [
  'element',
  'reference',
  'referenceComponent',
  '_placeHolderElement',
  'referenceElement',
  'within',
  'firstRender',
  'mixins',
  // "props",
  'root',
  'parent',
  '_propStyleClasses',
  '__handleClick',
  // "__handleMouseEnter",
  // "__handleMouseLeave",
]

// 处理JSON.stringify循环引用报错
export function getCircularReplacer() {
  const seen = new WeakSet()
  let count = 0
  return (key, value) => {
    count += 1
    // if (count > 26595 && count % 2 === 0) {
    //   debugger
    // }
    if (
      value === window ||
      value instanceof HTMLElement ||
      IGNORE_COMP_KEYS.includes(key) ||
      typeof value === 'function'
    ) {
      return
    }
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

/**
 * 递归从组件中获取 devtools中的 Tree数据
 * @param {*} component 组件对象
 * @param {*} lastSelector 选择器名称
 * @returns
 */
export function getComponentTree(component, lastSelector = null) {
  const { componentType } = component

  const { data, methods } = getDataAndMethodsFormComp(component)
  data.selectable = {
    byClick: true,
    id: '123',
  }

  delete component.props.children
  // delete component.props.reference

  // 选择器类名
  const __nom_selector = getSelectorFormComp(component, lastSelector)

  return {
    componentType: componentType,
    key: component.key,
    __nom_selector,
    // props: {},
    props: component.props,
    data,
    methods,
    children: component
      .getChildren()
      .filter((child) => child)
      .map((child) => getComponentTree(child, __nom_selector)),
  }
}

// 获取 data 和 methods
function getDataAndMethodsFormComp(component) {
  let data = {},
    methods = {}
  Object.keys(component).forEach((key) => {
    let value = component[key]
    if (IGNORE_COMP_KEYS.includes(key) || key === 'props' || value instanceof HTMLElement) {
      return
    } else if (nomui.utils.isFunction(value)) {
      methods[key] = value
    } else {
      data[key] = value
    }
  })

  return { data, methods }
}

/**
 * @param {*} component 当前组件对象
 * @param {*} lastSelector 上一级的选择器
 * @returns 组件的选择器类名 ex: body > div.nom-xxx > xxx
 */
function getSelectorFormComp(component, lastSelector) {
  const tag = component.props.tag
  const classList = Array.from(component.element.classList)

  const currentSel = classList.length ? `${tag}.${classList.join('.')}` : tag

  return lastSelector ? `${lastSelector} > ${currentSel}` : currentSel
}

// 值为 null 或 undefined
export function isNullish(val) {
  return val === null || val === undefined
}
