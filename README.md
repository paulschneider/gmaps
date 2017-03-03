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

* show / hide links = **bold**.show-hide**bold**

* age filter select = **bold**.age-filter**bold**

* Service type select = **bold**.service-type-filter**bold**

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

### CSS Sass-ing ###

```
	*sass --watch sass:public/dist/css 
```
