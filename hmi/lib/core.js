(function () {

	
	let plugins = {}


	function isObject(o) {
		return (typeof o == 'object' && !Array.isArray(o))
	}


	window.registerTacticPlugin = function(name, func) {
		console.log('register', name)
		plugins[name] = func
	}




	window.TacticView = class TacticView {

		constructor(mapId, client, config) {
			this.map = null
			this.mapId = mapId
			this.client = client
			this.layers = {}
			this.actions = new EventEmitter2()

			this.configure(config)		
		}

		reset() {
			for(let layer in this.layers) {
				this.layers[layer].clearLayers()
			}
		}

		findInfo(id) {
			//console.log('findInfo', id)
			
			let tokens = id.split('.')
			if (tokens.length != 2) {
				console.warn('Bad identifier', id)
				return null
			}
			let layerId = tokens[0]
			//console.log('layerId', layerId)
			let layer = this.layers[layerId]
			if (layer == undefined) {
				console.warn(`layer '${layerId}' does not exist`)
				return null
			}
			let objectId = tokens[1]
			let obj = this.findObject(layer, objectId)
			if (obj == null) {
				return {layer: layer, objectId: objectId}
			}

			return {layer: layer, obj: obj, objectId: objectId}

		}

		findObject(layer, id) {
			//console.log('findObject', id)
			var ret = null

			layer.eachLayer((layer) => {
				if (layer.id == id) {
					ret = layer
				}
			})

	
			return ret
		}

		removeObject(id) {
			console.log('removeObject', id)
			var info = this.findInfo(id)
			//console.log('info', id, info)
			if (info != null  && info.layer != undefined && info.obj != undefined) {
				info.obj.removeFrom(info.layer)
			}			
		}

		addObject(newLayer, msg) {
			console.log('addObject', msg.id)
			var info = this.findInfo(msg.id)
			//console.log('info', id, info)
			if (info != null  && info.layer != undefined && info.obj != undefined) {
				info.obj.removeFrom(info.layer)
			}

			if (newLayer != null && info != null  && info.layer != undefined) {
				newLayer.addTo(info.layer)
				newLayer.id = info.objectId	
				newLayer.fullId = msg.id
				newLayer.creator = msg.src
				if (msg.data.options != undefined) {
					newLayer.privateData = msg.data.options
				}		
			}
		}

		onAction(action, callback) {
			this.actions.on(action, callback)
		}


		processMenuItemConfig(contextmenuConfig) {
			let that = this
			let config = [].concat(contextmenuConfig)
			config.forEach((item) => {
				let topic = item.topic
				if (typeof topic == 'string') {
					item.callback = function(ev) {
						//console.log('callback', topic)
						that.client.emit(topic, ev.relatedTarget || ev.latlng)
					}
					delete item.topic
				}

				let action = item.action
				if (typeof action == 'string') {
					item.callback = function(ev) {
						that.actions.emit(action, ev.relatedTarget || ev.latlng)
					}
					delete item.action
				}
			})
			return config
		}

		configure(config) {
			
			let mapConfig = config.map
			let client = this.client
			let that = this

			if (isObject(mapConfig)) {

				let contextmenuConfig = config.contextmenuItems

				if (Array.isArray(contextmenuConfig)) {
					mapConfig.contextmenu = true
					mapConfig.contextmenuItems = this.processMenuItemConfig(contextmenuConfig)
				}

				console.log('add map')
				this.map = L.map(this.mapId, mapConfig)

			}

			let tileLayerConfig = config.tileLayer
			if (isObject(tileLayerConfig) ) {
				let urlTemplate = tileLayerConfig.urlTemplate
				if (typeof urlTemplate != 'string') {
					console.warn('missing urlTemplate in tileLayer config')
				}
				else {
					console.log('add tileLayer')
					L.tileLayer(urlTemplate, tileLayerConfig).addTo(this.map)					
				}
			}




			let controlsConfig = config.controls
			if (isObject(controlsConfig) ) {
				let scaleConfig = controlsConfig.scale

				if (isObject(scaleConfig)) {
					console.log('add scale control')
					L.control.scale(scaleConfig).addTo(this.map)
				}

				let coordinatesConfig = controlsConfig.coordinates
				if (isObject(coordinatesConfig)) {
					console.log('add coordinates control')
					L.control.coordinates(coordinatesConfig).addTo(this.map)
				}

				let layersConfig = controlsConfig.layers
				if (isObject(layersConfig)) {
					let conf = {}
					for(let layerName in layersConfig) {
						let layer = new L.FeatureGroup()
						
						this.layers[layerName] = layer

						let label = layersConfig[layerName].label
						let visible = layersConfig[layerName].visible
						if (visible === true) {
							this.map.addLayer(layer)
						}
						if (typeof label == 'string') {
							conf[label] = layer
						}
						
					}
					if (Object.keys(conf).length != 0) {
						L.control.layers({}, conf).addTo(this.map)
					}
					

				}				
			}


			let pluginsConfig = config.plugins
			if (isObject(pluginsConfig)) {
				for(let pluginsName in pluginsConfig) {
					let pluginFonc = plugins[pluginsName]
					if (typeof pluginFonc != 'function') {
						console.warn(`plugins '${pluginsName}' is not registered`)
					}
					else {
						new pluginFonc(this, pluginsConfig[pluginsName])
					}					
				}

			}


		}


	}

})()

