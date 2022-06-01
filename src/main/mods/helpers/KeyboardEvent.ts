export const KeyboardEvent = {
  noModifiers() {
    return !(this.Meta || this.Control || this.Alt || this.Shift)
  },
}
