import Map from "./classes/Map";
import {Setup as Config} from "./config/Setup";

if(document.getElementById("map")) {	
	let map = new Map(Config);
	map.build();

	// grab all of the links to show/hide the hospitals
	let classname = document.getElementsByClassName("show-hide");

	// add event listeners to each of the hospital toggles
	Array.from(classname).forEach((element) => {
		element.addEventListener('click', (e) => {
			map.showMarker(e.target.dataset.hospitalId);
		},map);
    });

    document.getElementById("age-filter").addEventListener("change", (e) => {
    	map.filterByAge(e.target.value);
    },map);

    document.getElementById("service-type-filter").addEventListener("change", (e) => {
    	map.filterByType(e.target.value);
    },map);
}
