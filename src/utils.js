// 从inst中传过来的数据无法直接使用, children会不出来
export function _parseTreeData(value) {
  return {
    ...value,
    componentType: `<${value.componentName || value.componentType}>`,
    children: value.children.map((child) => _parseTreeData(child)),
  };
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
