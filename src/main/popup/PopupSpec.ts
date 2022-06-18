export interface PopupSpec {
  /**
   * Unique id for this popup. When opening a popup with the same id as one already existing,
   * it will be replaced. Otherwise, a new popup will be created
   */
  id: string
  component: String
  props: any
  rect: { x: number; y: number; w: number; h: number }
  onReceivedData?: Function

  /**
   * Defaults to false, whether the popup should stay onscreen
   * even when "closeAll" methods are called
   */
  persistent?: boolean

  /**
   * Defaults to false, whether the popup should be clickable
   */
  clickable?: boolean

  /**
   * Defaults to 3000, only releveant for non-clickable popups
   */
  timeout?: number
}

export interface OpenPopup {
  popup: PopupSpec
  openedAt: Date
  closeTimeout?: any
  clickedAt?: Date
}
