
TransferMap.Map = {
    key: "AIzaSyCb2GKOwMmvcseTS2hbQ_2TFbJKVTA1WBo",  //new original main
    // key: "AIzaSyDQyD48_T-4Ji2b9OJlR9C1wPO2QznoOmg",  //original additional
    //AIzaSyCb2GKOwMmvcseTS2hbQ_2TFbJKVTA1WBo //additional
    Walking: [],
    Cluster: true,
    TimerId: null,
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
        this.TimerId = setTimeout(function () { TransferMap.Fail() }, 180000);
        this.ElementMap = e;
        $.getScript("https://maps.googleapis.com/maps/api/js?key=" + this.key + "&v=3.32&libraries=places,geometry&signed_in=true&language=" + CurrentLamgCulture)
        .done(function (script, status) {
            clearTimeout(TransferMap.Map.TimerId);
            TransferMap.Map.initMap(TransferMap.Map.ElementMap);
            TransferMap.Map.Call_CallBack('onInit', true);
            $.getScript("/scripts/GoogleMarkerClusterer.js", function (data, textStatus, jqxhr) {
            });
        })
        .fail(function (jqxhr, settings, exception) {
            TransferMap.Map.Call_CallBack('onInit', false);
            TransferMap.Fail();
        });

    },

    Fail: function () {
        TransferMap.Map.Call_CallBack("Fail", TransferMap.Map.ElementMap);
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
            TransferMap.Map.Call_CallBack("CountPoint", TransferMap.Map.PointMap.length);
        });

        google.maps.event.addListener(this.map, 'idle', function () {
            var bounds = TransferMap.Map.map.getBounds();
            if (bounds) {
                var SW = bounds.getSouthWest();
                var NE = bounds.getNorthEast();
                TransferMap.Map.SW.Latitude = SW.lat();
                TransferMap.Map.SW.Longitude = SW.lng();
                TransferMap.Map.NE.Latitude = NE.lat();
                TransferMap.Map.NE.Longitude = NE.lng();

                if (TransferMap.BoundsChangedZoom) {
                    TransferMap.Map.Call_CallBack("BoundsChanged");
                }
            }
        });

        TransferMap.BoundsChangedZoom = TransferMap.Map.BoundsChangedZoom;
        this.ListenerZoom = google.maps.event.addListener(this.map, 'zoom_changed', function () {
            TransferMap.Map.GlobalZoom = TransferMap.Map.map.getZoom();
            TransferMap.Map.Call_CallBack("ChangeZoom", TransferMap.Map.GlobalZoom);
            TransferMap.HideBaloon();
        });


        TransferMap.Map.trafficLayer = new google.maps.TrafficLayer();
        TransferMap.Map.transitLayer = new google.maps.TransitLayer();
        google.maps.event.addListener(this.map, 'click', function (event) {
            if (TransferMap.Map.GlobalZoom > 8) {
                TransferMap.Map.fitBoundsOn = false;

                if (event.placeId) {
                    event.stop();
                    TransferMap.Map.Call_CallBack('MapClickPlaceId', event.placeId);
                }
                else {
                    TransferMap.Map.placeMarker(event.latLng);
                }
            }
        });

    },
    DisableZoomChangeMap: function () {
        TransferMap.Map.GenerateEventZoom = false
    },
    EnableZoomChangeMap: function () {
        TransferMap.Map.GenerateEventZoom = true;
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
                  TransferMap.Map.SearchResultGetAddress(results[0], status, false);
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
            point = TransferMap.ValidationPoint(Points[n])
            if (this.ObjPreservePoints[point.ID] == null) {
                this.PreservePoints.push(point);
                this.ObjPreservePoints[point.ID] = point;
            }

            if (TransferMap.Filter[point.Type]) {
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
                    TransferMap.Map.SelectMarker = this;
                    TransferMap.Map.Call_CallBack('PointClick', this.Point);
                });
                this.PointMap.push(obj);
            }
        }


        if (Points.length != 0) {
            this.markerCluster = new MarkerClusterer(this.map, this.PointMap, mcOptions);
        }
        TransferMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },



    ShowBaloon: function (html, e, type) {
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
        if (type == 'internet') {
            TransferMap.Map.Call_CallBack('OpenBallon');
        }
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
            for (i = 0; i < TransferMap.Map.Walking.length; i++) {
                TransferMap.Map.Walking[i].setMap(null);
            }

            this.directionsDisplay.setMap(null);
            this.directionsDisplay = null;
        }

        if (this.directionsDisplay == null) {
            //TransferMap.Map.map.setOptions({ minZoom: 3 });
            // TransferMap.Map.map.setOptions({ draggable: true });
        }


        if (e == false || e == undefined) {
            this.GPSPoint = [];
            this.GPSPointID = [];
        }

        this.PointMap = [];
        TransferMap.Map.Walking.Walking = [];
        TransferMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },

    FitBounds: function (e, center) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < this.PointMap.length; i++) {
            bounds.extend(this.PointMap[i].getPosition());
        }
        if (this.PointMap.length > 1) {
            if (TransferMap.Map.fitBoundsOn) {
                this.map.fitBounds(bounds);
                this.map.panToBounds(bounds);
            }
        }
        if (center) {
            if (this.PointMap.length == 1) {
                this.map.setCenter({ lat: this.PointMap[0].position.lat(), lng: this.PointMap[0].position.lng() });
                this.map.setZoom(16);          
            }
        }
        else {
            if (this.PointMap.length == 1) {
                this.map.setCenter({ lat: this.PointMap[0].position.lat(), lng: this.PointMap[0].position.lng() });
                this.map.setZoom(TransferMap.Map.GlobalZoom);
            }
        }
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
                TransferMap.Map.directionsDisplay = new google.maps.DirectionsRenderer();
                TransferMap.Map.directionsDisplay.setMap(TransferMap.Map.map);

                TransferMap.Map.directionsDisplay.setOptions({
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
                TransferMap.departureDateTimeTraffic = null;
                if (TransferMap.departureDateTimeTraffic != null) {
                    DateTime = TransferMap.departureDateTimeTraffic;
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
                        TransferMap.Map.HideBaloon();
                        TransferMap.Map.directionsDisplay.setDirections(result);
                        TransferMap.Map.Walking = [];

                        // TransferMap.Map.map.setOptions({ minZoom: TransferMap.Map.GlobalZoom -2 });

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


                        //  WalkingStart.setMap(TransferMap.Map.map);
                        //  WalkingEnd.setMap(TransferMap.Map.map);         
                        //   TransferMap.Map.Walking.push(WalkingStart,WalkingEnd);                  


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
                        TransferMap.Map.Call_CallBack('InfoRoute', RouteInfo);
                    } else {

                    }
                });
            }
        } catch (err) {
            console.log(err)
        }
    },

    SetZoomMin: function () {
        if (TransferMap.Map.directionsDisplay != null) {
            google.maps.event.addListenerOnce(TransferMap.Map.map, 'idle', function () {
                TransferMap.Map.map.setOptions({ minZoom: TransferMap.Map.map.getZoom() - 1 });

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
            TransferMap.Map.SearchResultGetAddress(place, status, true);
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

               console.log(place, 'PLACE')

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
				point.VisiblePoint = true;
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
                    TransferMap.Map.Call_CallBack('SetDetailsPoint', point);
                }
                else {
                    TransferMap.Map.Call_CallBack('SetDetailsPointLocation', point);
                }
            }

        });
    },

    GetZoom: function () {
        return this.GlobalZoom;
    },
    ShowPoint: function (point, d, cluster, center) {
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
                    this.FitBounds(d,center);
                }

                obj["Point"] = point;
                if (this.GPSPointID[obj.Point.ID] == null) {
                    if (obj.Point.Type == 'internet') {
                        this.GPSPoint.push(obj);
                        this.GPSPointID[obj.Point.ID] = obj;
                    }
                }

                google.maps.event.addListener(obj, 'click', function (event) {
                    TransferMap.Map.HideBaloon();
                    TransferMap.Map.SelectMarker = this;
                    TransferMap.Map.Call_CallBack('PointClick', this.Point);
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
            console.log(results, 'getPlacePredictions')
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    var point = TransferMap.GetDefPoint();
                    var id = UUID.generate();
                    if (typeof place.id != 'undefined') {
                        id = place.id;
                    }
                    point.ID = id;
                    point.GooglePlaceID = place.place_id;
                    point.Source.Source = "internet";
                    point.Source.SourcePath = "google map";
					point.Type = "internet";
					point.VisiblePoint = true;
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

                TransferMap.Map.Call_CallBack('ErrorMap', status);
            }
            TransferMap.Map.Call_CallBack('SearchAddress', result_point);

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
                    distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(TransferMap.Map.locationPoint.lat, TransferMap.Map.locationPoint.lng), new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
                }
                var point = TransferMap.GetDefPoint();
                point.ID = place.id;
                point.Sourse = "internet";
                point.SoursePath = "google map";
                point.Address = address;
				point.Title = place.name;
				point.VisiblePoint = true;
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

            TransferMap.Map.Call_CallBack('ErrorMap', status);
        }
        TransferMap.Map.Call_CallBack('SearchAddress', result_point);
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
            var point = TransferMap.GetDefPoint();
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
			point.VisiblePoint = true;
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
            TransferMap.Map.Call_CallBack('GetAddress', result_point);
        } else {
            result_point.error.isError = true;
            TransferMap.Map.Call_CallBack('GetAddress', result_point);;
        }
    },

    AddSetPoints: function (point) {
        this.SavePoints.push(point);
    },
    SavedPoints: function (point) {
        this.PreservePoints.push(point);
    },

    MarkerClusterPoint: function () {
        for (n = 0; n < TransferMap.Map.markerCluster.clusters_.length; n++) {
            rt = TransferMap.Map.markerCluster.clusters_[n];
            TransferMap.Map.Call_CallBack('MarkerClusterPoint', this.markerCluster.clusters_.markers_);

        }
    },

    Resize: function (e) {
        try {
            var zoom = this.map.getZoom();
            var center = this.map.getCenter();
            if (e == true) {
                google.maps.event.trigger(this.map, 'resize');
                TransferMap.FitBounds(true);
                TransferMap.Map.map.setZoom(10);
                this.map.panTo(center);
            }
            else {
                google.maps.event.trigger(this.map, 'resize');
                TransferMap.FitBounds(true);
                TransferMap.Map.map.setZoom(zoom);
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
            this.transitLayer.setMap(TransferMap.Map.map);
        }
        else {
            this.transitLayer.setMap(null);
        }
    },

    TrafficLayer: function (e) {
        if (e) {
            this.trafficLayer.setMap(TransferMap.Map.map);
        }
        else {
            this.trafficLayer.setMap(null);
        }
    },

};
