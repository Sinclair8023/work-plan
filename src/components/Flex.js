/**
 * Created by Sinclair on 2017/6/2.
 */
import PropTypes from 'prop-types'

import React from 'react'
const styles = { // 注：如果需要兼容性设置flex属性，可以在对应位置按顺序补充浏览器前缀
  flex: { display: 'flex' },
  dir: {
    row: { flexDirection: 'row' },
    rowR: { flexDirection: 'row-reverse' },
    column: { flexDirection: 'column' },
    columnR: { flexDirection: 'column-reverse' },
  },
  justify: {
    start: { justifyContent: 'flex-start' },
    end: { justifyContent: 'flex-end' },
    center: { justifyContent: 'center' },
    between: { justifyContent: 'space-between' },
    around: { justifyContent: 'space-around' },
  },
  alignItems: {
    start: { alignItems: 'flex-start' },
    end: { alignItems: 'flex-end' },
    center: { alignItems: 'center' },
    baseline: { alignItems: 'baseline' },
    stretch: { alignItems: 'stretch' },
  },
  alignSelf: {
    start: { alignSelf: 'flex-start' },
    end: { alignSelf: 'flex-end' },
    center: { alignSelf: 'center' },
    baseline: { alignSelf: 'baseline' },
    stretch: { alignSelf: 'stretch' },
    auto: { alignSelf: 'auto' }
  },
  alignContent: {
    start: { alignContent: 'flex-start' },
    end: { alignContent: 'flex-end' },
    center: { alignContent: 'center' },
    between: { alignContent: 'space-between' },
    around: { alignContent: 'space-around' },
    stretch: { alignContent: 'stretch' },
  },
  wrap: {
    nowrap: { flexWrap: 'nowrap' },
    wrap: { flexWrap: 'wrap' },
    wrapR: { flexWrap: 'wrap-reverse' },
    true: { flexWrap: 'wrap' },
    false: { flexWrap: 'nowrap' },
  }
}
const Flex = (props) => {
  let { dir, justify, align, Component, style, wrap, width, height, alignContent, order, getRef, ...others } = props
  style = {
    ...styles.flex,
    ...styles.wrap[wrap],
    ...styles.dir[dir],
    ...styles.justify[justify],
    ...styles.alignItems[align],
    ...styles.alignContent[alignContent],
    order,
    ...style,
  }
  if (width !== undefined) style.width = width
  if (height !== undefined) style.height = height
  if (typeof width === 'number') style.minWidth = width
  if (typeof height === 'number') style.minHeight = height
  return (
    <Component ref={getRef} style={style} {...others} />
  )
}
Flex.defaultProps = {
  dir: 'row', // 主轴方向
  justify: 'start', // 主轴对齐方式
  align: 'start', // 交叉轴对齐方式
  Component: 'div', // render as
  style: {}, // 自定义行内css
  wrap: 'nowrap', // 换行 nowrap wrap wrapR
  alignContent: 'start', // 多轴线对齐方式
  order: 0, // 排序序号 排序方式从小到大
  getRef: (ref) => ref, // 获取ref stateless component 只好这么处理了
}
Flex.propTypes = {
  dir: PropTypes.oneOf(['row', 'column', 'rowR', 'columnR']),
  justify: PropTypes.oneOf(['start', 'end', 'center', 'between', 'around']),
  align: PropTypes.oneOf(['start', 'end', 'center', 'baseline', 'stretch']),
  Component: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  style: PropTypes.object,
  wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrapR', true, false]),
  alignContent: PropTypes.oneOf(['start', 'end', 'center', 'between', 'around', 'stretch']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  order: PropTypes.number,
  getRef: PropTypes.func,
}
const Item = (props) => {
  let { grow, Component, flex, style, order, alignSelf, getRef, ...others } = props
  style = { flexGrow: grow, ...styles.alignSelf[alignSelf], ...style }
  if (flex) {
    return (
      <Flex
        Component={Component}
        style={style}
        order={order}
        getRef={getRef}
        {...others}
      />
    )
  }
  style.order = order
  return (
    <Component ref={getRef} style={style} {...others} />
  )
}
Item.defaultProps = {
  grow: 1, // 占有比例
  Component: 'div',
  flex: false, // 是否启用flex
  order: 0, // 排序序号
  style: {},
  alignSelf: 'auto', // 自定义交叉轴对齐方式 覆盖父元素 align属性（只对该element有效）
  getRef: (ref) => ref
}
Item.propTypes = {
  grow: PropTypes.number,
  Component: PropTypes.element,
  flex: PropTypes.bool,
  order: PropTypes.number,
  style: PropTypes.object,
  alignSelf: PropTypes.oneOf(['start', 'end', 'center', 'baseline', 'stretch', 'auto']),
  getRef: PropTypes.func,
}
Flex.Item = Item
export default Flex
