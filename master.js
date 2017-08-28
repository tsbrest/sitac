'use strict'

const ws = require("nodejs-websocket")
const config = require('./config/config.json')
const EventEmitter2 = require('EventEmitter2').EventEmitter2

const notifHistory = {}

const server = ws.createServer(function (client) {
	console.log('New connection', client.path)

	var id = client.path.substr(1)
	client.id = id
	client.events = new EventEmitter2({wildcard: true})

	//client.registeredTopics = {}

	client.on('text', function(text) {

		var msg = JSON.parse(text)
		msg.src = id
		handleClientMsg(client, msg)

	})

	client.on('close', function(code) {
		console.log(`Client '${id}' disconnected`)
	})

	client.on('error', function(err) {
		console.log('connection error')
	})

})

function findClient(id) {
	return server.connections.find(function(client) {
		return client.id == id
	})	
}

function handleClientMsg(client, msg) {

	//console.log('msg', msg)
	if (typeof msg.topic != 'string') {
		console.log('Bad parameter topic')
		return
	}	

	switch(msg.type) {
		case 'cmd': 
			console.log('msg', msg)
			let dest = findClient(msg.dest)
			if (dest != undefined) {
				let text = JSON.stringify(msg)
				dest.sendText(text)
			}
		break

		case 'register':
			client.events.on(msg.topic, function(msg) {
				client.sendText(JSON.stringify(msg))
			})
			console.log(`client '${msg.src}' subscribes to topic '${msg.topic}'`)
			if (msg.getLast === true) {
				for(let topic in notifHistory) {
					client.events.emit(topic, notifHistory[topic])
				}
			
			}			
		break

		case 'notif':
			notifHistory[msg.topic] = msg			
			broadcastToSubscribers(msg)
		break

		default:
			console.log('Unknown msg type', msg.type)
	}

}



function broadcastToSubscribers(msg) {

	server.connections.forEach(function(client) {
		client.events.emit(msg.topic, msg)

	})
}

server.listen(config.masterPort, function() {
	console.log(`WebSocket server start listening on port ${config.masterPort}`)
})

