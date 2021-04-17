/**
 * @name Event Test
 * @id event-test
 * @description Outputs messages to logs when specific events are detected
 * @category global
 * @disabled
 */

Mouse.on('mouseup', event => {
    log('mouseup', event)
})
Mouse.on('mousedown', event => {
    log('mousedown', event)
})
Keyboard.on('keyup', event => {
    log('keyup', event)
})
Keyboard.on('keydown', event => {
    log('keydown', event)
})