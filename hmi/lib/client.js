(function() {



window.Client = class Client {

	constructor(id, options) {

		console.log('new Client', id, options)
		this.sock = null
		this.id = id + (Date.now() % 100000)
		this.isConnected = false
		this.events = new EventEmitter2({wildcard: true})

		options = options || {}

		const port = options.port || 8090
		const host = options.host || location.hostname

		this.url = `ws://${host}:${port}/${this.id}`

		this.registeredTopics = {}
	}


	connect() {
		console.log('try to connect...')

		var sock = new WebSocket(this.url)

		sock.addEventListener('open', () => {
			console.log("Connected")
			this.isConnected = true
			if (typeof this.onConnect == 'function') {
				this.onConnect()
			}

			for(let topic in this.registeredTopics) {
				let getLast = this.registeredTopics[topic]
				this.sendMsg({type: 'register', topic: topic, getLast: getLast})
			}

		})

		sock.addEventListener('message', (ev) => {
			var msg = JSON.parse(ev.data)

			let split = msg.topic.split('.') // compute the id (layerId.objectId) from topic
			if (split.length == 3) {
				split.shift()
				msg.id = split.join('.')
			}
			
			this.events.emit(msg.topic, msg)		
		})

		sock.addEventListener('close', (ev) => {
			//console.log('WS close', code, reason)
			if (this.isConnected) {
				console.log('Disconnected !')
			}
			this.isConnected = false
			setTimeout(() => {this.connect()}, 5000)

		})

		sock.addEventListener('error', (e) => {
			//console.log('WS error', e)

		})

		this.sock = sock		
	}

	sendMsg(msg) {
		console.log('sendMsg', msg)
		msg.time = Date.now()
		var text = JSON.stringify(msg)
		if (this.isConnected) {
			this.sock.send(text)
		}
	}

	sendTo(dest, topic, data, id) {
		var msg = {
			type: 'cmd',
			topic: topic,
			dest: dest
		}

		if (id !== undefined) {
			msg.id = id
		}

		if (data !== undefined) {
			msg.data = data
		}
		this.sendMsg(msg)		
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

	register(topic, getLast, callback) {
		this.registeredTopics[topic] = getLast
		this.onMsg(topic, callback)
	}

	onMsg(topic, callback) {

		this.events.on(topic, callback)
	}

}


})()

