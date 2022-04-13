import { INDICATOR_PROPS, isNullish } from '../utils'

// 具体的 props, data 数据部分 key, value
export function getContentChildren(data, level = 1) {
  return Object.entries(data).map(([key, value]) => {
    let objectChildRef = null

    const { valueText, hasExpand, textColor } = _getValueTextAmdColor(value)

    return {
      component: 'Flex',
      attrs: { style: { paddingLeft: `20px` } },

      rows: [
        {
          gap: 'small',
          expandable: {
            byClick: true,
            target: () => {
              return objectChildRef
            },
            byIndicator: true,
            indicator: INDICATOR_PROPS,
          },
          onConfig: ({ inst }) => {
            inst.setProps({
              cols: [
                hasExpand && inst.getExpandableIndicatorProps(false),
                ...[
                  { children: `${key}: `, styles: { text: 'indigo' } },
                  { children: valueText, styles: { text: textColor } },
                ],
              ],
            })
          },
          cols: [],
        },
        hasExpand && {
          hidden: true,
          ref: (c) => {
            objectChildRef = c
          },
          children: getContentChildren(value),
        },
      ],
    }
  })
}

function _getValueTextAmdColor(value) {
  const isValString = typeof value === 'string'
  const isValNumber = typeof value === 'number'
  const isValBoolean = typeof value === 'boolean'
  const isValObject = value && typeof value === 'object'
  const isValArray = Array.isArray(value)

  const hasExpand = isValArray || isValObject

  return {
    hasExpand,
    textColor: isNullish(value) || isValBoolean || isValNumber ? 'blue' : null,
    valueText: isValObject
      ? 'Object'
      : isValArray
      ? `Array[${value.length}]`
      : isValString
      ? `"${value}"`
      : `${value}`,
  }
}

let rightContentRef = {}
// 右侧的 props, data, methods等数据
export const getRightRows = (data) => {
  return ['props', 'data', 'methods'].map((item) => ({
    children: [
      { tag: 'hr' },
      {
        component: 'Flex',
        gap: 'small',
        onConfig: ({ inst }) => {
          inst.setProps({
            cols: [inst.getExpandableIndicatorProps(true), item],
          })
        },
        expandable: {
          byClick: true,
          target: () => {
            return rightContentRef[`${item}Ref`]
          },
          indicator: INDICATOR_PROPS,
        },
      },
      {
        ref: (c) => {
          rightContentRef[`${item}Ref`] = c
        },
        children: data && data[item] && getContentChildren(data[item]),
      },
    ],
  }))
}
