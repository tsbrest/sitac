$(function () {
	console.log('App started')

	let shapes = {}

	const client = new Client('ShapeMonitoring')
	const tbody = $('#monitoring tbody')

	client.onConnect = function() {
		shapes = {}
		dispTable()
	}

	client.register('tacticViewAddShape.*.*', true, function(msg) {
		console.log('msg', msg)
		let id = msg.id

		if (msg.data == undefined) {
			if (shapes[id] != undefined) {
				delete shapes[id]
			}
		}
		else {
			shapes[id] = msg
		}
		dispTable()

	})

	function getInfo(id) {
		var tokens = id.split('.')
		return {
			layer: tokens[0],
			id: tokens[1]
		}
	}

	function dispTable() {
		tbody.empty()
		for(let shapeId in shapes) {

			const info = getInfo(shapeId)
			var msg = shapes[shapeId]
			var data = $.extend({}, msg.data)
			const shapeType = data.shape
			delete data.shape
			var params = JSON.stringify(data, null, 4)
			var lastModif = new Date(msg.time).toLocaleString()

			$('<tr>')
				.append($('<td>').text(info.id))
				.append($('<td>').text(info.layer))
				.append($('<td>').text(shapeType))
				.append($('<td>').text(msg.src))
				.append($('<td>').text(lastModif))				
				.append($('<td>').append($('<pre>').text(params)))
				.appendTo(tbody)
		}
	}

	client.connect()

})