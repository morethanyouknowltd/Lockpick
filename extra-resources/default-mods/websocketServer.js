/**
 * @name Websocket Server
 * @id websocket-server
 * @description Creates a websocket server that broadcasts keypresses - use with caution! (privacy n stuff)
 * @category global
 * @applications Figma
 */

const PORT = 12346
if (!Mod.isActive) {
  return
}

var ws = require('websocket').server
var http = require('http')

// Open a websocket server and send all keypresses to all connected clients
var server = http.createServer(function (request, response) {
  log(new Date() + ' Received request for ' + request.url)
  response.writeHead(404)
  response.end()
})
server.listen(PORT, function () {
  log(new Date() + ` Server is listening on port ${PORT}`)
})

wsServer = new ws({
  httpServer: server,
})

let connectedClients = []

Keyboard.on('keydown', event => {
  // if (Bitwig.isActiveApplication('Figma')) {
  log('got keydown', event)
  connectedClients.forEach(client => {
    client.sendUTF(JSON.stringify(event))
  })
  // }
})

wsServer.on('request', function (request) {
  var connection = request.accept(null, request.origin)
  log(new Date() + ' Connection accepted')
  connectedClients.push(connection)
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      log('Received Message: ' + message.utf8Data)
    }
  })

  connection.on('close', function (connection) {
    log('Connection closed')
  })
})

Mod.onExit(() => {
  log('Closing websocket server')
  server.close()
})
