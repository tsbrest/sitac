(function() {



	function getAisMarkerSvg(color) {

		return  `
			<svg width="40" height="40" style="border: 1px solid back;">
				<g transform="translate(20, 20)" stroke="${color}" fill="${color}">
					<circle r="3"></circle>
					<rect x="-7" y="-7" width="15" height="15" fill="none"></rect>
					<line y2="-30"></line>
				</g>
			</svg>
		`
	}




	class AisDecoder {

		constructor(tacticView, options) {
			console.log('new AisDecoder')

			this.tacticView = tacticView
			this.options = options

			tacticView.client.register('tacticViewAisReport.*.*', true, (msg) => {
				//console.log('tacticViewAisReport', msg)
				if (msg.id == undefined) {
					console.warn('Mission layer or id')
					return
				}
				this.addVehicule(msg)
				
			})

		}



		addVehicule(msg) {
			var id = msg.id

			//console.log('addVehicule', id)
			if (id == undefined) {
				console.warn('id undefined', id)
				return
			}
			var data = msg.data

			var info = this.tacticView.findInfo(id)

			if (data != undefined) {

				var name = data.name || id
				var content = `
					<b>${name}</b><br/>
					`
				var infos = data.infos
				if (Array.isArray(infos)) {
					infos.forEach((info) => {
						let unit = info.unit || ''
						content += `<div><span>${info.label}:</span><span>${info.value}${unit}</span></div>` 

					})
				}	

				var color = data.color || 'green'
				var icon = L.divIcon({
						className: 'aisMarker',
						iconSize: [40, 40],
						iconAnchor: [20, 20],
						html: getAisMarkerSvg(color)
					})		
			
				if (info.obj != undefined) { // marker already exists
					//console.log('update marker')

					info.obj.setLatLng(data.latlng)
					info.obj.setRotationAngle(data.heading)
					info.obj.setPopupContent(content)	
					info.obj.setIcon(icon)			
				}
				else {
					console.log('create marker')

					var options = {
						icon: icon,
						title: id,
						rotationAngle: data.heading || 0						
					}

					if (Array.isArray(this.options.contextmenuItems)) {
						options.contextmenu = true
						options.contextmenuInheritItems = false
						options.contextmenuItems = this.tacticView.processMenuItemConfig(this.options.contextmenuItems)
					}

					let marker = L.marker(data.latlng, options)	
					let popup = L.popup({autoClose: false, closeButton: true, className: 'myPopup', autoPan: false})
					popup.setContent(content)
					marker.bindPopup(popup)	

					this.tacticView.addObject(marker, msg)					

				}

	
			}
			else {
				this.tacticView.removeObject(id)

			}


			

		}

			

	}

	registerTacticPlugin('AisDecoder', AisDecoder)

})()