var forever = require('forever-monitor')
var fs = require('fs')
var path = require('path')

var globalConfig = require('./config/config.json')

if (!('launcher' in globalConfig)) {
	console.error('no laucnher config !')
	process.exit(2)
}

var config = globalConfig.launcher

var logPath = config.logPath || "./log/"
if (!fs.existsSync(logPath)) {
	console.log("create directory ", logPath)
	fs.mkdirSync(logPath)
}






if (!('agents' in config)) {
	console.error('No agent to launch !')
	process.exit(3)
}


var agents = config.agents


var agentsState = {}

function startAgent(agentName) {

	if (typeof agents[agentName] != 'object') {
		console.log(`agent ${agentName} is not defined in the configuration file`)
		return
	}

	var script = agents[agentName].script

	if (typeof script != 'string') {
		console.log("no script defined for agent ", agentName)
		return
	}
	
	var child = new forever.Monitor(script, {
		outFile: path.join(logPath, agentName + '.log'),
		silent: true,
		args: [agentName],
		max: 1,
		killTree: true
	})
	child.on('exit', function() {
		console.log(`Agent '${agentName}' has exited`)
		agentsState[agentName] = {state:'stop', pid: 0}
		sendStatus()
	})

	child.on('start', function(process, data) {
		console.log(`start agent '${agentName}' with pid ${data.pid}`)
		agentsState[agentName] = {state:'run', pid: data.pid}
		sendStatus()
	})
	child.start()
}


function stopAgent(agentName) {
	if (typeof agentsState[agentName] != 'object') {
		console.log(`agent ${agentName} is not defined in the configuration file`)
		return
	}

	const pid = agentsState[agentName].pid
	if (pid == 0) {
		console.log(`agent ${agentName} is not running`)
		return		
	}
	process.kill(pid)
}

for(var agentName in agents) {
	var start = agents[agentName].start || "auto"

	agentsState[agentName] = {state:'ready', pid:0}
	if (start != 'manual') {
		startAgent(agentName)	
	}
}


const Client = require('./lib/client')
const client = new Client('launcher', globalConfig)


client.register('launcherStartAgent', false, function(msg) {
	console.log(`startAgent '${ msg.data}'`)
	startAgent(msg.data)
})

client.register('launcherStopAgent', false, function(msg) {
	console.log(`stopAgent '${ msg.data}'`)
	stopAgent(msg.data)
})


client.onConnect = function() {
	sendStatus()
}

client.connect()


function sendStatus() {
	client.emit("launcherStatus", agentsState)
}
