import GoogleMaps from "google-maps";
import Marker from "./Marker";

export default class Map {
	/**
	 * class constructor
	 * 
	 */
	constructor(config, services) {
		this.config 		= config;
		this.services 		= services;
		this.kmlLayer 		= null;
		this.markers 		= [];
		this.map 			= null;
		GoogleMaps.KEY 		= this.config.apiKey;
		this.ages 			= {};		
		this.serviceTypes 	= {};
		this.filters 		= [];
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
			
			this.map.addListener('bounds_changed', (event) => {
				this._setZoom();
			});				
		});   
	}

	/**
	 * load up the KML overlay
	 * 
	 */
	loadKml(src) {
		GoogleMaps.load((google) => {		
			this.kmlLayer = new google.maps.KmlLayer({
				url: src
			});

			this.kmlLayer.setMap(this.map);
		});		
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

		this._setBounds();
	}

	/**
	 * show a map marker
	 * 
	 */
	showMarker(markerId) {
		this.markers.forEach((marker) => {					
			if(marker.id === parseInt(markerId)) {						 				
				marker.pin.setMap(marker.setVisibility(this.map));				
			}
		}, markerId);
	}

	/**
	 * show or hide a selected map pin
	 *
	 */
	toggle(markerId) {
		this.showMarker(markerId);
		this._setBounds();
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
		
		this.addFilter("ageFilter", e.target.dataset.value).apply();	
	}	

	/**
	 * filter the list of services by service type
	 *
	 */
	filterByType(e) {
		document.getElementById("selected-service").innerHTML = e.target.innerHTML;		
		this._setActiveClass(e);

		this.addFilter("typeFilter", e.target.dataset.value).apply();	
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
		this.filters.forEach((filter) => {
			this[filter.method](filter.value);
		});

		this._setBounds();
	}

	/**
	 * apply out the age filter
	 * 
	 */
	ageFilter(selected) {	
		this.showAllMarkers();

		new Promise((resolve, reject) => {
			resolve(this.getActiveMarkers());
		}).then((markers) => {
			if(!selected) {
				return this.showAllMarkers();
			}
			
			for(let age in this.ages) {				
				if(age == selected) {
					// filter the ages to just show the ones that meet the chosen
					// filter option
					let filtered = markers.filter((marker) => {
						return this.ages[age].includes(marker);
					});

					return this.showMarkers(filtered);
				}
			}
		});	
	}	

	/**
	 * apply the service type filter
	 * 
	 */
	typeFilter(selected) {

		new Promise((resolve, reject) => {
			resolve(this.getActiveMarkers());
		}).then((markers) => {
			if(!selected) {
				return this.showAllMarkers();
			}

			for(let serviceType in this.serviceTypes) {
				if(serviceType == selected) {
					// filter the service types to just show the ones that meet 
					// the selected value
					let filtered = markers.filter((marker) => {
						return this.serviceTypes[serviceType].includes(marker);
					});

					return this.showMarkers(filtered);
				}
			}
		});	
	}

	/**
	 * show all of the markers in a provided list
	 * 
	 */
	showMarkers(markers) {
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
		this.markers.forEach((marker) => {		
			marker.pin.setMap(this.map);
			marker.show();
		});
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
	 * update an existing filter with the newly selected value
	 *
	 */
	applyFilter(filter, option) {
		for(let active in this.filters) {
			if(this.filters[active].method === filter) {
				return this.filters[active].value = option;
			}
		}

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
			});					
		});
	}

	/**
	 * set the zoom level of the map
	 * 
	 */
	_setZoom() {
		if(this.getActiveMarkers().length === 1) {
			return this.map.setZoom(16);
		}

		if(this.getActiveMarkers().length === 0) {
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
}