import { highlight } from "./highlighter";
import { IGNORE_COMP_KEYS } from "../utils";

window.addEventListener(
  "message",
  function (event) {
    console.log("1111111111111", event);
    if (event.data && event.data.name === "initDevtools") {
      getInst();
    }

    if (event.data && event.data.name === "TO_BACK_COMPONENT_MOUSE_OVER") {
      hightlightDOM(event.data.payload)
    }

  },
  false
);

// 从dom节点中获取完整的 componentData 的数据
function getInst() {
  const current = document.querySelector(".nom-app");
  const { component } = current;
  if (component) {
    const obj = getComponentTree(component);
    console.log("🚀 ~ file: get-inst.js ~ line 20 ~ getInst ~ obj", obj);
    window.postMessage({
      name: "updateTree",
      data: JSON.parse(JSON.stringify(obj, getCircularReplacer())),
    });
  }
}

/**
 * 从组件中获取 devtools中的 Tree数据
 * @param {*} component 组件对象
 * @param {*} lastSelector 选择器名称
 * @returns 
 */
 function getComponentTree(component, lastSelector = null) {
  const {componentType} = component

  const { data, methods} = getDataAndMethodsFormComp(component)

  delete component.props.children
  // delete component.props.reference

  // 选择器类名
  const __nom_selector = getSelectorFormComp(component, lastSelector)

  return {
    componentType: componentType,
    key: component.key,
    __nom_selector,
    props: component.props,
    data,
    methods,
    children: component
      .getChildren()
      .filter((child) => child)
      .map((child) => getComponentTree(child, __nom_selector)),
  };
}

// 获取 data 和 methods
function getDataAndMethodsFormComp(component) {
  let data = {},
  methods = {};
  Object.keys(component).forEach((key) => {
    let value = component[key];
    if (IGNORE_COMP_KEYS.includes(key) || key === 'props') {
      return;
    } else if (nomui.utils.isFunction(value)) {
      methods[key] = value;
    } else {
      data[key] = value
    }
  });

  return {data, methods}
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


/**
 * @param {string} __nom_selector 选择器 
 * @param {key} key component的Key
 */
 function hightlightDOM({__nom_selector, key }) {
  highlight({__nom_selector, key })
}