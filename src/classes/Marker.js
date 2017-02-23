import GoogleMaps from "google-maps";

export default class Marker {

	/**
	 * class constructor
	 * 
	 */
	constructor(config) {
		this.pin 		= null;
		this.id 		= config.id;  	
		this.visible 	= false;  
		this.ages 		= config.ages;

		GoogleMaps.load((google) => {			
			this.pin = new google.maps.Marker({
				position: {lat: config.location.lat, lng: config.location.lng}
			});
		});				

		return this;	
	}

	/**
	 * toggle the visibility flag of the marker
	 * 
	 */
	setVisibility() {
		this.visible = !this.visible;
	}

	/**
	 * set the visibility to hidden
	 * 
	 */
	hide() {
		this.visible = false;
	}

	/**
	 * set the visibility to visible
	 * 
	 */
	show() {
		this.visible = true;
	}

	/**
	 * is this marker currently active
	 * 
	 */
	isVisible() {
		return this.visible;
	}
}