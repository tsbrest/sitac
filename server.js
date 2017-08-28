var express = require('express')
var agent = require('./lib/agent')

var port = agent.config.port || 9000

var app = express()

app.get('/', function(req, res) {
	res.redirect('pages/tactic/app.html')
})

app.use('/jquery', express.static('node_modules/jquery/dist'))
app.use('/leaflet', express.static('hmi/externals/leaflet-1.0.3'))
app.use('/leaflet-draw', express.static('hmi/externals/leaflet-draw/dist'))
app.use('/maps', express.static('../OSM/OSM'))
app.use('/config', express.static('config/ihm.json'))
app.use('/eventemitter', express.static('node_modules/EventEmitter2/lib'))
app.use(express.static('hmi'))

app.listen(port, function() {
	console.log('WEB Server listening on port',  port)
})