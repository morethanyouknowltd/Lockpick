import ProgressBar from 'core/components/ProgressBar'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import zxcvbn from 'zxcvbn'
import { Flex, Txt } from '../../../core/components'

function PasswordStrengthMeter({ password, onScoreChanged }) {
  const [score, setScore] = useState<{
    score: number
    feedback: string
  } | null>(null)

  useEffect(() => {
    const result = zxcvbn(password ?? '')
    const { score, feedback: _feedback } = result
    const feedback = _feedback.warning ?? _feedback.suggestions[0] ?? null
    setScore({ score, feedback })
    onScoreChanged?.(score)
  }, [password])

  const scoreColors = ['#FF9179', '#EE7CCE', '#409CF0', '#3BCCA1']
  const currColor = scoreColors[Math.min(score?.score ?? -1, 3)] ?? '#ddd'
  return (
    <Flex column alignItems="center" style={{ marginTop: 20 }}>
      <Flex
        style={{ width: 80, alignSelf: 'center' }}
        row
        justifyContent="space-between"
      >
        {/* {_.times(4, (i) => {
          return (
            <Flex
              key={i}
              style={{
                ...makeSize(9),
                backgroundColor:
                  score && score?.score >= i ? currColor : '#ddd',
                borderRadius: 10,
              }}
            />
          )
        })} */}
        <ProgressBar
          color={currColor}
          value={(score?.score ?? 0) / 3}
          style={{ alignSelf: 'center' }}
        />
      </Flex>
      <Txt style={{ fontSize: 13, marginTop: 8, color: '#333' }}>
        {_.capitalize(
          ['too short', 'weak', 'okay', 'good', 'strong'][score?.score ?? -1] ??
            'weak'
        )}
      </Txt>
      <Txt
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#333',
          marginTop: 30,
        }}
      >
        {score?.feedback}
      </Txt>
    </Flex>
  )
}

export default PasswordStrengthMeter
