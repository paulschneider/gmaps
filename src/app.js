import Map from "./classes/Map";
import {Setup as Config} from "./config/Setup";

window.IconMap = function(data) {
	let app = new Map(Config, data);
	
	app.build();

	// grab all of the links to show/hide the hospitals
	let classname = document.getElementsByClassName("front-centre");

	// add event listeners to each of the hospital toggles
	Array.from(classname).forEach((element) => {
		element.addEventListener('click', (e) => {
			e.preventDefault();
			
			app.highlight(e.target.getAttribute("data-hospitalId"));
		}, app);
    });

    // grab all of the links to filter by age range
	let ageLinks = document.getElementsByClassName("age-link");

	// add event listeners to each of the hospital toggles
	Array.from(ageLinks).forEach((link) => {				
		link.addEventListener('click', (e) => {
			e.preventDefault();

			app.filterByAge(e);
		}, app);
    });

    // grab all of the links to filter by service typ
	let serviceLinks = document.getElementsByClassName("service-type");

	// add event listeners to each of the links
	Array.from(serviceLinks).forEach((link) => {		
		link.addEventListener('click', (e) => {
			e.preventDefault();

			app.filterByType(e);
		}, app);
    });

    document.getElementById("kml-load").addEventListener("click", (e) => {
    	e.preventDefault();

    	app.loadAllCatchments();
    });

    document.getElementById("kml-hide").addEventListener("click", (e) => {
    	e.preventDefault();

    	app.hideAllCatchments();
    });    

	// expose the underlying google map instance
    this.map = function() {
    	return app.map;
    }
}