const agentName = process.argv[2]

if (typeof agentName != 'string') {
	console.log('Please, specify agent name')
	process.exit(1)
}

const Client = require('./client')
const globalConfig = require('../config/config.json')


var client  = new Client(agentName, globalConfig)


module.exports = {

	start: function() {
		client.connect()
	},

	onMsg: function(topic, callback) {
		client.on(topic, callback)
	},

	onConnect: function(callback) {
		client.onConnect = callback
	},	

	emit: function(topic, data) {
		client.emit(topic, data)
	},

	register: function(topic, getLast, callback) {
		client.register(topic, getLast, callback)
	},


	config: globalConfig[agentName] || {}
}



