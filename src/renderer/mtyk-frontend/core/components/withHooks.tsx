export default function withHooks(hooksMapper: (props) => any, Component) {
  return function WithHooksWrapper(props) {
    const passDown = hooksMapper(props)
    return <Component {...props} {...passDown} />
  }
}
