(function(){

	class CenterMap {

		constructor(tacticView, options) {

			let centerVeh = null

			tacticView.onAction('centerMap', (pos) => {
				console.log('centerMap', pos)
				tacticView.map.panTo(pos)
				centerVeh = null
			})

			tacticView.onAction('centerOnVehicule', (marker) => {
				console.log('centerOnVehicule', marker.fullId)
				tacticView.map.panTo(marker.getLatLng())
				centerVeh = marker.fullId
			})
			
			tacticView.client.onMsg('tacticViewAisReport.*.*', (msg) => {
				//console.log('aisReport', msg)
				if (msg.id === centerVeh && msg.data != undefined) {
					tacticView.map.panTo(msg.data.latlng)
				}
			})			
		}
	}

	registerTacticPlugin('CenterMap', CenterMap)
})()