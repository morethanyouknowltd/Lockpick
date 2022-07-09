import styled from 'styled-components'

export const ShortcutInput = styled.input`
  padding: 1rem 0.5rem;
  background: transparent;
  &,
  &:focus {
    border: none;
    outline: none;
  }
  text-align: center;
  cursor: pointer;
`
export const ShortcutWrap = styled.div`
  user-select: none;
  cursor: default;
`
export const InputWrap = styled.div`
  border: 1px solid ${(props: any) => (props.focused ? `#CCC` : `#272727`)};
  background: ${(props: any) => (props.noShortcut ? `transparent` : `#272727`)};
  border-radius: 0.3rem;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  input {
    color: #a6a6a6;
  }
  font-size: ${(props: any) => (props.noShortcut ? `.8em` : `1em`)};
  div {
    opacity: 0;
    position: absolute;
    top: 50%;
    right: 0.8em;
    transform: translateY(-50%);
    font-size: 0.8em;
  }
  &:hover {
    div {
      transition: opacity 0.3s;
      opacity: ${(props: any) => (props.noShortcut ? `0` : `1`)};
    }
  }
`
const OptionsWrap = styled.div`
  align-items: center;
  color: #666;
  display: table;
  margin: 0 auto;
  margin-top: 0.5rem;
`
const OptionWrap = styled.div`
  display: flex;
  cursor: pointer !important;
  &:hover {
    color: #aaa;
  }
  align-items: center;
  &:not(:last-child) {
    margin-bottom: 0.1rem;
  }
  font-size: 0.7em;
`

export // const Option = ({ value, id, onChange, label }) => {
//   return (
//     <OptionWrap>
//       <Checkbox
//         id={id}
//         name={label}
//         style={{ marginRight: '.5em' }}
//         checked={value}
//         onChange={event => {
//           onChange(event.target.checked)
//         }}
//       />
//       <label htmlFor={id}>{label}</label>
//     </OptionWrap>
//   )
// }

const WarningText = styled.div`
  font-size: 0.7em;
  margin: 1em 0;
  color: #8c8c8c;
`
