$(function () {
	console.log('App started')

	const client = new Client('AgentMonitoring')
	const tbody = $('#monitoring tbody')

	client.register('launcherStatus', true, function(msg) {
		tbody.empty()
		const data = msg.data
		for(let agent in data) {

			const info = data[agent]

			const actionLabel = (info.pid != 0) ? 'Stop' : 'Start'
			const actionCmd = (info.pid != 0) ? 'launcherStopAgent' : 'launcherStartAgent'

			$('<tr>')
				.append($('<td>').text(agent))
				.append($('<td>').text(info.pid))
				.append($('<td>')
					.append($('<button>')
						.text(actionLabel)
						.click(function() {
							client.emit(actionCmd, agent)
						})
					)
				)
				.appendTo(tbody)
		}
	})

	client.connect()

})