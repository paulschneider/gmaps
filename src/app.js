import Map from "./classes/Map";
import {Setup as Config} from "./config/Setup";

window.IconMap = function(services) {
	let map = new Map(Config, services);
	map.build();

	// grab all of the links to show/hide the hospitals
	let classname = document.getElementsByClassName("front-centre");

	// add event listeners to each of the hospital toggles
	Array.from(classname).forEach((element) => {
		element.addEventListener('click', (e) => {
			e.preventDefault();
			
			map.highlight(e.target.dataset.hospitalId);
		}, map);
    });

    // grab all of the links to filter by age range
	let ageLinks = document.getElementsByClassName("age-link");

	// add event listeners to each of the hospital toggles
	Array.from(ageLinks).forEach((link) => {				
		link.addEventListener('click', (e) => {
			e.preventDefault();

			map.filterByAge(e);
		}, map);
    });

    // grab all of the links to filter by service typ
	let serviceLinks = document.getElementsByClassName("service-type");

	// add event listeners to each of the links
	Array.from(serviceLinks).forEach((link) => {		
		link.addEventListener('click', (e) => {
			e.preventDefault();

			map.filterByType(e);
		}, map);
    });
}