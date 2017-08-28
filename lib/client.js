'use strict'

const ws = require("nodejs-websocket")
const EventEmitter2 = require('eventemitter2').EventEmitter2




class Client {

	constructor(id, options) {
		this.sock = null
		this.id = id
		this.isConnected = false
		this.events = new EventEmitter2({wildcard: true})

		options = options || {}

		const port = options.masterPort || 8090
		const host = options.masterHost || 'localhost'

		this.url = `ws://${host}:${port}/${id}`

		this.registeredTopics = {}
	}


	connect() {
		console.log('try to connect...')

		var sock = ws.connect(this.url, () => {
			console.log("Connected")
			this.isConnected = true
			if (typeof this.onConnect == 'function') {
				this.onConnect()
			}

			for(let topic in this.registeredTopics) {
				var getLast = this.registeredTopics[topic]
				this.sendMsg({type: 'register', topic: topic, getLast: getLast})
			}

		}) 

		sock.on('text', (text) => {
			var msg = JSON.parse(text)

			let split = msg.topic.split('.') // compute the id (layerId.objectId) from topic
			if (split.length == 3) {
				split.shift()
				msg.id = split.join('.')
			}
			
			this.events.emit(msg.topic, msg)
		
		})

		sock.on('close', (code, reason) => {
			//console.log('WS close', code, reason)
			if (this.isConnected) {
				console.log('Disconnected !')
			}
			this.isConnected = false
			setTimeout(() => {this.connect()}, 5000)

		})

		sock.on('error', (e) => {
			//console.log('WS error', e)

		})

		this.sock = sock		
	}

	sendMsg(msg) {
		msg.time = Date.now()
		var text = JSON.stringify(msg)
		if (this.isConnected) {
			this.sock.sendText(text)
		}
	}

	emit(topic, data) {
		//console.log('publish', topic, data)
		var msg = {
			type: 'notif',
			topic: topic
		}

		if (data !== undefined) {
			msg.data = data
		}
		this.sendMsg(msg)
	}

	on(topic, callback) {

		this.events.on(topic, callback)
	}

	register(topic, getLast, callback) {
		this.registeredTopics[topic] = getLast
		this.on(topic, callback)
	}

}





module.exports = Client
