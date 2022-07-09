import React, { useEffect, useState } from 'react'
import { addPacketListener, send } from '../bitwig-api/Bitwig'
import moment from 'moment'
import styled from 'styled-components'
import _ from 'underscore'
import { default as AnsiUp } from 'ansi_up'

const ansi_up = new AnsiUp()

const Logs = styled.div`
  padding: 1em;
  font-size: 0.8em;
  font-family: Menlo, monospace;
  > * {
    /* @keyframes flashIn {
            from {
                background: #666;
            }

            to {
                transform: transparent;
            }
        }
        animation: flashIn 5s linear 1;
        animation-fill-mode: forwards; */
    > :nth-child(1) {
      margin-right: 1em;
      color: #666;
    }
  }
`

let nextLogId = 0
let latestLogs = []
let setLogsG
let newLogs = []

let debouncedLogSetter = _.debounce(() => {
  setLogsG(newLogs.concat(latestLogs.slice(0, 100)))
  newLogs = []
}, 250)

export const ModLogs = ({ mod }) => {
  const [logs, setLogs] = useState([])
  latestLogs = logs
  setLogsG = setLogs

  useEffect(() => {
    // setLogs([{
    //     id: nextLogId++,
    //     date: new Date(),
    //     msg: `Waiting for logs from ${mod.name}...`
    // }])
    setLogs([])
    send({
      type: `api/mods/log`,
      data: mod.id,
    })
    return addPacketListener(`log`, packet => {
      const msg = packet.data.map(d => (typeof d === 'string' ? d : JSON.stringify(d))).join(' ')
      newLogs.push({ msg, id: nextLogId++, date: new Date() })
      console.log(packet.data)
      debouncedLogSetter()
    })
  }, [mod.id])

  return (
    <Logs>
      {logs.map(log => {
        const html = ansi_up.ansi_to_html(log.msg)
        return (
          <div key={log.id}>
            <span>{moment(log.date).format(`h:mm:ss`)}</span>
            <span style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )
      })}
    </Logs>
  )
}
