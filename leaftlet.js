
TransferMap.Map = {
    Walking: [],
    Cluster: true,
    TimerId: null,
    Radius: null,
    drawingManager: null,
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
        $.getScript("https://unpkg.com/leaflet@1.3.1/dist/leaflet.js")
        .done(function (script, status) {
            if (typeof L !== "undefined") {
                clearTimeout(TransferMap.Map.TimerId);
                TransferMap.Map.initMap(TransferMap.Map.ElementMap);
                TransferMap.Map.Call_CallBack('onInit', true);
            }
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
        if (typeof L !== "undefined") {
            $.getScript("/scripts/plugin/LeafletAdditionally.js", function (data, textStatus, jqxhr) {
            });
        }
        var coords = { lat: 27.215556209029693, lng: 18.45703125 };
        this.map = L.map(e, {
            zoom: 3,
            center: coords,
            disableDefaultUI: true,
            doubleClickZoom: false,
            minZoom: 3,
            zoomControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);


        this.map.on('zoomend', function (event) {
            console.log('zoom', event)
            TransferMap.Map.GlobalZoom = TransferMap.Map.map.getZoom();
            var bounds = TransferMap.Map.map.getBounds();
            if (bounds) {
                var SW = bounds.getSouthWest();
                var NE = bounds.getNorthEast();
                TransferMap.Map.SW.Latitude = SW.lat;
                TransferMap.Map.SW.Longitude = SW.lng;
                TransferMap.Map.NE.Latitude = NE.lat;
                TransferMap.Map.NE.Longitude = NE.lng;

                if (TransferMap.BoundsChangedZoom) {
                    TransferMap.Map.Call_CallBack("BoundsChanged");
                }

                TransferMap.HideBaloon();
            }
            TransferMap.Map.Call_CallBack("ChangeZoom", TransferMap.Map.GlobalZoom);
            TransferMap.Map.Call_CallBack("CountPoint", TransferMap.Map.PointMap.length);
        });

        TransferMap.BoundsChangedZoom = TransferMap.Map.BoundsChangedZoom;

        this.map.on('dragend', function (event) {
            console.log('dragend', event)
            var bounds = TransferMap.Map.map.getBounds();
            if (bounds) {
                var SW = bounds.getSouthWest();
                var NE = bounds.getNorthEast();
                TransferMap.Map.SW.Latitude = SW.lat;
                TransferMap.Map.SW.Longitude = SW.lng;
                TransferMap.Map.NE.Latitude = NE.lat;
                TransferMap.Map.NE.Longitude = NE.lng;

                if (TransferMap.BoundsChangedZoom) {
                    TransferMap.Map.Call_CallBack("BoundsChanged");
                }
            }
            TransferMap.Map.Call_CallBack("CountPoint", TransferMap.Map.PointMap.length);
        });

        this.map.on("click", function (event) {
            console.log(event)
            if (TransferMap.Map.GlobalZoom > 8) {
                TransferMap.Map.fitBoundsOn = false;

                if (event != undefined) {
                    var coords = event.latlng;
                    TransferMap.Map.placeMarker(coords);
                }
                if (event && event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    window.event.cancelBubble = true;
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
            "Latitude": location.lat,
            "Longitude": location.lng
        };
        this.Positionlocation = location;
        this.Call_CallBack('MapClick', c);
    },


    GetAddress: function (Latitude, Longitude) {
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };
        $.getJSON("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + Latitude + "&lon=" + Longitude + "&addressdetails=1", function (result) {
            console.log("success", result);
           // if (result.length > 0) {
                if (result != null) {
                    var point = TransferMap.GetDefPoint();
                    var place = result;
                    console.log(place, 'Place')
                    if (place.address) {
                        // point.Address.City.Title = place.city;
                        //  point.Address.City.Type = 'city';
                        //   point.Address.District.Title = place.state;
                        //  point.Address.District.Type = 'district';
                        // point.Address.PostCode = place.postcode;
                        // point.Address.Street = place.road;
                        // point.Address.House = place.house_number;
                        if (typeof place.country_code !== 'undefined') {
                            point.Country.Code = toUpperCase(place.country_code);
                        }


                    }
                    // point.Title = '';

                    // var name = '';
                    point.ID = UUID.generate();                
                    point.Title = place.display_name;
                    point.VisiblePoint = true;
                    point.Source.Source = "internet";
                    point.Source.SourcePath = "leaflet map";
                    // point.Title = place.address[place.type];
                    point.SubType = 'none';
                    point.Type = "internet";
                    point.Position.Latitude = Number(place.lat);
                    point.Position.Longitude = Number(place.lon);
                    point.Address.raw = place.display_name;
                    result_point.point.push(point);
                    result_point.error.isError = false;
                    TransferMap.Map.Call_CallBack('GetAddress', result_point);
                }
          //  }
           
        })
      .fail(function () {
          result_point.error.isError = true;
          TransferMap.Map.Call_CallBack('GetAddress', result_point);
          console.log("error");
      });
        //https://nominatim.openstreetmap.org/reverse?format=xml&lat=52.5487429714954&lon=-1.81602098644987&zoom=18&addressdetails=1    
    },
    SetPoints: function (Points) {
        if (Points == null) {
            Points = this.PreservePoints;
        } else {
            this.SavePoints = Points;

        }

        this.markerCluster = L.markerClusterGroup({
            chunkedLoading: false,
            maxClusterRadius: 120,
            iconCreateFunction: function (cluster) {
                var markers = cluster.getAllChildMarkers();
                var html = '<div class="markerClusLeaftlet">' + markers.length + '</div>';
                return L.divIcon({ html: html, className: 'mycluster', iconSize: L.point(44, 44) });
            },
        });

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
                var icon = L.icon({
                    iconUrl: point.IconType,
                  //  iconSize: [58, 58],
                });
                var obj = new L.marker([point.Position.Latitude, point.Position.Longitude], {
                    position: { lat: point.Position.Latitude, lng: point.Position.Longitude },
                    draggable: false,
                    clickable: true,
                    zIndex: 9999,
                    icon: icon,
                    title: point.Title
                });

                obj["Point"] = point;
                this.markerCluster.addLayer(obj);
                this.PointMap.push(obj);
                obj.on('click', function (event) {
                    TransferMap.Map.SelectMarker = this;
                    TransferMap.Map.Call_CallBack('PointClick', this.Point);
                });
            }
        }

        if (Points.length != 0) {
            TransferMap.Map.map.addLayer(this.markerCluster);
        }
        TransferMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },



    ShowBaloon: function (html, e, type) {
     this.HideBaloon();
     html = '<div class="infoBox">' + html + '</div>';
     this.InfoWindow = L.popup({
         closeButton: false,
         className: '',
         offset: [-40, -10]
     })
    .setLatLng(L.latLng(e.Latitude, e.Longitude))
    .setContent(html)
    .openOn(this.map);
     if (type == 'internet') {
         console.log('Call_CallBackOPen', type)
         TransferMap.Map.Call_CallBack('OpenBallon');
     }
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
            TransferMap.Map.map.closePopup();
            this.InfoWindowsOpen = false;
            this.BoundsChangedZoom = true;
        }

    },
    ClearMap: function (e) {
        for (var i = 0; i < this.PointMap.length; i++) {         
            TransferMap.Map.map.removeLayer(this.PointMap[i])
        }
       // if (this.markerCluster != null) {
        //  this.markerCluster.clearMarkers();

       // };

        //if (this.directionsDisplay != null) {
        //    for (i = 0; i < TransferMap.Map.Walking.length; i++) {
        //        TransferMap.Map.Walking[i].setMap(null);
        //    }

        //    this.directionsDisplay.setMap(null);
        //    this.directionsDisplay = null;
        //}

        //if (this.directionsDisplay == null) {
        //    //TransferMap.Map.map.setOptions({ minZoom: 3 });
        //    // TransferMap.Map.map.setOptions({ draggable: true });
        //}

        ////this.Radius
        //if (this.Radius != null) {
        //    this.Radius.setMap(null);

        //}

        //if (this.drawingManager != null) {
        //    this.drawingManager.setMap(null);

        //}

        

        //if (e == false || e == undefined) {
        //    this.GPSPoint = [];
        //    this.GPSPointID = [];
        //}

        //this.PointMap = [];
        //// TransferMap.HideBaloon();
        //TransferMap.Map.Walking.Walking = [];
        TransferMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },

    FitBounds: function (e, d) {     
        var group = new L.featureGroup(this.PointMap);         
        if (this.PointMap.length > 1) {
            if (TransferMap.Map.fitBoundsOn) {
                this.map.fitBounds(group.getBounds());
            }
        }
        if (this.PointMap.length == 1) {     
            this.map.setView(new L.LatLng(this.PointMap[0]._latlng.lat, this.PointMap[0]._latlng.lng), 16);       
        }      
    },

    RouteMap: function (e, start, end) {
        try {
            this.ShowPoint(start, true, false);
            this.ShowPoint(end, true, false);
          //  var start = new google.maps.LatLng(start.Position.Latitude, start.Position.Longitude);
         //   var end = new google.maps.LatLng(end.Position.Latitude, end.Position.Longitude);
            if (e) {               
                $.getJSON('http://router.project-osrm.org/route/v1/driving/'+start.Position.Latitude+','+start.Position.Longitude+';'+end.Position.Latitude+','+end.Position.Longitude+'?overview=full', function (route) {
                    
                    if (route.routes.code == 'Ok') {
                        var pathcoord = [];
                        for (i = 0; i < route.routes["0"].geometry.coordinates.length; i++) {
                            var elem = route.routes["0"].geometry.coordinates[i];
                            a = elem[0];
                            b = elem[1];
                            elem[1] = a;
                            elem[0] = b;
                            pathcoord.push(elem)
                        };

                        var polyline = L.polyline(pathcoord, { color: '#007bff', opacity: 0.9, weight: 5 }).addTo(TransferMap.Map.map);
                        TransferMap.Map.map.fitBounds(polyline.getBounds());
                        //route.routes["0"].
                        RouteInfo = {
                            Time: '',
                            TimeValue: route.routes["0"].duration,
                            Distance: '',
                            DistanceValue: route.routes["0"].distance,
                            // TimeTraffic: result['routes'][0].legs[0].duration_in_traffic.text,
                            // TimeValueTraffic: result['routes'][0].legs[0].duration_in_traffic.value,
                            // StaticMapUrl: 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=roadmap&path=enc:" + path + "&" + markers',
                        }
                        TransferMap.Map.Call_CallBack('InfoRoute', RouteInfo);
                    }

                })       
            .fail(function () {
                console.log("error");
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
                var icon = L.icon({
                    iconUrl: point.IconType,
                  //  iconSize: [60, 60],
                });
                var obj = new L.marker([point.Position.Latitude, point.Position.Longitude], {
                    position: { lat: point.Position.Latitude, lng: point.Position.Longitude },
                    draggable: false,
                    clickable: true,
                    zIndex: 9999,
                    icon: icon,
                    title: point.Title
                });

                obj["Point"] = point;
                this.PointMap.push(obj);
                obj.addTo(this.map);

                //if (cluster) {
                //    if (this.markerCluster != null) {
                //        this.markerCluster.addMarker(obj, d);
                //    }
                //}

                if (d) {
                    this.FitBounds(d);
                }

               
                if (this.GPSPointID[obj.Point.ID] == null) {
                    if (obj.Point.Type == 'internet') {
                        this.GPSPoint.push(obj);
                        this.GPSPointID[obj.Point.ID] = obj;
                    }
                }

                obj.on('click', function (event) {
                    TransferMap.Map.HideBaloon();
                    TransferMap.Map.SelectMarker = this;
                   TransferMap.Map.Call_CallBack('PointClick', this.Point);
                });
            }

        }
    },

    SearchPoint: function (text, location) {
        console.log('SearchPoint', text);
        //  var service = new google.maps.places.AutocompleteService();
        //var request = {};
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };

        //if (location != null && location != undefined) {
        //    request = {
        //        location: new google.maps.LatLng({ lat: location.lat, lng: location.lng }),
        //        radius: '200000',
        //        strictbounds: true,
        //        input: text,
        //        language: CurrentLamgCulture
        //    };
        //}
        //else {
        //    request = {
        //        input: text,
        //        language: CurrentLamgCulture
        //    };
        //}

        var jqxhr = $.getJSON('http://nominatim.openstreetmap.org/search?format=json&accept-language=en&addressdetails=1&limit=5&q=' + text, function (results) {
            console.log("success");
            if (results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    var point = TransferMap.GetDefPoint();
                    var place = results[i];
                    console.log(place, 'Place')
                    if (place.address) {                      
                       // point.Address.City.Title = place.city;
                      //  point.Address.City.Type = 'city';
                     //   point.Address.District.Title = place.state;
                      //  point.Address.District.Type = 'district';
                       // point.Address.PostCode = place.postcode;
                       // point.Address.Street = place.road;
                       // point.Address.House = place.house_number;
                        if (typeof place.country_code !== 'undefined') {
                            point.Country.Code = toUpperCase(place.country_code);
                        }
                        

                       // ..toUpperCase()
//
                     //   country
                   //     postcode
                    //    road // улица
                     //   state

                        //  country_code
                        //secondary
                        
                    }
                    // point.Title = '';

                   // var name = '';
                    point.ID = UUID.generate();
                   // if (place.type != 'administrative' || place.type != 'ticket' || place.type != 'secondary' || place.type != 'yes') {
                      //  name = place.address[place.type];
                    // }
                  //  address[k[0]]
                    point.Title = place.display_name;
                    point.VisiblePoint = true;
                    point.Source.Source = "internet";
                    point.Source.SourcePath = "leaflet map";
                   // point.Title = place.address[place.type];
                    point.SubType = 'none';
                    point.Type = "internet";
                    point.Position.Latitude = Number(place.lat);
                    point.Position.Longitude = Number(place.lon);
                    point.Address.raw = place.display_name;
                    result_point.point.push(point);
                    result_point.error.isError = false;
                }

               
                TransferMap.Map.Call_CallBack('SearchAddress', result_point);
            }
            else {
                result_point.error.isError = true;
                
            }
            TransferMap.Map.Call_CallBack('SearchAddress', result_point);
        })      
       .fail(function () {
         console.log("error");
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

    ShowRadius: function (e) {
        this.HideRadius();
        if (TransferMap.Map.SelectMarker != null) {
            var center = new google.maps.LatLng({ lat: TransferMap.Map.SelectMarker.Point.Position.Latitude, lng: TransferMap.Map.SelectMarker.Point.Position.Longitude });
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
            var center = new google.maps.LatLng({ lat: TransferMap.Map.SelectMarker.Point.Position.Latitude, lng: TransferMap.Map.SelectMarker.Point.Position.Longitude });
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

                for (var i = 0; i < TransferMap.Map.PointMap.length; i++) {
                    var point = TransferMap.Map.PointMap[i];
                    var tt = TransferMap.BelongingPolygon(TransferMap.Map.PointMap[i].Point.Position, x, y);

                    if (tt == 0 || tt == false) {
                        point.setMap(null);
                        if (TransferMap.Map.markerCluster != null) {
                            TransferMap.Map.markerCluster.removeMarker(point);
                            // this.markerCluster.repaint();
                            //TransferMap.Map.markerCluster.repaint();

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
                var rt = TransferMap.Distance(TransferMap.Map.SelectMarker.Point.Position.Latitude, TransferMap.Map.SelectMarker.Point.Position.Longitude, point.Point.Position.Latitude, point.Point.Position.Longitude);
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
            google.maps.event.addListener(TransferMap.Map.Radius, 'radius_changed', function (event) {
                // if (event.type == 'circle') {
                //  var radius = this.Radius.getRadius();
                console.log(TransferMap.Map.Radius, 'radius')
                //}
            });
        }
    },
};
