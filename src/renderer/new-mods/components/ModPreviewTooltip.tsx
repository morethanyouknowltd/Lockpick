import { Flex, Txt } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import { Mod } from '../../../connector/shared/state/models/Mod.model'

export interface ModPreviewTooltipProps {
  mod: Mod
}
export interface ModPreviewTooltipRefHandle {}

function DocTable({ rows, ...rest }) {
  return (
    <table {...rest}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default compose()(function ModPreviewTooltip(props: ModPreviewTooltipProps) {
  const { mod } = props
  return (
    <Flex style={{ width: '12em' }}>
      <Flex gap=".9em">
        <Txt medium size=".9em">
          {mod.name}
        </Txt>
        <Txt size=".9em">{mod.description}</Txt>
      </Flex>
      <DocTable
        style={{ marginTop: '1em' }}
        rows={[
          ['Enabled', String(!mod.disabled)],
          ['Version', mod.version],
        ]}
      />
    </Flex>
  )
})
