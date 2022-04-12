import { INDICATOR_PROPS } from "../utils";

// 具体的 props, data 数据部分 key, value
export function getContentChildren (data, level = 1) {
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
      component: 'Flex',
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


let rightContentRef = {};
// 右侧的 props, data, methods等数据
export const getRightRows = (data) => {
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