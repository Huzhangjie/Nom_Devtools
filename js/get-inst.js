function isFunction(val) {
  return Object.prototype.toString.call(val) === "[object Function]";
}

const IGNORE_COMP_KEYS = [
  "element",
  "reference",
  "referenceComponent",
  "_placeHolderElement",
  "referenceElement",
  "within",
  "firstRender",
  "mixins",
  // "props",
  "root",
  "parent",
  "_propStyleClasses",
  "__handleClick",
  // "__handleMouseEnter",
  // "__handleMouseLeave",
];

// 监听message,当内容是initGetInst时调用getInst方法
window.addEventListener(
  "message",
  function (event) {
    console.log("1111111111111", event);
    if (event.data && event.data.name === "initGetInst") {
      getInst();
    }

    if (event.data && event.data.name === "initDevtools") {
      getInst();
    }
  },
  false
);

// 获取唯一标识的dom元素，打印其实例
function getInst() {
  const current = document.querySelector(".nom-app");
  const { component } = current;
  if (component) {
    // const obj = JSON.stringify(component, getCircularReplacer())
    const obj = getComponentTree(component);
    // const obj = JSON.stringify(getComponentTree(component));
    console.log("🚀 ~ file: get-inst.js ~ line 20 ~ getInst ~ obj", obj.children[0].children[1].children[0]);
    debugger
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

// 处理JSON.stringify循环引用报错
function getCircularReplacer() {
  const seen = new WeakSet();
  let count = 0
  return (key, value) => {
    count++
    // if(count > 728) {
    //   debugger
    // }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    if (
      value instanceof HTMLElement ||
      IGNORE_COMP_KEYS.includes(key) ||
      typeof value === "function"
    ) {
      return;
    }
    return value;
  
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
    } else if (isFunction(value)) {
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