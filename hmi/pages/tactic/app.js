$(function() {

	console.log('App started')
	console.log('jQuery version', $.fn.jquery)
	console.log('Leaflet version', L.version)
	console.log('LeafletDraw version', L.drawVersion)


	$.getJSON('/config', function(config) {
		//console.log('config', config)

		let client = new Client('TacticView')

		let tacticView = new TacticView('map', client, config)
		client.onConnect = function() {
			tacticView.reset()
		}

		client.connect()

	})


})