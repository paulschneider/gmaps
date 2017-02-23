import GoogleMaps from "google-maps";
import Marker from "./Marker";
import {Services} from "../config/Services";

export default class Map {
	/**
	 * class constructor
	 * 
	 */
	constructor(config) {
		this.config 		= config;
		this.services 		= Services;
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

			this.loadKml(this.config.kml.start);
			this.addMarkers();
			this.compileAges();	
			this.compileServiceTypes();		
			this.showAllMarkers();
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
	addMarkers() {
		// iterate over the services and put them on the map
		this.services.forEach((service) => {
			let marker = new Marker(service);

			this.markers.push(marker);
		});
	}

	/**
	 * show a map marker
	 * 
	 */
	showMarker(markerId) {
		this.markers.forEach((marker) => {		
			if(marker.id === parseInt(markerId)) {				
				let visibility = ! marker.visible ? this.map : null; 				
				marker.pin.setMap(visibility);

				marker.setVisibility();
			}
		}, markerId);
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
			for(let type in service.serviceTypes) {				
				serviceType = service.serviceTypes[type];
					
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
	filterByAge(selected) {
		console.log(selected);
		this.addFilter("ageFilter", selected).apply();	
	}

	/**
	 * filter the list of services by service type
	 *
	 */
	filterByType(selected) {
		this.addFilter("typeFilter", selected).apply();	
	}

	/**
	 * iterate over the selected filters and apply them
	 *
	 */
	apply() {		
		this.showAllMarkers();

		this.filters.forEach((filter) => {
			if(!filter.value) {		
				return this.removeFilter(filter.method);
			}

			this[filter.method](filter.value);
		});
	}

	/**
	 * apply out the age filter
	 * 
	 */
	ageFilter(selected) {	
		new Promise((resolve, reject) => {
			let markers = this.getActiveMarkers();

			if(markers) {
				resolve(markers);
			} 
		}).then((markers) => {
			console.log(selected);
			if(!selected) {
				return this.showAllMarkers();
			}

			for(let age in this.ages) {
				if(age === selected) {
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
		if(!this.filters.includes(filter)) {
			this.filters.push({method: filter, value:  option});	
		}		

		return this;
	}

	/**
	 * clear out any previously set filters
	 *
	 */
	removeFilter(active) {
		for(let filter in this.filters) {
			if(this.filters[filter] === active) {
				this.filters = [...this.filters.slice(0, filter), ...this.filters.slice(filter+1)];	
			}
		}
	}

	/**
	 * retrieve all currently active markers
	 * 
	 */
	getActiveMarkers() {
		let activeMarkers = [];

		this.markers.forEach((marker) => {
			if(marker.isVisible()) {
				activeMarkers.push(marker);
			}
		});	

		return activeMarkers;
	}
}