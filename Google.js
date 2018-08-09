
AppMap.Map = {
    key: "AIzaSyDQyD48_T-4Ji2b9OJlR9C1wPO2QznoOmg",
    Walking: [],
    Cluster: true,
    TimerId: null,
    Radius: null,
    drawingManager:null,
    ShowRoute: true,
    directionsService: null,
    directionsDisplay: null,
    placesService: null,
    GenerateEventZoom: true,
    FitBoundsMap: true,
    fitBoundsOn: true,
    BoundsChangedZoom: true,
    GlobalCenter: null,
    GlobalZoom: 0,
    TempBaloonID: '',
    InfoWindow: null,
    ListenerClick: null,
    ListenerZoom: null,
    ClearPointBoundsChanged: true,
    trafficLayer: null,
    transitLayer: null,
    map: null,
    SelectMarker: null,
    InputSearch: { pointFROM: null, pointTO: null },
    MapParam: { BondsZoomEvent: false, StartPoint: null, EndPoint: null },
    LeftBottom: { Latitude: 0, Longitude: 0 },
    RightTop: { Latitude: 0, Longitude: 0 },
    NE: { Latitude: 0, Longitude: 0 },
    SW: { Latitude: 0, Longitude: 0 },
    geocoder: null,
    marker: null,
    polygon: null,
    rectangle: null,
    PointMap: [],
    FitBoundsPoint: [],
    markerCluster: null,
    Positionlocation: null,
    ElementMap: null,
    InfoWindowsOpen: null,
    SavePoints: [],
    PreservePoints: [],
    ObjPreservePoints: {},
    GPSPoint: [],
    GPSPointID: {},
    CallBack: {
        'MapClick': function (Lat, Lon) { },
        'MapClickPlaceId': function (place) { },
        'onInit': function (status) { },
    },
    Set: function (cb, fn) {
        this.CallBack[cb] = fn;
    },
    Call_CallBack: function (e, p) {
        if (e in this.CallBack) {
            this.CallBack[e](p);
        }
    },
    Init: function (e) {
        this.TimerId = setTimeout(function () { AppMap.Fail() }, 180000);
        this.ElementMap = e;
        $.getScript("https://maps.googleapis.com/maps/api/js?key=" + this.key + "&v=3.32&libraries=places,geometry,drawing&signed_in=true&language=" + CurrentLamgCulture)
        .done(function (script, status) {
            clearTimeout(AppMap.Map.TimerId);
            AppMap.Map.initMap(AppMap.Map.ElementMap);
            AppMap.Map.Call_CallBack('onInit', true);
            $.getScript("/scripts/GoogleMarkerClusterer.js", function (data, textStatus, jqxhr) {
            });
        })
        .fail(function (jqxhr, settings, exception) {
            AppMap.Map.Call_CallBack('onInit', false);
            AppMap.Fail();
        });

    },

    Fail: function () {
        AppMap.Map.Call_CallBack("Fail", AppMap.Map.ElementMap);
    },
    initMap: function (e) {
        var mapstyle = [{
            "featureType": "water",
            "stylers": [{ "visibility": "on" }, { "color": "#b5cbe4" }]
        }, { "featureType": "landscape", "stylers": [{ "color": "#efefef" }] }, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{ "color": "#83a5b0" }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{ "color": "#bdcdd3" }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
        }, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{ "color": "#e3eed3" }]
        }, {
            "featureType": "administrative",
            "stylers": [{ "visibility": "on" }, { "lightness": 33 }]
        }, { "featureType": "road" }, {
            "featureType": "poi.park",
            "elementType": "labels",
            "stylers": [{ "visibility": "on" }, { "lightness": 20 }]
        }, {}, { "featureType": "road", "stylers": [{ "lightness": 20 }] }];

        var coords = { lat: 27.215556209029693, lng: 18.45703125 };
        this.map = new google.maps.Map(document.getElementById(e), {
            zoom: 3,
            center: coords,
            minZoom: 3,
            scaleControl: true,
            //  fullscreenControl: true,
            //  dragging:false,
            //  draggable: false,
            draggableCursor: 'default',
            disableDoubleClickZoom: true,
            //  zIndex: 99,
            // clickableIcons: false,
            disableDefaultUI: true,
            styles: mapstyle

        });


        this.geocoder = new google.maps.Geocoder();
        this.placesService = new google.maps.places.PlacesService(this.map);

        google.maps.event.addListener(this.map, 'bounds_changed', function () {
            AppMap.Map.Call_CallBack("CountPoint", AppMap.Map.PointMap.length);
        });

        google.maps.event.addListener(this.map, 'idle', function () {
            var bounds = AppMap.Map.map.getBounds();
            if (bounds) {
                var SW = bounds.getSouthWest();
                var NE = bounds.getNorthEast();
                AppMap.Map.SW.Latitude = SW.lat();
                AppMap.Map.SW.Longitude = SW.lng();
                AppMap.Map.NE.Latitude = NE.lat();
                AppMap.Map.NE.Longitude = NE.lng();

                if (AppMap.BoundsChangedZoom) {
                    AppMap.Map.Call_CallBack("BoundsChanged");
                }
            }
        });

        AppMap.BoundsChangedZoom = AppMap.Map.BoundsChangedZoom;
        this.ListenerZoom = google.maps.event.addListener(this.map, 'zoom_changed', function () {
            AppMap.Map.GlobalZoom = AppMap.Map.map.getZoom();
            AppMap.Map.Call_CallBack("ChangeZoom", AppMap.Map.GlobalZoom);
            AppMap.HideBaloon();
        });


        AppMap.Map.trafficLayer = new google.maps.TrafficLayer();
        AppMap.Map.transitLayer = new google.maps.TransitLayer();
        google.maps.event.addListener(this.map, 'click', function (event) {
            if (AppMap.Map.GlobalZoom > 8) {
                AppMap.Map.fitBoundsOn = false;

                if (event.placeId) {
                    event.stop();
                    AppMap.Map.Call_CallBack('MapClickPlaceId', event.placeId);
                }
                else {
                    AppMap.Map.placeMarker(event.latLng);
                }
            }
        });

    },
    DisableZoomChangeMap: function () {
        AppMap.Map.GenerateEventZoom = false
    },
    EnableZoomChangeMap: function () {
        AppMap.Map.GenerateEventZoom = true;
    },

    GetBounds: function () {
        return {
            SW: this.SW,
            NE: this.NE
        };
    },


    MapSetCenter: function (geo, zoom) {
        lat = geo[0];
        lng = geo[1];
        this.map.setCenter({ lat: lat, lng: lng });
        this.map.setZoom(zoom);
    },
    placeMarker: function (location) {
        c = {
            "Latitude": location.lat(),
            "Longitude": location.lng()
        };
        this.Positionlocation = location;
        this.Call_CallBack('MapClick', c);
    },


    GetAddress: function (Latitude, Longitude) {
        latLng = ({ 'lat': Latitude, 'lng': Longitude });
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };
        this.geocoder.geocode({ 'latLng': latLng },
          function (results, status) {
              if (results != null) {
                  AppMap.Map.SearchResultGetAddress(results[0], status, false);
              }
          });
    },
    SetPoints: function (Points) {
        if (Points == null) {
            Points = this.PreservePoints;
        } else {
            this.SavePoints = Points;

        }
        var mcOptions = {
            gridSize: 80, maxZoom: 18, zoomOnClick: true, ignoreHidden: true, styles: [
                     {
                         textColor: 'black',
                         url: '/images/map/icon_pointgroup.png',
                         anchorText: [0, -2],
                         height: 44,
                         width: 44
                     }]
        };

        this.PointMap = [];
        var Cont = this.PointMap.concat(this.GPSPoint);
        this.PointMap = Cont;
        for (n = 0; n < Points.length; n++) {
            point = AppMap.ValidationPoint(Points[n])
            if (this.ObjPreservePoints[point.ID] == null) {
                this.PreservePoints.push(point);
                this.ObjPreservePoints[point.ID] = point;
            }

            if (AppMap.Filter[point.Type]) {
                var obj = new google.maps.Marker({
                    position: { lat: point.Position.Latitude, lng: point.Position.Longitude },
                    draggable: false,
                    clickable: true,
                    zIndex: 9999,
                    icon: { url: point.IconType },
                    title: point.Title
                });

                obj["Point"] = point;
                google.maps.event.addListener(obj, 'click', function (event) {
                    AppMap.Map.SelectMarker = this;
                    AppMap.Map.Call_CallBack('PointClick', this.Point);
                });
                this.PointMap.push(obj);
            }
        }


        if (Points.length != 0) {
            this.markerCluster = new MarkerClusterer(this.map, this.PointMap, mcOptions);
        }
        AppMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },



    ShowBaloon: function (html, e) {
        this.HideBaloon();
        var option = {
            content: html,
            position: new google.maps.LatLng(e.Latitude, e.Longitude),
            pixelOffset: new google.maps.Size(-195, -55),
            zIndex: 9999,
            alignBottom: true,
            enableEventPropagation: false,
            pane: "floatPane",
            infoBoxClearance: new google.maps.Size(1, 1),
        }

        this.InfoWindow = new InfoBox(option);
        this.InfoWindow.addListener("domready", function () {
            $(".item__baloon").on("click", function (event) {
                event.stopPropagation();
            });
        });
        this.InfoWindow.open(this.map);
        AppMap.Map.Call_CallBack('OpenBallon');
        //this.map.panTo(new google.maps.LatLng(e.Latitude, e.Longitude));
        this.InfoWindowsOpen = true;
        this.BoundsChangedZoom = false;

    },

    InfoWindowEvents: function () {
        google.maps.event.addListener(this.InfoWindow, 'closeclick', function () {
            this.BoundsChangedZoom = true;
        });
    },

    HideBaloon: function () {
        if (this.InfoWindow != null) {
            this.InfoWindow.close();
            this.InfoWindowsOpen = false;
            this.BoundsChangedZoom = true;
        }

    },
    ClearMap: function (e) {
        for (var i = 0; i < this.PointMap.length; i++) {
            this.PointMap[i].setMap(null);
        }
        if (this.markerCluster != null) {
            this.markerCluster.clearMarkers();

        };

        if (this.directionsDisplay != null) {
            for (i = 0; i < AppMap.Map.Walking.length; i++) {
                AppMap.Map.Walking[i].setMap(null);
            }

            this.directionsDisplay.setMap(null);
            this.directionsDisplay = null;
        }

        if (this.directionsDisplay == null) {
            //AppMap.Map.map.setOptions({ minZoom: 3 });
            // AppMap.Map.map.setOptions({ draggable: true });
        }

        //this.Radius
        if (this.Radius != null) {
            this.Radius.setMap(null);

        }

        if (this.drawingManager != null) {
            this.drawingManager.setMap(null);

        }

        //drawingManager

        if (e == false || e == undefined) {
            this.GPSPoint = [];
            this.GPSPointID = [];
        }

        this.PointMap = [];
        // AppMap.HideBaloon();
        AppMap.Map.Walking.Walking = [];
        AppMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },

    FitBounds: function (e, d) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < this.PointMap.length; i++) {
            bounds.extend(this.PointMap[i].getPosition());
        }
        if (this.PointMap.length > 1) {
            if (AppMap.Map.fitBoundsOn) {
                this.map.fitBounds(bounds);
                this.map.panToBounds(bounds);
            }
        }
        if (this.PointMap.length == 1) {
            this.map.setCenter({ lat: this.PointMap[0].position.lat(), lng: this.PointMap[0].position.lng() });
            this.map.setZoom(16);
        }
        //google.maps.event.addListener(this.map, 'idle', function () {
        //    AppMap.Map.MapRemove = true;
        //});

    },

    RouteMap: function (e, start, end) {
        try {
            this.ShowPoint(start, true, false);
            this.ShowPoint(end, true, false);
            if (e) {
                var directionsService = new google.maps.DirectionsService();
                var pOptions = {
                    strokeColor: "#007bff",
                    strokeOpacity: 0.9,
                    strokeWeight: 12,
                };
                AppMap.Map.directionsDisplay = new google.maps.DirectionsRenderer();
                AppMap.Map.directionsDisplay.setMap(AppMap.Map.map);

                AppMap.Map.directionsDisplay.setOptions({
                    polylineOptions: {
                        strokeColor: '#007bff',
                        strokeOpacity: 0.9,
                        strokeWeight: 5
                    },
                    suppressMarkers: true
                });
                var DateTime = '';
                var start = new google.maps.LatLng(start.Position.Latitude, start.Position.Longitude);
                var end = new google.maps.LatLng(end.Position.Latitude, end.Position.Longitude);
                AppMap.departureDateTimeTraffic = null;
                if (AppMap.departureDateTimeTraffic != null) {
                    DateTime = AppMap.departureDateTimeTraffic;
                }
                else {
                    DateTime = new Date(Date.now() + 3000);
                }
                var request = {
                    origin: start,
                    destination: end,
                    travelMode: google.maps.TravelMode.DRIVING,
                    drivingOptions: {
                        departureTime: new Date(Date.now() + 3000),
                        trafficModel: google.maps.TrafficModel.PESSIMISTIC
                    }

                };

                directionsService.route(request, function (result, status) {

                    if (status == google.maps.DirectionsStatus.OK) {
                        AppMap.Map.HideBaloon();
                        AppMap.Map.directionsDisplay.setDirections(result);
                        AppMap.Map.Walking = [];

                        // AppMap.Map.map.setOptions({ minZoom: AppMap.Map.GlobalZoom -2 });

                        var walkingLineSymbol = {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillOpacity: 1,
                            scale: 3
                        };

                        //var WalkingStart = new google.maps.Polyline({
                        //    path: [new google.maps.LatLng(result.request.origin.location.lat(), result.request.origin.location.lng()), new google.maps.LatLng(result.routes[0].legs[0].start_location.lat(), result.routes[0].legs[0].start_location.lng())],
                        //    strokeColor: '#007bff',
                        //    strokeOpacity: 0,
                        //    fillOpacity: 0,
                        //    icons: [{
                        //        icon: walkingLineSymbol,
                        //        offset: '0',
                        //        repeat: '10px'
                        //    }],
                        //});

                        //var WalkingEnd = new google.maps.Polyline({
                        //    path: [new google.maps.LatLng(result.request.destination.location.lat(), result.request.destination.location.lng()), new google.maps.LatLng(result.routes[0].legs[0].end_location.lat(), result.routes[0].legs[0].end_location.lng())],
                        //    strokeColor: '#007bff',
                        //    strokeOpacity: 0,
                        //    fillOpacity: 0,
                        //    icons: [{
                        //        icon: walkingLineSymbol,
                        //        offset: '0',
                        //        repeat: '10px'
                        //    }],
                        //});


                        //  WalkingStart.setMap(AppMap.Map.map);
                        //  WalkingEnd.setMap(AppMap.Map.map);         
                        //   AppMap.Map.Walking.push(WalkingStart,WalkingEnd);                  


                        var request2 = result.request;
                        var start = request2.origin.location.lat() + ',' + request2.origin.location.lng();
                        var end = request2.destination.location.lat() + ',' + request2.destination.location.lng();
                        var path = result['routes'][0].overview_polyline;
                        var markers = [];
                        var waypoints_labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
                        var waypoints_label_iter = 0;
                        markers.push("markers=color:green|label:" + waypoints_labels[waypoints_label_iter] + '|' + start);
                        markers.push("markers=color:red|label:" + waypoints_labels[++waypoints_label_iter] + '|' + end);
                        markers = markers.join('&');
                        RouteInfo = {
                            Time: result['routes'][0].legs[0].duration.text,
                            TimeValue: result['routes'][0].legs[0].duration.value,
                            Distance: result['routes'][0].legs[0].distance.text,
                            DistanceValue: result['routes'][0].legs[0].distance.value,
                            TimeTraffic: result['routes'][0].legs[0].duration_in_traffic.text,
                            TimeValueTraffic: result['routes'][0].legs[0].duration_in_traffic.value,
                            StaticMapUrl: 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=roadmap&path=enc:" + path + "&" + markers',
                        }
                        AppMap.Map.Call_CallBack('InfoRoute', RouteInfo);
                    } else {

                    }
                });
            }
        } catch (err) {
            console.log(err)
        }
    },

    SetZoomMin: function () {
        if (AppMap.Map.directionsDisplay != null) {
            google.maps.event.addListenerOnce(AppMap.Map.map, 'idle', function () {
                AppMap.Map.map.setOptions({ minZoom: AppMap.Map.map.getZoom() - 1 });

            });
        }
    },

    MapDefOption: function (e) {
        var coords = { lat: 27.215556209029693, lng: 18.45703125 };
        this.map.setCenter({ lat: coords.lat, lng: coords.lng });
        this.map.setZoom(3);

    },
    GetDetailsPoint: function (e) {
        this.placesService.getDetails({ placeId: e }, function (place, status) {
            AppMap.Map.SearchResultGetAddress(place, status, true);
        });
    },

    GetDetailsPointAutocomplete: function (point, type) {
        this.placesService.getDetails({ placeId: point.GooglePlaceID }, function (place, status) {
            if (place) {
                var componentAddress = {
                    street_number: 'short_name',
                    route: 'long_name',
                    locality: 'long_name',
                    postal_town: 'long_name',
                    administrative_area_level_1: 'short_name',
                    sublocality_level_1: 'long_name',
                    country: 'long_name',
                    postal_code: 'short_name'
                };

                for (var i = 0; i < place.address_components.length; i++) {
                    var addressType = place.address_components[i].types[0];
                    if (componentAddress[addressType]) {
                        var val = place.address_components[i][componentAddress[addressType]];
                        if (addressType == 'country') {
                            point.Address.Country.Title = val;
                            point.Address.Country.Type = 'country';
                        }
                        if (addressType == 'locality' || addressType == 'postal_town') {
                            point.Address.City.Title = val;
                            point.Address.City.Type = 'city';
                        }
                        if (addressType == 'administrative_area_level_1' || addressType == 'administrative_area_level_2') {
                            point.Address.District.Title = val;
                            point.Address.District.Type = 'district';
                        }

                        if (addressType == 'street_number') {
                            point.Address.House = val;
                        }
                        if (addressType == 'route') {
                            point.Address.Street = val;
                        }
                        if (addressType == 'postal_code') {
                            point.Address.PostCode = val;
                        }
                    }
                }
                point.Position.Latitude = place.geometry.location.lat();
                point.Position.Longitude = place.geometry.location.lng();
                point.SubType = place.types[0];
                point.Address.raw = place.formatted_address;
                point.Title = place.name;

                if (place.photos !== undefined) {
                    if ("photos" in place) {
                        if (place.photos.length > 0) {
                            point.Description.Images[0] = place.photos[0].getUrl({ 'maxWidth': 340, 'maxHeight': 340 });
                        }
                    }
                }

                if (type == 'SelectPoint') {
                    AppMap.Map.Call_CallBack('SetDetailsPoint', point);
                }
                else {
                    AppMap.Map.Call_CallBack('SetDetailsPointLocation', point);
                }
            }

        });
    },

    GetZoom: function () {
        return this.GlobalZoom;
    },
    ShowPoint: function (point, d, cluster) {
        if (point != null || point != undefined) {
            if (this.ObjPreservePoints[point.ID] == null) {
                this.PreservePoints.push(point);
                this.ObjPreservePoints[point.ID] = point;
            }

            var addMarker = true;

            for (var i = 0; i < this.PointMap.length; i++) {
                if (this.PointMap[i].Point.Position.Latitude == point.Position.Latitude && this.PointMap[i].Point.Position.Longitude == point.Position.Longitude) {
                    addMarker = false;
                }
            }

            if (addMarker) {
                var obj = new google.maps.Marker({
                    position: { lat: point.Position.Latitude, lng: point.Position.Longitude },
                    draggable: false,
                    zIndex: 999,
                    clickable: true,
                    // cursor: 'crosshair',
                    icon: { url: point.IconType },
                    title: point.Title
                });

                this.PointMap.push(obj);
                obj.setMap(this.map);

                if (cluster) {
                    if (this.markerCluster != null) {
                        this.markerCluster.addMarker(obj, d);
                    }
                }

                if (d) {
                    this.FitBounds(d);
                }

                obj["Point"] = point;
                if (this.GPSPointID[obj.Point.ID] == null) {
                    if (obj.Point.Type == 'internet') {
                        this.GPSPoint.push(obj);
                        this.GPSPointID[obj.Point.ID] = obj;
                    }
                }

                google.maps.event.addListener(obj, 'click', function (event) {
                    AppMap.Map.HideBaloon();
                    AppMap.Map.SelectMarker = this;
                    AppMap.Map.Call_CallBack('PointClick', this.Point);
                });
            }

        }
    },

    SearchPoint: function (text, location) {
        var service = new google.maps.places.AutocompleteService();
        var request = {};
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };

        if (location != null && location != undefined) {
            request = {
                location: new google.maps.LatLng({ lat: location.lat, lng: location.lng }),
                radius: '200000',
                strictbounds: true,
                input: text,
                language: CurrentLamgCulture
            };
        }
        else {
            request = {
                input: text,
                language: CurrentLamgCulture
            };
        }

        service.getPlacePredictions(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    var point = AppMap.GetDefPoint();
                    var id = UUID.generate();
                    if (typeof place.id != 'undefined') {
                        id = place.id;
                    }
                    point.ID = id;
                    point.GooglePlaceID = place.place_id;
                    point.Source.Source = "internet";
                    point.Source.SourcePath = "google map";
                    point.Type = "internet";
                    point.Title = place.description;
                    point.Description.Address = place.description;
                    var address = [];
                    for (var n = 0; n < place.terms.length; n++) {
                        var element = place.terms[n];
                        var title = element.value;
                        if (element.offset == 0) {
                            point.Title = title;
                        }
                        else {
                            address.push(title);
                            point.Address.raw = address.toString();
                        }

                    }
                    result_point.point.push(point);
                }
                result_point.error.isError = false;
            } else {
                result_point.error.isError = true;

                AppMap.Map.Call_CallBack('ErrorMap', status);
            }
            AppMap.Map.Call_CallBack('SearchAddress', result_point);

        });
    },

    SearchResult: function (results, status, bool) {
        var distance = 0;
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };

        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var address = place.formatted_address;
                if (bool == true) {
                    distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(AppMap.Map.locationPoint.lat, AppMap.Map.locationPoint.lng), new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
                }
                var point = AppMap.GetDefPoint();
                point.ID = place.id;
                point.Sourse = "internet";
                point.SoursePath = "google map";
                point.Address = address;
                point.Title = place.name;
                point.LongWay = distance;
                point.Position.Latitude = place.geometry.location.lat();
                point.Position.Longitude = place.geometry.location.lng();
                point.Description.Address = address;

                if (place.photos !== undefined) {
                    if ("photos" in place) {
                        if (place.photos.length > 0) {
                            point.Description.Images[0] = place.photos[0].getUrl({ 'maxWidth': 340, 'maxHeight': 340 });
                        }
                    }
                }
                result_point.point.push(point);
            }
            result_point.error.isError = false;
        } else {
            result_point.error.isError = true;

            AppMap.Map.Call_CallBack('ErrorMap', status);
        }
        AppMap.Map.Call_CallBack('SearchAddress', result_point);
    },

    SearchResultGetAddress: function (results, status, bool) {
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };
        if (status == google.maps.GeocoderStatus.OK) {
            var componentAddress = {
                street_number: 'short_name',
                route: 'long_name',
                locality: 'long_name',
                postal_town: 'long_name',
                administrative_area_level_1: 'short_name',
                sublocality_level_1: 'long_name',
                country: 'long_name',
                postal_code: 'short_name'
            };

            var place = results;
            if (bool == true) {
                var name = place.name;
            }
            else {
                name = place.formatted_address;
            }
            var point = AppMap.GetDefPoint();
            for (var i = 0; i < place.address_components.length; i++) {
                var addressType = place.address_components[i].types[0];
                if (componentAddress[addressType]) {
                    var val = place.address_components[i][componentAddress[addressType]];
                    if (addressType == 'country') {
                        point.Address.Country.Title = val;
                        point.Address.Country.Type = 'country';
                    }
                    if (addressType == 'locality' || addressType == 'postal_town') {
                        point.Address.City.Title = val;
                        point.Address.City.Type = 'city';
                    }
                    if (addressType == 'administrative_area_level_1' || addressType == 'administrative_area_level_2') {
                        point.Address.District.Title = val;
                        point.Address.District.Type = 'district';
                    }

                    if (addressType == 'street_number') {
                        point.Address.House = val;
                    }
                    if (addressType == 'route') {
                        point.Address.Street = val;
                    }
                    if (addressType == 'postal_code') {
                        point.Address.PostCode = val;
                    }
                }
            }

            var id = UUID.generate();
            if (typeof place.id != 'undefined') {
                id = place.id;
            }
            point.ID = id;
            point.GooglePlaceID = place.place_id;
            point.Source.Source = "internet";
            point.Source.SourcePath = "google map";
            point.Title = name;
            point.SubType = place.types[0];
            point.Type = "internet";
            point.Position.Latitude = place.geometry.location.lat();
            point.Position.Longitude = place.geometry.location.lng();
            point.Address.raw = place.formatted_address;
            if (place.photos !== undefined) {
                if ("photos" in place) {
                    if (place.photos.length > 0) {
                        point.Description.Images[0] = place.photos[0].getUrl({ 'maxWidth': 340, 'maxHeight': 340 });
                    }
                }
            }
            result_point.point.push(point);
            AppMap.Map.Call_CallBack('GetAddress', result_point);
        } else {
            result_point.error.isError = true;
            AppMap.Map.Call_CallBack('GetAddress', result_point);
        }
    },

    AddSetPoints: function (point) {
        this.SavePoints.push(point);
    },
    SavedPoints: function (point) {
        this.PreservePoints.push(point);
    },

    MarkerClusterPoint: function () {
        for (n = 0; n < AppMap.Map.markerCluster.clusters_.length; n++) {
            rt = AppMap.Map.markerCluster.clusters_[n];
            AppMap.Map.Call_CallBack('MarkerClusterPoint', this.markerCluster.clusters_.markers_);

        }
    },

    Resize: function (e) {
        try {
            var zoom = this.map.getZoom();
            var center = this.map.getCenter();
            if (e == true) {
                google.maps.event.trigger(this.map, 'resize');
                AppMap.FitBounds(true);
                AppMap.Map.map.setZoom(10);
                this.map.panTo(center);
            }
            else {
                google.maps.event.trigger(this.map, 'resize');
                AppMap.FitBounds(true);
                AppMap.Map.map.setZoom(zoom);
            }
        } catch (error) {

        }
    },

    VisibleMarker: function (e) {
        if (e == true) {
            for (var i = 0; i < this.PointMap.length; i++) {
                this.PointMap[i].setVisible(true);
            }
            if (this.markerCluster != null) {
                this.markerCluster.repaint();
            };
        }
        else {
            for (var i = 0; i < this.PointMap.length; i++) {
                this.PointMap[i].setVisible(false);
            }
            if (this.markerCluster != null) {
                this.markerCluster.repaint();
            };
        }
    },

    VisibleMarkerClusterer: function (e) {
        if (e == true) {

            if (this.markerCluster != null) {
                this.markerCluster.repaint();
            };
        }
        else {

            if (this.markerCluster != null) {
                this.markerCluster.repaint();
            };
        }
    },

    TransitLayer: function (e) {
        if (e) {
            this.transitLayer.setMap(AppMap.Map.map);
        }
        else {
            this.transitLayer.setMap(null);
        }
    },

    TrafficLayer: function (e) {
        if (e) {
            this.trafficLayer.setMap(AppMap.Map.map);
        }
        else {
            this.trafficLayer.setMap(null);
        }
    },

    ShowRadius: function (e) {
        this.HideRadius();
        if (AppMap.Map.SelectMarker != null) {
            var center = new google.maps.LatLng({ lat: AppMap.Map.SelectMarker.Point.Position.Latitude, lng: AppMap.Map.SelectMarker.Point.Position.Longitude });
            this.Radius = new google.maps.Circle({
                strokeColor: '#1E90FF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#1E90FF',
                fillOpacity: 0.35,             
                center: center,
                radius: 10000,
                editable: true,
                //draggable: true
            });

            this.Radius.setMap(this.map);
        }
    },

    HideRadius: function (e) {
        if (this.Radius != null) {
            this.Radius.setMap(null);

        }
    },

    // DrawingShapes


    DrawingShapes: function (e, type) {
        var drawingMode;
        var radius = 10000;
        if (this.drawingManager != null) {
            this.drawingManager.setMap(null);
        }

        if (this.Radius != null) {
            this.Radius.setMap(null);
        }
        var option = {};       
        if (type == 'circle') {
            drawingMode = google.maps.drawing.OverlayType.CIRCLE;
            var center = new google.maps.LatLng({ lat: AppMap.Map.SelectMarker.Point.Position.Latitude, lng: AppMap.Map.SelectMarker.Point.Position.Longitude });
            option = {
                strokeColor: '#1E90FF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#1E90FF',
                fillOpacity: 0.35,
                center: center,
                radius: radius,
                draggable: true,
                editable: true,
            }
        }

        if (type == 'polyne') {
            drawingMode = google.maps.drawing.OverlayType.POLYLINE;
            option = {
                strokeColor: '#1E90FF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#1E90FF',
                fillOpacity: 0.35,               
                draggable: true,
                editable: true,
            }
        }

        if (type == 'stop') {         
            drawingMode = null;
        }

        if (type != 'circle') {
            console.log('drawingManager')
            this.drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: drawingMode,
                drawingControl: false,            
                circleOptions: option,
                polylineOptions: option,
            });

            this.drawingManager.setMap(this.map);       

            google.maps.event.addListener(this.drawingManager, 'polylinecomplete', function (poline) {         
                var path = poline.getPath();
                var coords = path.getArray();           
                var x = [];
                var y = [];
                var array = poline.getPath().getArray();
                var length = array.length;
                for (var i = 0; i < length; i++) {
                    var item = array[i]
                    x.push(item.lat());
                    y.push(item.lng());
               }

                for (var i = 0; i < AppMap.Map.PointMap.length; i++) {
                    var point = AppMap.Map.PointMap[i];
                    var tt = AppMap.BelongingPolygon(AppMap.Map.PointMap[i].Point.Position, x, y);

                    if (tt == 0 || tt == false) {
                        point.setMap(null);
                        if (AppMap.Map.markerCluster != null) {
                            AppMap.Map.markerCluster.removeMarker(point);
                            // this.markerCluster.repaint();
                            //AppMap.Map.markerCluster.repaint();

                        };
                    }
                }
            });         
        }
        else {
            this.Radius = new google.maps.Circle(option);
            this.Radius.setMap(this.map);
            for (var i = 0; i < this.PointMap.length; i++) {
             var point = this.PointMap[i];
             var rt = AppMap.Distance(AppMap.Map.SelectMarker.Point.Position.Latitude, AppMap.Map.SelectMarker.Point.Position.Longitude, point.Point.Position.Latitude, point.Point.Position.Longitude);              
             console.log(rt)
             if (rt > 10) {
                 console.log(point)
                
                   // point.setVisible(false);
                 point.setMap(null);
                 if (this.markerCluster != null) {
                     this.markerCluster.removeMarker(point);

                 };

                }
            }
            google.maps.event.addListener(AppMap.Map.Radius, 'radius_changed', function (event) {
               // if (event.type == 'circle') {
              //  var radius = this.Radius.getRadius();
                console.log(AppMap.Map.Radius, 'radius')
                //}
            });
        }
},

};
