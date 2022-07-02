import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { ModAction } from '../../../../connector/shared/state/models/Mod.model'
import { send } from '../../../bitwig-api/Bitwig'
import { PlayButtonWrap } from './ActionTd'

export const PlayButton = ({ action }: { action: ModAction }) => {
  const onTestAction = () => {
    send({
      type: 'api/actions/run',
      data: {
        id: action.id,
      },
    })
  }
  return (
    <PlayButtonWrap onClick={onTestAction}>
      <FontAwesomeIcon icon={faPlay} />
    </PlayButtonWrap>
  )
}
