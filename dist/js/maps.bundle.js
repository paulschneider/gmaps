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

	var _Setup = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.IconMap = function (services) {
		var map = new _Map2.default(_Setup.Setup, services);
		map.build();

		// grab all of the links to show/hide the hospitals
		var classname = document.getElementsByClassName("front-centre");

		// add event listeners to each of the hospital toggles
		Array.from(classname).forEach(function (element) {
			element.addEventListener('click', function (e) {
				e.preventDefault();

				map.highlight(e.target.dataset.hospitalId);
			}, map);
		});

		// grab all of the links to filter by age range
		var ageLinks = document.getElementsByClassName("age-link");

		// add event listeners to each of the hospital toggles
		Array.from(ageLinks).forEach(function (link) {
			link.addEventListener('click', function (e) {
				e.preventDefault();

				map.filterByAge(e);
			}, map);
		});

		// grab all of the links to filter by service typ
		var serviceLinks = document.getElementsByClassName("service-type");

		// add event listeners to each of the links
		Array.from(serviceLinks).forEach(function (link) {
			link.addEventListener('click', function (e) {
				e.preventDefault();

				map.filterByType(e);
			}, map);
		});
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _googleMaps = __webpack_require__(2);

	var _googleMaps2 = _interopRequireDefault(_googleMaps);

	var _Marker = __webpack_require__(3);

	var _Marker2 = _interopRequireDefault(_Marker);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Map = function () {
		/**
	  * class constructor
	  * 
	  */
		function Map(config, services) {
			_classCallCheck(this, Map);

			this.config = config;
			this.services = services;
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

					_this.addMarkers(true);
					_this.compileAges();
					_this.compileServiceTypes();

					_this.map.addListener('idle', function (event) {
						_this._emitVisibleItemsEvent();
					});
				});
			}

			/**
	   * add all of the service markers to the map
	   * 
	   */

		}, {
			key: "addMarkers",
			value: function addMarkers(displayOnMap) {
				var _this2 = this;

				// iterate over the services and put them on the map
				this.services.forEach(function (service) {
					var marker = new _Marker2.default(service);
					_this2.markers.push(marker);

					if (displayOnMap) {
						_this2.showMarker(marker.id);
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
				var _this3 = this;

				this.markers.forEach(function (marker) {
					if (marker.id === parseInt(markerId)) {
						marker.pin.setMap(marker.setVisibility(_this3.map));
					}
				}, markerId);

				this._setBounds();
			}

			/**
	   * centre and focus on a selected marker
	   *
	   */

		}, {
			key: "focusMarker",
			value: function focusMarker(markerId) {
				var _this4 = this;

				this.hideAllMarkers();

				this.markers.forEach(function (marker) {
					if (marker.id === parseInt(markerId)) {
						marker.pin.setMap(marker.setVisibility(_this4.map));
					}
				}, markerId);
			}

			/**
	   * show or hide a selected map pin
	   *
	   */

		}, {
			key: "highlight",
			value: function highlight(markerId) {
				var _this5 = this;

				this.focusMarker(markerId);
				this._setBounds();

				var promise = new Promise(function (resolve, reject) {
					var marker = _this5._getMarker(markerId);

					if (marker) {
						resolve(marker);
					}
				}).then(function (marker) {
					var toggleEvent = new CustomEvent('gmaps-centre-marker', {
						'detail': {
							hospitalId: marker.id,
							marker: marker
						}
					});

					document.dispatchEvent(toggleEvent);
				});
			}

			/**
	   * convert the service list into a list of ages Vs services
	   *
	   */

		}, {
			key: "compileAges",
			value: function compileAges() {
				var _this6 = this;

				this.markers.forEach(function (service) {
					for (var age in service.ages) {
						age = service.ages[age];

						if (!_this6.ages[age]) {
							_this6.ages[age] = [];
						}

						_this6.ages[age].push(service);
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
				var _this7 = this;

				this.markers.forEach(function (service) {
					for (var index in service.services) {
						var serviceType = service.services[index];

						if (!_this7.serviceTypes[serviceType]) {
							_this7.serviceTypes[serviceType] = [];
						}

						_this7.serviceTypes[serviceType].push(service);
					}
				});
			}

			/**
	   * filter the services by age selection
	   * 
	   */

		}, {
			key: "filterByAge",
			value: function filterByAge(e) {
				document.getElementById("selected-age").innerHTML = e.target.innerHTML;
				this._setActiveClass(e);

				var selected = e.target.dataset.value;

				if (!selected) {
					return this.clearFilter("ageFilter").apply();
				}

				return this.addFilter("ageFilter", selected).apply();
			}

			/**
	   * filter the list of services by service type
	   *
	   */

		}, {
			key: "filterByType",
			value: function filterByType(e) {
				document.getElementById("selected-service").innerHTML = e.target.innerHTML;
				this._setActiveClass(e);

				var selected = e.target.dataset.value;

				if (!selected) {
					return this.clearFilter("typeFilter").apply();
				}

				return this.addFilter("typeFilter", selected).apply();
			}

			/**
	   * set the selected class as active
	   *
	   */

		}, {
			key: "_setActiveClass",
			value: function _setActiveClass(e) {
				var className = e.target.className;
				var els = document.getElementsByClassName(className);

				Array.from(els).forEach(function (el) {
					el.parentElement.classList.remove("active");
				});

				e.target.parentElement.classList.add("active");
			}

			/**
	   * iterate over the selected filters and apply them
	   *
	   */

		}, {
			key: "apply",
			value: function apply() {
				var _this8 = this;

				var methods = [];
				this.showAllMarkers();

				var _loop = function _loop(method) {
					methods.push(function () {
						var filter = _this8.filters[method];

						var promise = new Promise(function (resolve, reject) {
							resolve(_this8[filter.method](filter.value));
						});

						return promise;
					});
				};

				for (var method in this.filters) {
					_loop(method);
				}

				for (var i = 0; i < methods.length; i++) {
					methods[i]().then(methods[i + 1]);
				}

				return true;
			}

			/**
	   * apply out the age filter
	   * 
	   */

		}, {
			key: "ageFilter",
			value: function ageFilter(selected) {
				var _this9 = this;

				var markers = this.getActiveMarkers();

				var _loop2 = function _loop2(age) {
					if (age == selected) {
						// filter the ages to just show the ones that meet the chosen
						// filter option
						var filtered = markers.filter(function (marker) {
							return _this9.ages[age].includes(marker);
						});

						_this9.showMarkers(filtered);
					}
				};

				for (var age in this.ages) {
					_loop2(age);
				}

				// we need to return something for the promise to complete
				return true;
			}

			/**
	   * apply the service type filter
	   * 
	   */

		}, {
			key: "typeFilter",
			value: function typeFilter(selected) {
				var _this10 = this;

				var markers = this.getActiveMarkers();

				var _loop3 = function _loop3(serviceType) {
					if (serviceType == selected) {
						// filter the service types to just show the ones that meet 
						// the selected value
						var filtered = markers.filter(function (marker) {
							return _this10.serviceTypes[serviceType].includes(marker);
						});

						_this10.showMarkers(filtered);
					}
				};

				for (var serviceType in this.serviceTypes) {
					_loop3(serviceType);
				}

				// we need to return something for the promise to complete
				return true;
			}

			/**
	   * show all of the markers in a provided list
	   * 
	   */

		}, {
			key: "showMarkers",
			value: function showMarkers(markers, emitVisibleItems) {
				var _this11 = this;

				this.hideAllMarkers();

				markers.forEach(function (marker) {
					_this11.showMarker(marker.id);
				});
			}

			/**
	   * show all of the markers regardless of previous selection
	   * 
	   */

		}, {
			key: "showAllMarkers",
			value: function showAllMarkers() {
				this.showMarkers(this.markers);
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
	   * clear an applied filter type
	   *
	   */

		}, {
			key: "clearFilter",
			value: function clearFilter(cleareable) {
				for (var filter in this.filters) {
					if (this.filters[filter].method === cleareable) {
						this.filters = [].concat(_toConsumableArray(this.filters.slice(0, filter)), _toConsumableArray(this.filters.slice(filter + 1)));
					}
				}

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

				this._setBounds();
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

			/**
	   * set the map zoom to that of the visible markers
	   * 
	   */

		}, {
			key: "_setBounds",
			value: function _setBounds() {
				var _this12 = this;

				_googleMaps2.default.load(function (google) {
					var bounds = new google.maps.LatLngBounds();

					new Promise(function (resolve, reject) {
						resolve(_this12.getActiveMarkers());
					}).then(function (markers) {
						for (var m in markers) {
							bounds.extend(markers[m].pin.getPosition());
						}

						_this12.map.fitBounds(bounds);
						_this12._setZoom();
					});
				});
			}

			/**
	   * set the zoom level of the map
	   * 
	   */

		}, {
			key: "_setZoom",
			value: function _setZoom() {
				if (this.getActiveMarkers().length === 1) {
					return this.map.setZoom(16);
				}

				if (this.getActiveMarkers().length === 0) {
					return this._reset();
				}
			}

			/**
	   * reset the map to a sensible default
	   *
	   */

		}, {
			key: "_reset",
			value: function _reset() {
				this.map.setCenter(new google.maps.LatLng(this.config.centreLat, this.config.centreLang));
				this.map.setZoom(this.config.startZoom);
			}

			/**
	   * emit and event listing out the currently visible map markers
	   * 
	   */

		}, {
			key: "_emitVisibleItemsEvent",
			value: function _emitVisibleItemsEvent() {
				var items = [];

				this.getActiveMarkers().forEach(function (marker) {
					items.push({
						hospitalId: marker.id,
						marker: marker.pin
					});
				});

				var visibilityEvent = new CustomEvent('gmaps-visible-markers', {
					'detail': {
						"visibleItems": items
					}
				});

				document.dispatchEvent(visibilityEvent);
			}

			/**
	   * retrieve a given marker from the source list by its ID
	   *
	   */

		}, {
			key: "_getMarker",
			value: function _getMarker(markerId) {
				for (var marker in this.markers) {
					if (this.markers[marker].id == markerId) {
						return this.markers[marker];
					}
				}
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

				_this.pin.addListener("click", function (e) {
					_this._emitMarkerIdentity(_this.id);
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
				return this.hidden;
			}

			/**
	   * when interacted with this marker will provide its identity
	   *
	   */

		}, {
			key: "_emitMarkerIdentity",
			value: function _emitMarkerIdentity(identity) {
				var identityEvent = new CustomEvent('gmaps-marker-identity', {
					'detail': {
						marker: this.pin,
						hospitalId: identity
					}
				});

				document.dispatchEvent(identityEvent);
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