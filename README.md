### Initialisation ###

* Include the javascript bundle file 

```
	<script src="./dist/js/maps.bundle.js"></script>    
```

* fire up a new map instance

```
	new IconMap(services = {});
```

### Event listeners are added to the following classes when the app is fired up: ###

* show / hide links = **.front-centre** [centre the map on a given marker]

* age filter select = **.age-filter** [filter the map markers by the age tag given to them]

* Service type select = **.service-type-filter** [filter the markers by the service type tag given to them]

### Data Structure Example - Services ###

```
[
	{
		id : 1,
		location: {
			lat: -37.6527073,
			lng: 145.0120898
		},
		ages: ["youth", "adult"],
		services: ["inpatient-unit", "residential", "community-care", "community-team"],
	},
]
```

### Events ###

```
	document.addEventListener("toggle-marker", function(e) {
    	console.log(e.detail.hospitalId);
    });

    document.addEventListener("visible-markers", function(e) {
    	console.log(e.detail.visibleItems);
    });

    document.addEventListener("marker-identity", function(e) {
    	console.log(e.detail.hospitalId);
    });
```

### CSS Sass-ing ###

```
	*sass --watch sass:public/dist/css 
```
