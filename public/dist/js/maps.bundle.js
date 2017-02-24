/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Map = __webpack_require__(1);

	var _Map2 = _interopRequireDefault(_Map);

	var _Setup = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (document.getElementById("map")) {
		var map = new _Map2.default(_Setup.Setup);
		map.build();

		// grab all of the links to show/hide the hospitals
		var classname = document.getElementsByClassName("show-hide");

		// add event listeners to each of the hospital toggles
		Array.from(classname).forEach(function (element) {
			element.addEventListener('click', function (e) {
				map.showMarker(e.target.dataset.hospitalId);
			}, map);
		});

		document.getElementById("age-filter").addEventListener("change", function (e) {
			map.filterByAge(e.target.value);
		}, map);

		document.getElementById("service-type-filter").addEventListener("change", function (e) {
			map.filterByType(e.target.value);
		}, map);
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _googleMaps = __webpack_require__(2);

	var _googleMaps2 = _interopRequireDefault(_googleMaps);

	var _Marker = __webpack_require__(3);

	var _Marker2 = _interopRequireDefault(_Marker);

	var _Services = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Map = function () {
		/**
	  * class constructor
	  * 
	  */
		function Map(config) {
			_classCallCheck(this, Map);

			this.config = config;
			this.services = _Services.Services;
			this.kmlLayer = null;
			this.markers = [];
			this.map = null;
			_googleMaps2.default.KEY = this.config.apiKey;
			this.ages = {};
			this.serviceTypes = {};
			this.filters = [];
		}

		/**
	  * build the map and all associated features and data
	  * 
	  */


		_createClass(Map, [{
			key: "build",
			value: function build() {
				var _this = this;

				_googleMaps2.default.load(function (google) {
					_this.map = new google.maps.Map(document.querySelector(_this.config.selector), {
						center: new google.maps.LatLng(_this.config.centreLat, _this.config.centreLang),
						zoom: _this.config.startZoom,
						mapTypeId: _this.config.mapType
					});

					_this.loadKml(_this.config.kml.start);
					_this.addMarkers(true);
					_this.compileAges();
					_this.compileServiceTypes();
				});
			}

			/**
	   * load up the KML overlay
	   * 
	   */

		}, {
			key: "loadKml",
			value: function loadKml(src) {
				var _this2 = this;

				_googleMaps2.default.load(function (google) {
					_this2.kmlLayer = new google.maps.KmlLayer({
						url: src
					});

					_this2.kmlLayer.setMap(_this2.map);
				});
			}

			/**
	   * add all of the service markers to the map
	   * 
	   */

		}, {
			key: "addMarkers",
			value: function addMarkers(displayOnMap) {
				var _this3 = this;

				// iterate over the services and put them on the map
				this.services.forEach(function (service) {
					var marker = new _Marker2.default(service);
					_this3.markers.push(marker);

					if (displayOnMap) {
						_this3.showMarker(marker.id);
					}
				});
			}

			/**
	   * show a map marker
	   * 
	   */

		}, {
			key: "showMarker",
			value: function showMarker(markerId) {
				var _this4 = this;

				this.markers.forEach(function (marker) {
					if (marker.id === parseInt(markerId)) {
						marker.pin.setMap(marker.setVisibility(_this4.map));
					}
				}, markerId);
			}

			/**
	   * convert the service list into a list of ages Vs services
	   *
	   */

		}, {
			key: "compileAges",
			value: function compileAges() {
				var _this5 = this;

				this.markers.forEach(function (service) {
					for (var age in service.ages) {
						age = service.ages[age];

						if (!_this5.ages[age]) {
							_this5.ages[age] = [];
						}

						_this5.ages[age].push(service);
					}
				});
			}
			/**
	   * convert the service list into a list of service types Vs services
	   * 
	   */

		}, {
			key: "compileServiceTypes",
			value: function compileServiceTypes() {
				var _this6 = this;

				this.markers.forEach(function (service) {
					for (var index in service.services) {
						var serviceType = service.services[index];

						if (!_this6.serviceTypes[serviceType]) {
							_this6.serviceTypes[serviceType] = [];
						}

						_this6.serviceTypes[serviceType].push(service);
					}
				});
			}

			/**
	   * filter the services by age selection
	   * 
	   */

		}, {
			key: "filterByAge",
			value: function filterByAge(selected) {
				this.addFilter("ageFilter", selected).apply();
			}

			/**
	   * filter the list of services by service type
	   *
	   */

		}, {
			key: "filterByType",
			value: function filterByType(selected) {
				this.addFilter("typeFilter", selected).apply();
			}

			/**
	   * iterate over the selected filters and apply them
	   *
	   */

		}, {
			key: "apply",
			value: function apply() {
				var _this7 = this;

				console.log(JSON.stringify(this.filters));
				this.filters.forEach(function (filter) {
					_this7[filter.method](filter.value);
				});
			}

			/**
	   * apply out the age filter
	   * 
	   */

		}, {
			key: "ageFilter",
			value: function ageFilter(selected) {
				var _this8 = this;

				this.showAllMarkers();

				new Promise(function (resolve, reject) {
					resolve(_this8.getActiveMarkers());
				}).then(function (markers) {
					if (!selected) {
						return _this8.showAllMarkers();
					}

					var _loop = function _loop(age) {
						if (age === selected) {
							// filter the ages to just show the ones that meet the chosen
							// filter option
							var filtered = markers.filter(function (marker) {
								return _this8.ages[age].includes(marker);
							});

							return {
								v: _this8.showMarkers(filtered)
							};
						}
					};

					for (var age in _this8.ages) {
						var _ret = _loop(age);

						if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
					}
				});
			}

			/**
	   * apply the service type filter
	   * 
	   */

		}, {
			key: "typeFilter",
			value: function typeFilter(selected) {
				var _this9 = this;

				new Promise(function (resolve, reject) {
					resolve(_this9.getActiveMarkers());
				}).then(function (markers) {
					if (!selected) {
						return _this9.showAllMarkers();
					}

					var _loop2 = function _loop2(serviceType) {
						if (serviceType === selected) {
							// filter the service types to just show the ones that meet 
							// the selected value
							var filtered = markers.filter(function (marker) {
								return _this9.serviceTypes[serviceType].includes(marker);
							});

							return {
								v: _this9.showMarkers(filtered)
							};
						}
					};

					for (var serviceType in _this9.serviceTypes) {
						var _ret2 = _loop2(serviceType);

						if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
					}
				});
			}

			/**
	   * show all of the markers in a provided list
	   * 
	   */

		}, {
			key: "showMarkers",
			value: function showMarkers(markers) {
				var _this10 = this;

				this.hideAllMarkers();

				markers.forEach(function (marker) {
					_this10.showMarker(marker.id);
				});
			}

			/**
	   * show all of the markers regardless of previous selection
	   * 
	   */

		}, {
			key: "showAllMarkers",
			value: function showAllMarkers() {
				var _this11 = this;

				this.markers.forEach(function (marker) {
					marker.pin.setMap(_this11.map);
					marker.show();
				});
			}

			/**
	   * hide all of the markers regardless of previous selection
	   * 
	   */

		}, {
			key: "hideAllMarkers",
			value: function hideAllMarkers() {
				this.markers.forEach(function (marker) {
					marker.pin.setMap(null);
					marker.hide();
				});
			}

			/**
	   * add the name of a filter function to the map
	   * 
	   */

		}, {
			key: "addFilter",
			value: function addFilter(filter, option) {
				this.applyFilter(filter, option);

				return this;
			}

			/**
	   * update an existing filter with the newly selected value
	   *
	   */

		}, {
			key: "applyFilter",
			value: function applyFilter(filter, option) {
				for (var active in this.filters) {
					if (this.filters[active].method === filter) {
						return this.filters[active].value = option;
					}
				}

				return this.filters.push({ method: filter, value: option });
			}

			/**
	   * retrieve all currently active markers
	   * 
	   */

		}, {
			key: "getActiveMarkers",
			value: function getActiveMarkers() {
				var activeMarkers = [];

				this.markers.forEach(function (marker) {
					if (!marker.isHidden()) {
						activeMarkers.push(marker);
					}
				});

				return activeMarkers;
			}
		}]);

		return Map;
	}();

	exports.default = Map;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {

		if (root === null) {
			throw new Error('Google-maps package can be used only in browser');
		}

		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (typeof exports === 'object') {
			module.exports = factory();
		} else {
			root.GoogleMapsLoader = factory();
		}

	})(typeof window !== 'undefined' ? window : null, function() {


		'use strict';


		var googleVersion = '3.18';

		var script = null;

		var google = null;

		var loading = false;

		var callbacks = [];

		var onLoadEvents = [];

		var originalCreateLoaderMethod = null;


		var GoogleMapsLoader = {};


		GoogleMapsLoader.URL = 'https://maps.googleapis.com/maps/api/js';

		GoogleMapsLoader.KEY = null;

		GoogleMapsLoader.LIBRARIES = [];

		GoogleMapsLoader.CLIENT = null;

		GoogleMapsLoader.CHANNEL = null;

		GoogleMapsLoader.LANGUAGE = null;

		GoogleMapsLoader.REGION = null;

		GoogleMapsLoader.VERSION = googleVersion;

		GoogleMapsLoader.WINDOW_CALLBACK_NAME = '__google_maps_api_provider_initializator__';


		GoogleMapsLoader._googleMockApiObject = {};


		GoogleMapsLoader.load = function(fn) {
			if (google === null) {
				if (loading === true) {
					if (fn) {
						callbacks.push(fn);
					}
				} else {
					loading = true;

					window[GoogleMapsLoader.WINDOW_CALLBACK_NAME] = function() {
						ready(fn);
					};

					GoogleMapsLoader.createLoader();
				}
			} else if (fn) {
				fn(google);
			}
		};


		GoogleMapsLoader.createLoader = function() {
			script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = GoogleMapsLoader.createUrl();

			document.body.appendChild(script);
		};


		GoogleMapsLoader.isLoaded = function() {
			return google !== null;
		};


		GoogleMapsLoader.createUrl = function() {
			var url = GoogleMapsLoader.URL;

			url += '?callback=' + GoogleMapsLoader.WINDOW_CALLBACK_NAME;

			if (GoogleMapsLoader.KEY) {
				url += '&key=' + GoogleMapsLoader.KEY;
			}

			if (GoogleMapsLoader.LIBRARIES.length > 0) {
				url += '&libraries=' + GoogleMapsLoader.LIBRARIES.join(',');
			}

			if (GoogleMapsLoader.CLIENT) {
				url += '&client=' + GoogleMapsLoader.CLIENT + '&v=' + GoogleMapsLoader.VERSION;
			}

			if (GoogleMapsLoader.CHANNEL) {
				url += '&channel=' + GoogleMapsLoader.CHANNEL;
			}

			if (GoogleMapsLoader.LANGUAGE) {
				url += '&language=' + GoogleMapsLoader.LANGUAGE;
			}

			if (GoogleMapsLoader.REGION) {
				url += '&region=' + GoogleMapsLoader.REGION;
			}

			return url;
		};


		GoogleMapsLoader.release = function(fn) {
			var release = function() {
				GoogleMapsLoader.KEY = null;
				GoogleMapsLoader.LIBRARIES = [];
				GoogleMapsLoader.CLIENT = null;
				GoogleMapsLoader.CHANNEL = null;
				GoogleMapsLoader.LANGUAGE = null;
				GoogleMapsLoader.REGION = null;
				GoogleMapsLoader.VERSION = googleVersion;

				google = null;
				loading = false;
				callbacks = [];
				onLoadEvents = [];

				if (typeof window.google !== 'undefined') {
					delete window.google;
				}

				if (typeof window[GoogleMapsLoader.WINDOW_CALLBACK_NAME] !== 'undefined') {
					delete window[GoogleMapsLoader.WINDOW_CALLBACK_NAME];
				}

				if (originalCreateLoaderMethod !== null) {
					GoogleMapsLoader.createLoader = originalCreateLoaderMethod;
					originalCreateLoaderMethod = null;
				}

				if (script !== null) {
					script.parentElement.removeChild(script);
					script = null;
				}

				if (fn) {
					fn();
				}
			};

			if (loading) {
				GoogleMapsLoader.load(function() {
					release();
				});
			} else {
				release();
			}
		};


		GoogleMapsLoader.onLoad = function(fn) {
			onLoadEvents.push(fn);
		};


		GoogleMapsLoader.makeMock = function() {
			originalCreateLoaderMethod = GoogleMapsLoader.createLoader;

			GoogleMapsLoader.createLoader = function() {
				window.google = GoogleMapsLoader._googleMockApiObject;
				window[GoogleMapsLoader.WINDOW_CALLBACK_NAME]();
			};
		};


		var ready = function(fn) {
			var i;

			loading = false;

			if (google === null) {
				google = window.google;
			}

			for (i = 0; i < onLoadEvents.length; i++) {
				onLoadEvents[i](google);
			}

			if (fn) {
				fn(google);
			}

			for (i = 0; i < callbacks.length; i++) {
				callbacks[i](google);
			}

			callbacks = [];
		};


		return GoogleMapsLoader;

	});


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _googleMaps = __webpack_require__(2);

	var _googleMaps2 = _interopRequireDefault(_googleMaps);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Marker = function () {

		/**
	  * class constructor
	  * 
	  */
		function Marker(config) {
			var _this = this;

			_classCallCheck(this, Marker);

			this.pin = null;
			this.id = config.id;
			this.hidden = true;
			this.ages = config.ages;
			this.services = config.services;

			_googleMaps2.default.load(function (google) {
				_this.pin = new google.maps.Marker({
					position: { lat: config.location.lat, lng: config.location.lng }
				});
			});

			return this;
		}

		/**
	  * toggle the visibility flag of the marker
	  * 
	  */


		_createClass(Marker, [{
			key: "setVisibility",
			value: function setVisibility(map) {
				if (this.hidden) {
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

		}, {
			key: "hide",
			value: function hide() {
				this.hidden = true;
			}

			/**
	   * set the visibility to visible
	   * 
	   */

		}, {
			key: "show",
			value: function show() {
				this.hidden = false;
			}

			/**
	   * is this marker currently active
	   * 
	   */

		}, {
			key: "isHidden",
			value: function isHidden() {
				console.log("IS HIDDEN", this.hidden);
				return this.hidden;
			}
		}]);

		return Marker;
	}();

	exports.default = Marker;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var Services = exports.Services = Object.freeze([{
		id: 1,
		location: {
			lat: -37.6527073,
			lng: 145.0120898
		},
		ages: ["youth", "adult"],
		services: ["inpatient-unit", "residential", "community-care", "community-team"]
	}, {
		id: 2,
		location: {
			lat: -37.7987306,
			lng: 144.9541191
		},
		ages: ["youth"],
		services: ["prevention-recovery", "inpatient-unit", "general-admin-queries", "emergency-mental-health"]
	}, {
		id: 3,
		location: {
			lat: -37.88719,
			lng: 144.6965135
		},
		ages: ["senior"],
		services: ["community-team", "specialist-service"]
	}]);

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var Setup = exports.Setup = Object.freeze({
		apiKey: "AIzaSyCbDyxAp1SlhHAfVJGH3F1m4ZX43tQhXj4",
		selector: "#map",
		centreLat: -37.8055124,
		centreLang: 144.9746755,
		startZoom: 14,
		mapType: "roadmap",
		kml: {
			start: 'https://raw.githubusercontent.com/paulschneider/kml-test/master/source-4.kml?123132654',
			replacement: 'https://raw.githubusercontent.com/paulschneider/kml-test/master/source-5.kml?123132654'
		}
	});

/***/ }
/******/ ]);