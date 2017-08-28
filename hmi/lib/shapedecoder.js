(function() {

	class ShapeDecoder {

		constructor(tacticView, options) {
			console.log('new ShapeDecoder')


			this.tacticView = tacticView

			const shapeCreatorMap = {
				'circle': this.addCircle,
				'marker': this.addMarker,
				'polyline': this.addPolyline,
				'polygon': this.addPolygon
			}

			
			tacticView.client.register('tacticViewAddShape.*.*', true, (msg)  => {
				console.log('tacticViewAddShape', msg)

				if (msg.id == undefined) {
					console.warn('Missing layer or id')
					return
				}

				console.log('id', msg.id)

				if (msg.data == undefined) {
					this.tacticView.removeObject(msg.id)
					return
				}

				var shapeCreator = shapeCreatorMap[msg.data.shape]

				if (typeof shapeCreator == 'function') {
					shapeCreator.call(this, msg)
				}
				
			})

		}

		addPolygon(msg) {
			console.log('addPolygon', msg)


			var data = msg.data
			if (!Array.isArray(data.latlngs)) {
				console.warn('Missing latlngs parameters')
				return
			}
			const options = data.options || {}
			var obj = L.polygon(data.latlngs, options)
			this.tacticView.addObject(obj, msg)			
		}

		addPolyline(msg) {
			console.log('addPolyline', msg)


			var data = msg.data
			if (!Array.isArray(data.latlngs)) {
				console.warn('Missing latlngs parameters')
				return
			}
			const options = data.options || {}
			var obj = L.polyline(data.latlngs, options)
			this.tacticView.addObject(obj, msg)			
		}

		addMarker(msg) {
			console.log('addMarker', msg)

			var data = msg.data
			const options = data.options || {}
			options.title = id
			var obj = L.marker(data.latlng, options)
			this.tacticView.addObject(obj, msg)

		}

		addCircle(msg) {
			console.log('addCircle', msg)
			
			var data = msg.data
			const options = data.options || {}
			var obj = L.circle(data.latlng, data.radius, options)
			this.tacticView.addObject(obj, msg)

		}			

	}

	registerTacticPlugin('ShapeDecoder', ShapeDecoder)

})()







