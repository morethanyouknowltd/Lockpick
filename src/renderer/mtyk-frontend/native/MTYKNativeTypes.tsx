export interface DefaultNativeProps {
  children?: React.ReactNode
  style?: any
}

export namespace DefaultProps {
  export interface Children {
    children: React.ReactNode
  }
  export interface Style {
    style: any
  }
  export interface Input<ValueType> {
    onChange: (value: ValueType) => void
    value: ValueType
    defaultValue?: ValueType
  }
}
