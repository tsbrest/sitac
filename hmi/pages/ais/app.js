$(function () {
	console.log('App started')

	let vehicules = {}

	const client = new Client('AisMonitoring')
	const tbody = $('#monitoring tbody')

	client.onConnect = function() {
		vehicules = {}
		dispTable()
	}


	client.register('tacticViewAisReport.*.*', true, function(msg) {
		//console.log('msg', msg)
		let id = msg.id

		if (msg.data == undefined) {
			if (vehicules[id] != undefined) {
				delete vehicules[id]
			}
		}
		else {
			vehicules[id] = msg
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
		for(let shapeId in vehicules) {

			const info = getInfo(shapeId)
			var msg = vehicules[shapeId]
			var data = $.extend({}, msg.data)
			var lastModif = new Date(msg.time).toLocaleString()

			$('<tr>')
				.append($('<td>').text(info.id))
				.append($('<td>').text(info.layer))
				.append($('<td>').text(msg.src))
				.append($('<td>').text(lastModif))				
				.append($('<td>').text(data.speed))
				.append($('<td>').text(data.heading.toFixed(0)))
				.append($('<td>').text(data.latlng.lat.toFixed(5)))
				.append($('<td>').text(data.latlng.lng.toFixed(5)))
				.appendTo(tbody)
		}
	}

	client.connect()

})