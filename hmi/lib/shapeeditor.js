(function() {


	const mapShapeData = {
		circle: {
			format : function(layer, data) {
				data.radius = layer.getRadius()
				data.latlng = layer.getLatLng()
			},
			classType: L.Circle,
			topics: {
				add: 'tacticViewCircleCreated',
				edit: 'tacticViewCircleEdited',
				del: 'tacticViewCircleDeleted'
			}
		},
		rectangle: {
			format : function(layer, data) {
				let bounds = layer.getBounds()
				data.northWest =  bounds.getNorthWest()
				data.southEast =  bounds.getSouthEast()
			},
			classType: L.Rectangle,
			topics: {
				add: 'tacticViewRectangleCreated',
				edit: 'tacticViewRectangleEdited',
				del: 'tacticViewRectangleDeleted'
			}
		},
		polygon: {
			format : function(layer, data) {
				data.latlngs = layer.getLatLngs()[0]
			},
			classType: L.Polygon,
			topics: {
				add: 'tacticViewPolygonCreated',
				edit: 'tacticViewPolygonEdited',
				del: 'tacticViewPolygonDeleted'
			}
		},
		polyline: {
			format : function(layer, data) {
				data.latlngs = layer.getLatLngs()
			},
			classType: L.Polyline,
			topics: {
				add: 'tacticViewPolylineCreated',
				edit: 'tacticViewPolylineEdited',
				del: 'tacticViewPolylineDeleted'
			}
		},	
		marker: {
			format : function(layer, data) {
				data.latlng = layer.getLatLng()
			},
			classType: L.Marker,
			topics: {
				add: 'tacticViewMarkerCreated',
				edit: 'tacticViewMarkerEdited',
				del: 'tacticViewMarkerDeleted'
			}
		},


	}


	function getLayerType(layer) {
		for(var k in mapShapeData) {
			if (layer instanceof mapShapeData[k].classType) {
				return k
			}
		}
	}

	function getTypeInfo(type) {
		return mapShapeData[type]
	}

	class ShapeEditor {

		constructor(tacticView, options) {
			console.log('new ShapeEditor')

			this.tacticView = tacticView

			let map = tacticView.map
			let featureGroupName

			if (options.edit != undefined) {
				featureGroupName = options.edit.featureGroup
				if (typeof featureGroupName == 'string') {
					let featureGroup = tacticView.layers[featureGroupName]
					if (featureGroup == undefined) {
						console.warn(`layer '${featureGroupName}' is not defined`)
					}
					else {
						options.edit.featureGroup = featureGroup
					}
				}
			}

			var drawControl = new L.Control.Draw(options)
			map.addControl(drawControl)

			map.on('draw:created', (e)  => {
				var layer = e.layer
				var type = e.layerType
				console.log('draw:created', type)

				var info = getTypeInfo(type)
				if (info == undefined) {
					console.warn(`type '${type}' is not implemented yet`)
					return
				}

				var data = {shape: type}
				var topicName = info.topics.add
				var getDataCbk = info.format


				if (typeof getDataCbk == 'function') {
					getDataCbk(layer, data)
				}

				
				//console.log('data', data)

				tacticView.client.emit(topicName, data)
				
			})	

			map.on('draw:edited', (e) => {
				//console.log('draw:edited', e)
				e.layers.eachLayer((layer) => {
					console.log(`object with id '${layer.id}' was edited`)
					var type = getLayerType(layer)
					console.log('type', type)
					var info = getTypeInfo(type)
					if (info == undefined) {
						console.warn(`type '${type}' is not implemented yet`)
						return
					}

					var data = {shape: type, id: featureGroupName + '.' + layer.id}
					var topicName = 'tacticViewShapeEdited'
/*					var topicName = info.topics.edit
*/					var getDataCbk = info.format


					if (typeof getDataCbk == 'function') {
						getDataCbk(layer, data)
					}

					if (layer.privateData != undefined) {
						data.options = layer.privateData
					}

				
				//console.log('data', data)

					tacticView.client.sendTo(layer.creator, topicName, data)

				})
			})	


			map.on('draw:deleted', (e) => {
				//console.log('draw:edited', e)
				e.layers.eachLayer((layer) => {
					console.log(`object with id '${layer.id}' was deleted`)
					var type = getLayerType(layer)
					console.log('type', type)
					var info = getTypeInfo(type)
					if (info == undefined) {
						console.warn(`type '${type}' is not implemented yet`)
						return
					}

					//var topicName = info.topics.del
					var topicName = 'tacticViewShapeDeleted'			
					var data = {shape: type, id: featureGroupName + '.' + layer.id}
					
					tacticView.client.sendTo(layer.creator, topicName, data)
				})
			})	
		}

	}

	registerTacticPlugin('ShapeEditor', ShapeEditor)

})()