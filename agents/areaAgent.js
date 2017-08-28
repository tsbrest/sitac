const agent  = require('../lib/agent')
var Geodesy = require('../lib/geodesy')
var formules = require('../lib/formules')


var geodesy = new Geodesy({lat:48.3583, lng:-4.53417})

var pts = null


agent.onConnect(function() {
	agent.emit('tacticViewAddShape.default.area')
	agent.emit('tacticViewAisReport.vehicule.drone')
})

agent.register('tacticViewPolygonCreated', false, (msg) => {
	console.log('Receive msg', msg)
	var data = msg.data
	data.options = {fill: false, color: 'red'}
	pts = convertToXY(data.latlngs)
	console.log('pts', pts)

	agent.emit('tacticViewAddShape.default.area', data)
})

agent.register('aisReport.*.*', false, (msg) => {
	console.log('aisReport', msg)
	if (pts != null) {
		var p = geodesy.gps2pos(msg.data.latlng)

		if (formules.isInPolygon(pts, p)) {
			msg.data.color = "red"
		}

		
	}
	agent.emit('tacticViewAisReport.' + msg.id, msg.data)

})


function convertToXY(latlngs) {
	console.log('convertToXY', latlngs)
	return latlngs.map((latlng) => {
		return geodesy.gps2pos(latlng)
	})
}





agent.start()