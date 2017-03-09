import GoogleMaps from "google-maps";

export default class Marker {

	/**
	 * class constructor
	 * 
	 */
	constructor(config) {
		this.pin 		= null;
		this.id 		= config.id;  	
		this.hidden 	= true;  
		this.ages 		= config.ages;
		this.services 	= config.services;

		GoogleMaps.load((google) => {			
			this.pin = new google.maps.Marker({
				position: {lat: config.location.lat, lng: config.location.lng}
			});

			this.pin.addListener("click", (e) => {
				this._emitMarkerIdentity(this.id);
			});
		});				

		return this;	
	}

	/**
	 * toggle the visibility flag of the marker
	 * 
	 */
	setVisibility(map) {
		if(this.hidden) {
			this.hidden = false;			
			return map;			
		}
		
		this.hidden = true;
		return null;
	}

	/**
	 * set the visibility to hidden
	 * 
	 */
	hide() {
		this.hidden = true;
	}

	/**
	 * set the visibility to visible
	 * 
	 */
	show() {
		this.hidden = false;
	}

	/**
	 * is this marker currently active
	 * 
	 */
	isHidden() {
		return this.hidden;
	}

	/**
	 * when interacted with this marker will provide its identity
	 *
	 */
	_emitMarkerIdentity(identity) {
		let identityEvent = new CustomEvent('gmaps-marker-identity', {
			'detail' : {
				marker 		: this.pin,
				hospitalId 	: identity
			}
		});

		document.dispatchEvent(identityEvent);
	}
}