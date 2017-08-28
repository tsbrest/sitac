'use strict'

const agent = require('../lib/agent')
const http = require('http')

/*http.get({
	hostname: 'localhost',
	port: 3000,
	path: '/shapes',
	agent: false
}, (res) => {
	console.log('headers', res.headers['content-length'])
	res.on('data', (chunk) => {
		console.log('length', chunk.length)
		console.log(chunk.toString())
	})

	res.on('end', () => {
		console.log('end')
	})
})*/


agent.onMsg('tacticViewShapeEdited', function(msg) {
	console.log('Receive msg', msg)
	agent.emit('tacticViewAddShape', msg.data, msg.id)
})

agent.onMsg('tacticViewShapeDeleted', function(msg) {
	console.log('Receive msg', msg)
	agent.emit('tacticViewAddShape', undefined, msg.id)
})

function fetch() {

	return new Promise((resolve, reject) => {

		let req = http.request({
			method: 'GET',
			hostname: 'localhost',
			port: 3000,
			path: '/shapes',
			agent: false
		}, (res) => {
			console.log('headers', res.headers['content-length'])
			console.log('code', res.statusCode)
			res.on('data', (chunk) => {
				console.log('length', chunk.length)
				console.log(chunk.toString())
				resolve(JSON.parse(chunk.toString()))
			})

			res.on('end', () => {
				console.log('end')
			})
		})
		req.end()		
	})


}

fetch().then((data) => {
	console.log('data', data)
	for(let shape of data) {

		agent.emit('tacticViewAddShape.default.' + shape.shape + '_' + shape.id, shape)
	}
	
})

agent.start()