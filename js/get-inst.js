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

function getComponentTree(component) {
  let data = {},
    methods = {};

  const {componentType} = component

  Object.keys(component).forEach((key) => {
    let value = component[key];
    if (IGNORE_COMP_KEYS.includes(key) || key === 'props') {
      return;
    } else if(componentType === 'Grid' && [].includes(key)) {
      return
    } else if (isFunction(value)) {
      methods[key] = value;
    } else {
      data[key] = value
    }
  });

  delete component.props.children
  // delete component.props.reference

  return {
    componentType: componentType,
    key: component.key,
    props: component.props,
    data,
    // data: componentType === 'Grid' ? {} : data,
    methods,
    children: component
      .getChildren()
      .filter((child) => child)
      .map((child) => getComponentTree(child)),
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
