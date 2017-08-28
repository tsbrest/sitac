var agent = require('../lib/agent')
var Geodesy = require('../lib/geodesy')
var formules = require('../lib/formules')
var Simulator = require('../lib/simulator')


var geodesy = new Geodesy({lat:48.3583, lng:-4.53417})

var target = null
var captureRadius = 10 // m

var wpts = null // liste des points à ralier (waypoint)
var simu = new Simulator() 
simu.speed = 15 // en noeud
var posInit = false


agent.onConnect(function() {
	agent.emit('aisReport.vehicule.drone')	
	agent.emit('tacticViewAddShape.mission.target')
	agent.emit('tacticViewAddShape.mission.path')
})


function updateDrone(infos) {

	//agent.emit('aisReport.vehicule.drone', {
	agent.emit('aisReport.vehicule.drone', {
		heading: simu.heading,
		speed: simu.speed,
		latlng: geodesy.pos2gps(simu.curPos),
		 name: 'My Drone',
		 color: 'green',
		 infos: infos
		})
}

agent.register('initPos', false, (msg) => {
	console.log('msg', msg)
	
	simu.curPos = geodesy.gps2pos(msg.data)
	posInit = true
	updateDrone()

	if (target != null) {
		startSimu()
	}
	

})

agent.register('goTarget', false, (msg) => {
	console.log('msg', msg)
	target = geodesy.gps2pos(msg.data)
	updateTarget()
	
	if (posInit) {
		startSimu()		
	}


})


agent.register('tacticViewPolylineCreated', false, (msg) => {
	console.log('Receive msg', msg)
	var data = msg.data

	
	agent.emit('tacticViewAddShape.mission.path', data)

	wpts = data.latlngs
	target = geodesy.gps2pos(wpts.shift())
	updateTarget()

	if (posInit) {
		startSimu()		
	}	

})

function updateTarget() {
	agent.emit('tacticViewAddShape.mission.target', {
		shape: 'circle',
		radius: captureRadius,
		latlng: geodesy.pos2gps(target),
		options:{color: 'yellow'}
	})
}

function startSimu() {

	var timerId = setInterval(() => {
		if (target != null) {

			var route = formules.route(simu.curPos, target)
			if (route.dist < captureRadius) {
				if (wpts != null && wpts.length != 0) {
					target = geodesy.gps2pos(wpts.shift())
					updateTarget()
				}
				else {
					clearInterval(timerId)
					simu.stop()
				}
			}

			simu.update(route.heading)
			

			var distance = route.dist
			var distUnit = ' m'
			if (distance > 1000) {
				distance = (distance / 1000).toFixed(2)
				distUnit = ' km'
			}
			else {
				distance = distance.toFixed(0)
			}	

			updateDrone([
				 	{label: "Heading", value: simu.heading.toFixed(0), unit: '°'},
				 	{label: "Distance", value: distance, unit: distUnit},
				 	{label: "Speed", value:simu.speed, unit:" kts"}
				 ])


		}
	}, 1000)
}

agent.start()