import GoogleMaps from "google-maps";
import Marker from "./Marker";

export default class Map {
	/**
	 * class constructor
	 * 
	 */
	constructor(config, data) {
		this.data 			= data;

		this.config 		= config;
		this.services 		= this.data.locations;
		this.kmlLayer 		= null;
		this.markers 		= [];
		this.map 			= null;
		GoogleMaps.KEY 		= this.config.apiKey;
		this.ages 			= {};		
		this.serviceTypes 	= {};
		this.filters 		= [];
		this.googlemap 		= null;
	}

	/**
	 * build the map and all associated features and data
	 * 
	 */
	build() {
		GoogleMaps.load((google) => {
			this.map = new google.maps.Map(document.querySelector(this.config.selector), {
				center: new google.maps.LatLng(this.config.centreLat, this.config.centreLang),
				zoom: this.config.startZoom,
				mapTypeId: this.config.mapType
			});
			
			this.addMarkers(true);
			this.compileAges();	
			this.compileServiceTypes();	
			this.loadKml(this.data.catchment_areas_url);

			this.map.addListener('idle', (event) => {				
				this._emitVisibleItemsEvent();				
			});	

			document.dispatchEvent(new Event('gmaps-available'));
		});
	}

	/**
	 * load up the KML overlay
	 * 
	 */
	loadKml(src) {
		GoogleMaps.load((google) => {		
			this.kmlLayer = new google.maps.KmlLayer({
				url: src,
				preserveViewport: true
			});

			this.kmlLayer.setMap(this.map);
		});		
	}

	/**
	 * return the underlying google maps instance
	 *
	 */
	getMap() {		
		return this.map;
	}

	/**
	 * add all of the service markers to the map
	 * 
	 */
	addMarkers(displayOnMap) {
		// iterate over the services and put them on the map
		this.services.forEach((service) => {
			let marker = new Marker(service);
			this.markers.push(marker);

			if(displayOnMap) {
				this.showMarker(marker.id);
			}
		});
	}

	/**
	 * show a map marker
	 * 
	 */
	showMarker(markerId) {
		this.markers.forEach((marker) => {					
			if(marker.id == parseInt(markerId)) {						 				
				marker.pin.setMap(marker.setVisibility(this.map));				
			}
		}, markerId);

		this._setBounds();
	}

	/**
	 * centre and focus on a selected marker
	 *
	 */
	focusMarker(markerId) {
		this.hideAllMarkers();

		this.markers.forEach((marker) => {					
			if(marker.id == parseInt(markerId)) {						 				
				marker.pin.setMap(marker.setVisibility(this.map));				
			}
		}, markerId);
	}

	/**
	 * show or hide a selected map pin
	 *
	 */
	highlight(markerId) {
		this.focusMarker(markerId);
		this._setBounds();
		
		let promise = new Promise((resolve, reject) => {				
			let marker = this._getMarker(markerId);
			
			if(marker) {
				resolve(marker);	
			}
			
		}).then((marker) => {
			let toggleEvent = new CustomEvent('gmaps-centre-marker', {
				'detail' : {
					hospitalId 		: marker.id,
					marker 			: marker
				}
			});

			document.dispatchEvent(toggleEvent);	
		});		
	}

	/**
	 * convert the service list into a list of ages Vs services
	 *
	 */
	compileAges() {
		this.markers.forEach((service) => {
			for(let age in service.ages) {				
				age = service.ages[age];
					
				if(!this.ages[age]) {
					this.ages[age] = [];
				}

				this.ages[age].push(service);
			}
		});	
	}
	/**
	 * convert the service list into a list of service types Vs services
	 * 
	 */
	compileServiceTypes() {
		this.markers.forEach((service) => {
			for(let index in service.services) {		
				let serviceType = service.services[index];

				if(!this.serviceTypes[serviceType]) {
					this.serviceTypes[serviceType] = [];
				}

				this.serviceTypes[serviceType].push(service);
			}
		});	
	}

	/**
	 * filter the services by age selection
	 * 
	 */
	filterByAge(e) {		
		document.getElementById("selected-age").innerHTML = e.target.innerHTML;
		this._setActiveClass(e);
		
		let selected = e.target.getAttribute("data-value");

		if(!selected) {
			return this.clearFilter("ageFilter").apply();
		}

		return this.addFilter("ageFilter", selected).apply();	
	}	

	/**
	 * filter the list of services by service type
	 *
	 */
	filterByType(e) {
		document.getElementById("selected-service").innerHTML = e.target.innerHTML;		
		this._setActiveClass(e);

		let selected = e.target.getAttribute("data-value");

		if(!selected) {
			return this.clearFilter("typeFilter").apply();
		}

		return this.addFilter("typeFilter", selected).apply();	
	}

	/**
	 * set the selected class as active
	 *
	 */
	_setActiveClass(e) {
		let className = e.target.className;
		let els = document.getElementsByClassName(className)

		Array.from(els).forEach((el) => {
			el.parentElement.classList.remove("active");
		});

		e.target.parentElement.classList.add("active");
	}

	/**
	 * iterate over the selected filters and apply them
	 *
	 */
	apply() {	
		let methods = [];
		this.showAllMarkers();

		for(let method in this.filters) {			
			methods.push(() => {
				let filter = this.filters[method];
				
				let promise = new Promise((resolve, reject) => {				
					resolve(this[filter.method](filter.value));
				});

				return promise;
			});
		}

		for(let i = 0; i < methods.length; i++) {			
			methods[i]().then(methods[i+1]);
		}	

		return true;	
	}

	/**
	 * apply out the age filter
	 * 
	 */
	ageFilter(selected) {		
		let markers = this.getActiveMarkers();

		for(let age in this.ages) {				
			if(age == selected) {
				// filter the ages to just show the ones that meet the chosen
				// filter option
				let filtered = markers.filter((marker) => {
					return this.ages[age].includes(marker);
				});

				this.showMarkers(filtered);
			}
		}

		this._mapFiltered();

		// we need to return something for the promise to complete
		return true;
	}	

	/**
	 * apply the service type filter
	 * 
	 */
	typeFilter(selected) {	
		let markers = this.getActiveMarkers();

		for(let serviceType in this.serviceTypes) {
			if(serviceType == selected) {
				// filter the service types to just show the ones that meet 
				// the selected value
				let filtered = markers.filter((marker) => {
					return this.serviceTypes[serviceType].includes(marker);
				});
				
				this.showMarkers(filtered);
			}
		}

		this._mapFiltered();

		// we need to return something for the promise to complete
		return true;
	}

	/**
	 * show all of the markers in a provided list
	 * 
	 */
	showMarkers(markers, emitVisibleItems) {
		this.hideAllMarkers();

		markers.forEach((marker) => {
			this.showMarker(marker.id);
		});					
	}

	/**
	 * show all of the markers regardless of previous selection
	 * 
	 */
	showAllMarkers() {
		this.showMarkers(this.markers);
	}

	/**
	 * hide all of the markers regardless of previous selection
	 * 
	 */
	hideAllMarkers() {
		this.markers.forEach((marker) => {			
			marker.pin.setMap(null);
			marker.hide();
		});
	}

	/**
	 * add the name of a filter function to the map
	 * 
	 */
	addFilter(filter, option) {
		this.applyFilter(filter, option);

		return this;
	}

	/**
	 * clear an applied filter type
	 *
	 */
	clearFilter(cleareable) {	
		for (let filter in this.filters) {
			if(this.filters[filter] && this.filters[filter].method == cleareable) {
				this.filters = [...this.filters.slice(0, filter), ...this.filters.slice(filter+1)];		
			}
		}		

		this._mapFiltered();

		return this;
	}

	/**
	 * update an existing filter with the newly selected value
	 *
	 */
	applyFilter(filter, option) {
		for(let active in this.filters) {
			if(this.filters[active].method == filter) {
				return this.filters[active].value = option;
			}
		}
		
		this._setBounds();
		return this.filters.push({method: filter, value:  option});
	}

	/**
	 * retrieve all currently active markers
	 * 
	 */
	getActiveMarkers() {
		let activeMarkers = [];

		this.markers.forEach((marker) => {
			if(!marker.isHidden()) {
				activeMarkers.push(marker);
			}
		});	

		return activeMarkers;
	}

	/**
	 * trigger an event to state that some filter was updated
	 *
	 */
	_mapFiltered() {
		document.dispatchEvent(new Event('gmaps-filter-changed'));	
	}

	/**
	 * set the map zoom to that of the visible markers
	 * 
	 */
	_setBounds() {		
		GoogleMaps.load((google) => {
			let bounds = new google.maps.LatLngBounds();  
		
			new Promise((resolve, reject) => {
				resolve(this.getActiveMarkers());
			}).then((markers) => {
				for(let m in markers) {
					bounds.extend(markers[m].pin.getPosition());
				}
				
				this.map.fitBounds(bounds);	
				this._setZoom();							
			});					
		});
	}

	/**
	 * set the zoom level of the map
	 * 
	 */
	_setZoom() {
		if(this.getActiveMarkers().length == 1) {
			return this.map.setZoom(16);
		}

		if(this.getActiveMarkers().length == 0) {
			return this._reset();
		}
	}

	/**
	 * reset the map to a sensible default
	 *
	 */
	_reset() {
		this.map.setCenter(new google.maps.LatLng(this.config.centreLat, this.config.centreLang));
		this.map.setZoom(this.config.startZoom);
	}

	/**
	 * emit and event listing out the currently visible map markers
	 * 
	 */
	_emitVisibleItemsEvent() {
		let items = [];

		this.getActiveMarkers().forEach((marker) => {
			items.push({
				hospitalId 		: marker.id,
				marker 			: marker.pin
			});
		});

		let visibilityEvent = new CustomEvent('gmaps-visible-markers', {
			'detail' : {
				"visibleItems" : items
			}
		});

		document.dispatchEvent(visibilityEvent);
	}

	/**
	 * retrieve a given marker from the source list by its ID
	 *
	 */
	_getMarker(markerId) {
		for(let marker in this.markers) {
			if(this.markers[marker].id == markerId) {
				return this.markers[marker];
			}
		}
	}	
}