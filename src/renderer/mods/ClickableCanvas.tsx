import React from 'react'
import styled from from 'styled-components'
import { LockpickComponent } from '../core/LockpickComponent'
import { PopupRenderer } from './PopupRenderer'
import { send } from '../bitwig-api/Bitwig'

export class ClickableCanvas extends LockpickComponent<any> {
  state = {
    popups: [],
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps })
  }
  render() {
    return <PopupRenderer clickable={true} popups={this.state.popups} />
  }
}
