//AppMap
AppMap.Map = {
    Walking: [],
    key: "AIzaSyCb2GKOwMmvcseTS2hbQ_2TFbJKVTA1WBo",
    Cluster: true,
    TimerId: null,
    Radius: null,
    Lay: null,
    Layer: [],
    drawPluginOptions: null,
    polylineHandler: null,
    EditHandler: null,
    editTool: null,
    deleteTool: null,
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
    ListenerClick: true,
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
        $.getScript("/Content/js/leaflet.js")
            .done(function (script, status) {
                if (typeof L !== "undefined") {
                    clearTimeout(AppMap.Map.TimerId);
                    AppMap.Map.initMap(AppMap.Map.ElementMap);
                    AppMap.Map.Call_CallBack('onInit', true);
                }
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
        var coords = { lat: 27.215556209029693, lng: 18.45703125 };
        this.map = L.map(e, {
            zoom: 3,
            center: coords,
            //   disableDefaultUI: true,
            editable: true,
            doubleClickZoom: false,
            minZoom: 3,
            zoomControl: false,
            //drawControl: true
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            //  maxZoom: 20,
            // subdomains:['mt0','mt1','mt2','mt3'],
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);


        this.map.on('zoomend', function (event) {
            console.log('zoom', event)
            AppMap.Map.GlobalZoom = AppMap.Map.map.getZoom();
            var bounds = AppMap.Map.map.getBounds();
            if (bounds) {
                var SW = bounds.getSouthWest();
                var NE = bounds.getNorthEast();
                AppMap.Map.SW.Latitude = SW.lat;
                AppMap.Map.SW.Longitude = SW.lng;
                AppMap.Map.NE.Latitude = NE.lat;
                AppMap.Map.NE.Longitude = NE.lng;

                if (AppMap.BoundsChangedZoom) {
                    AppMap.Map.Call_CallBack("BoundsChanged");
                }

                AppMap.HideBaloon();
            }
            AppMap.Map.Call_CallBack("ChangeZoom", AppMap.Map.GlobalZoom);
            AppMap.Map.Call_CallBack("CountPoint", AppMap.Map.PointMap.length);
        });

        AppMap.BoundsChangedZoom = AppMap.Map.BoundsChangedZoom;

        this.map.on('dragend', function (event) {
            console.log('dragend', event)
            var bounds = AppMap.Map.map.getBounds();
            if (bounds) {
                var SW = bounds.getSouthWest();
                var NE = bounds.getNorthEast();
                AppMap.Map.SW.Latitude = SW.lat;
                AppMap.Map.SW.Longitude = SW.lng;
                AppMap.Map.NE.Latitude = NE.lat;
                AppMap.Map.NE.Longitude = NE.lng;

                if (AppMap.BoundsChangedZoom) {
                    AppMap.Map.Call_CallBack("BoundsChanged");
                }
            }
            AppMap.Map.Call_CallBack("CountPoint", AppMap.Map.PointMap.length);
        });

        this.map.on("click", function (event) {
            if (AppMap.Map.ListenerClick) {
                //   console.log(event)
                if (AppMap.Map.GlobalZoom > 8) {
                    AppMap.Map.fitBoundsOn = false;

                    if (event != undefined) {
                        var coords = event.latlng;
                        AppMap.Map.placeMarker(coords);
                    }
                    if (event && event.stopPropagation) {
                        event.stopPropagation();
                    } else {
                        window.event.cancelBubble = true;
                    }

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
        $.getJSON("https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=en&lat=" + Latitude + "&lon=" + Longitude + "&addressdetails=1", function (result) {
            console.log("success", result);
            if (result != null) {
                var point = AppMap.GetDefPoint();
                var place = result;
                console.log(place, 'Place')
                if (typeof place.address.city !== 'undefined') {
                    point.Address.City.Title = place.address.city;
                }
                else {
                    point.Address.City.Title = place.address.state;
                }
                point.Address.City.Type = 'city';
                if (typeof place.address.district !== 'undefined') {
                    point.Address.District.Title = place.address.district;
                }
                else {
                    point.Address.District.Title = place.address.state_district;
                    point.Address.District.Title = place.address.state;
                }
                point.Address.District.Type = 'district';

                if (typeof place.address.postcode !== 'undefined') {
                    point.Address.PostCode = place.address.postcode;
                }
                if (typeof place.address.road !== 'undefined') {
                    point.Address.Street = place.address.road;
                }
                if (typeof place.address.house_number !== 'undefined') {
                    point.Address.House = place.address.house_number;
                }
                if (typeof place.address.country_code !== 'undefined') {
                    point.Address.Country.Code = place.address.country_code.toUpperCase();
                }

                if (typeof place.address.country !== 'undefined') {
                    point.Address.Country.Title = place.address.country
                }

                point.Address.Country.Type = 'country';
                //  }


                var name = '';
                if (typeof place.name != 'undefined' && place.name != null) {
                    name = place.name;
                }

                point.ID = UUID.generate();
                point.Title = name;
                point.VisiblePoint = true;
                point.Source.Source = "internet";
                point.Source.SourcePath = "leaflet map";
                point.SubType = 'none';
                point.Type = "internet";
                point.Position.Latitude = Number(place.lat);
                point.Position.Longitude = Number(place.lon);
                point.Address.raw = place.display_name;
                result_point.point.push(point);
                result_point.error.isError = false;
                AppMap.Map.Call_CallBack('GetAddress', result_point);
            }

        })
            .fail(function () {
                result_point.error.isError = true;
                AppMap.Map.Call_CallBack('GetAddress', result_point);
                console.log("error");
            });
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
            point = AppMap.ValidationPoint(Points[n])
            if (this.ObjPreservePoints[point.ID] == null) {
                this.PreservePoints.push(point);
                this.ObjPreservePoints[point.ID] = point;
            }

            if (AppMap.Filter[point.Type]) {
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
                    AppMap.Map.SelectMarker = this;
                    AppMap.Map.Call_CallBack('PointClick', this.Point);
                });
            }
        }

        if (Points.length != 0) {
            AppMap.Map.map.addLayer(this.markerCluster);
        }
        AppMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },


    ShowBaloon: function (html, e, type) {
        this.HideBaloon();
        html = '<div class="infoBox">' + html + '</div>';
        this.InfoWindow = L.popup({
            closeButton: false,
            className: '',
            offset: [-20, 3]
        })
            .setLatLng(L.latLng(e.Latitude, e.Longitude))
            .setContent(html)
            .openOn(this.map);
        if (type == 'internet') {
            // console.log('Call_CallBackOPen', type)
            AppMap.Map.Call_CallBack('OpenBallon');
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
            AppMap.Map.map.closePopup();
            this.InfoWindowsOpen = false;
            this.BoundsChangedZoom = true;
        }

    },
    ClearMap: function (e) {
        for (var i = 0; i < this.PointMap.length; i++) {
            AppMap.Map.map.removeLayer(this.PointMap[i]);
            if (AppMap.Map.markerCluster != null) {
                AppMap.Map.markerCluster.removeLayer(this.PointMap[i]);
            }
        }

        this.PointMap = [];

        if (this.directionsDisplay != null) {
            AppMap.Map.map.removeLayer(AppMap.Map.directionsDisplay);
            AppMap.Map.directionsDisplay = null;
        }
        //AppMap.Map.directionsDisplay
        //    this.directionsDisplay.setMap(null);
        //    this.directionsDisplay = null;
        //}

        //if (this.directionsDisplay == null) {
        //    //AppMap.Map.map.setOptions({ minZoom: 3 });
        //    // AppMap.Map.map.setOptions({ draggable: true });
        //}

        ////this.Radius
        //if (this.Radius != null) {
        //    this.Radius.setMap(null);

        //}

        //if (this.drawingManager != null) {
        //    this.drawingManager.setMap(null);

        //}



        if (e == false || e == undefined) {
            this.GPSPoint = [];
            this.GPSPointID = [];
        }

        //this.PointMap = [];
        //// AppMap.HideBaloon();
        //AppMap.Map.Walking.Walking = [];
        AppMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
    },

    FitBounds: function (e, d) {
        var group = new L.featureGroup(this.PointMap);
        if (this.PointMap.length > 1) {
            if (AppMap.Map.fitBoundsOn) {
                this.map.fitBounds(group.getBounds());
            }
        }
        if (this.PointMap.length == 1) {
            this.map.setView(new L.LatLng(this.PointMap[0]._latlng.lat, this.PointMap[0]._latlng.lng), 16);
        }
    },

    RouteMap: function (e, start, end) {
        AppMap.Map.directionsDisplay = null;
        try {
            this.ShowPoint(start, true, false);
            this.ShowPoint(end, true, false);
            if (e) {
                $.getJSON('http://router.project-osrm.org/route/v1/driving/' + start.Position.Longitude + ',' + start.Position.Latitude + ';' + end.Position.Longitude + ',' + end.Position.Latitude + '?overview=full&geometries=geojson&steps=false', function (route) {

                    // var route = { "routes": [{ "geometry": { "coordinates": [[37.262868, 55.587063], [37.26302, 55.586473], [37.263112, 55.586118], [37.263229, 55.585826], [37.263346, 55.585569], [37.259357, 55.584582], [37.257114, 55.584047], [37.255271, 55.58369], [37.254104, 55.583549], [37.253057, 55.583481], [37.251657, 55.583414], [37.251123, 55.583323], [37.250784, 55.583111], [37.250689, 55.582925], [37.2507, 55.582748], [37.251034, 55.582276], [37.251251, 55.582174], [37.251546, 55.58209], [37.251853, 55.582066], [37.252232, 55.582081], [37.25277, 55.58227], [37.254103, 55.582807], [37.254992, 55.583159], [37.255816, 55.583467], [37.25711, 55.583885], [37.258985, 55.584314], [37.260952, 55.584794], [37.261951, 55.585038], [37.263981, 55.585539], [37.274963, 55.588253], [37.283437, 55.590417], [37.286324, 55.591153], [37.288424, 55.591694], [37.289048, 55.591855], [37.291529, 55.592493], [37.293276, 55.592942], [37.305534, 55.596095], [37.31401, 55.598275], [37.317375, 55.599149], [37.321316, 55.600185], [37.321622, 55.600266], [37.323012, 55.600631], [37.327685, 55.60186], [37.328393, 55.602055], [37.335263, 55.603864], [37.336686, 55.604238], [37.338278, 55.604657], [37.348344, 55.607328], [37.348843, 55.60746], [37.349354, 55.607604], [37.35003, 55.607784], [37.350873, 55.608002], [37.352543, 55.608447], [37.352738, 55.608498], [37.354883, 55.609048], [37.35668, 55.609516], [37.362693, 55.611114], [37.370329, 55.613144], [37.374966, 55.614361], [37.37786, 55.61512], [37.384066, 55.616749], [37.385239, 55.617056], [37.387568, 55.617644], [37.388033, 55.617765], [37.39014, 55.618296], [37.392588, 55.618954], [37.394526, 55.619445], [37.395941, 55.619814], [37.422036, 55.6266], [37.423007, 55.626865], [37.425131, 55.627415], [37.430278, 55.628769], [37.43098, 55.628961], [37.435327, 55.630089], [37.436322, 55.630352], [37.438493, 55.630908], [37.439866, 55.631262], [37.440087, 55.631321], [37.442274, 55.631908], [37.444153, 55.632416], [37.445287, 55.632753], [37.446199, 55.633041], [37.446954, 55.633291], [37.448518, 55.633834], [37.449555, 55.634221], [37.450578, 55.634618], [37.451352, 55.634864], [37.452058, 55.635108], [37.454069, 55.636001], [37.455425, 55.636642], [37.455749, 55.636792], [37.455933, 55.636924], [37.456054, 55.637025], [37.456114, 55.637127], [37.456942, 55.640716], [37.457008, 55.641074], [37.45696, 55.641487], [37.456838, 55.641745], [37.456634, 55.641988], [37.456184, 55.6424], [37.455657, 55.642826], [37.454869, 55.643413], [37.453453, 55.644368], [37.451715, 55.645853], [37.445721, 55.650974], [37.444236, 55.652243], [37.443939, 55.65249], [37.442119, 55.653884], [37.44166, 55.654248], [37.441092, 55.654747], [37.438301, 55.657108], [37.437729, 55.657719], [37.437036, 55.658384], [37.436539, 55.658822], [37.435824, 55.659453], [37.435461, 55.659793], [37.435046, 55.660181], [37.434887, 55.66042], [37.434843, 55.660612], [37.434811, 55.660847], [37.434813, 55.66105], [37.434856, 55.6612], [37.434934, 55.661355], [37.435038, 55.661491], [37.435238, 55.661656], [37.435386, 55.66175], [37.435564, 55.661837], [37.435733, 55.6619], [37.436117, 55.662012], [37.436587, 55.662117], [37.436948, 55.662212], [37.43731, 55.662333], [37.437369, 55.662363], [37.437458, 55.662415], [37.437651, 55.662556], [37.438053, 55.662894], [37.438355, 55.663159], [37.438661, 55.663388], [37.439484, 55.664108], [37.439882, 55.664451], [37.440178, 55.664707], [37.440506, 55.66499], [37.440558, 55.665035], [37.440772, 55.66522], [37.442021, 55.6663], [37.443127, 55.667258], [37.443391, 55.667485], [37.44358, 55.667635], [37.443784, 55.667809], [37.44434, 55.668182], [37.444447, 55.668254], [37.445103, 55.668608], [37.445454, 55.668798], [37.446214, 55.669146], [37.446876, 55.669436], [37.447688, 55.669748], [37.448349, 55.669979], [37.449153, 55.670215], [37.449948, 55.670449], [37.45145, 55.67089], [37.451654, 55.67095], [37.451992, 55.671062], [37.452468, 55.671207], [37.454139, 55.671722], [37.454673, 55.671902], [37.455261, 55.672119], [37.456653, 55.672657], [37.457376, 55.673004], [37.458004, 55.673303], [37.45834, 55.673464], [37.458861, 55.673727], [37.460772, 55.674871], [37.462322, 55.675983], [37.464012, 55.677184], [37.464216, 55.677323], [37.464289, 55.677372], [37.464621, 55.677593], [37.466072, 55.678558], [37.467435, 55.679523], [37.467592, 55.679635], [37.468244, 55.680064], [37.468493, 55.680243], [37.468556, 55.680289], [37.468644, 55.680352], [37.468892, 55.680531], [37.470472, 55.681676], [37.470832, 55.681913], [37.471758, 55.682519], [37.472257, 55.682841], [37.472514, 55.682997], [37.473123, 55.683365], [37.473298, 55.683471], [37.473629, 55.683638], [37.476401, 55.685215], [37.478853, 55.686595], [37.481289, 55.687894], [37.481631, 55.688084], [37.484435, 55.68968], [37.48488, 55.689908], [37.485204, 55.690071], [37.485699, 55.690346], [37.48762, 55.691409], [37.490982, 55.693263], [37.492773, 55.694142], [37.49339, 55.694413], [37.494051, 55.694733], [37.494102, 55.694766], [37.49443, 55.694954], [37.49454, 55.695017], [37.494787, 55.695157], [37.494897, 55.69522], [37.496711, 55.69625], [37.497448, 55.696682], [37.498828, 55.697469], [37.500406, 55.698374], [37.500751, 55.698574], [37.500911, 55.698664], [37.501301, 55.698905], [37.501372, 55.698947], [37.501879, 55.699228], [37.503069, 55.699882], [37.504579, 55.700712], [37.505599, 55.701273], [37.508063, 55.702648], [37.509647, 55.703507], [37.510014, 55.703714], [37.511127, 55.704336], [37.511763, 55.704705], [37.512275, 55.704965], [37.512327, 55.705025], [37.512341, 55.70509], [37.512316, 55.705155], [37.512254, 55.705211], [37.512163, 55.705252], [37.512052, 55.705274], [37.511935, 55.705274], [37.511824, 55.705252], [37.511733, 55.705211], [37.510863, 55.704741], [37.510695, 55.704836], [37.509297, 55.70562], [37.509907, 55.705968]], "type": "LineString" }, "legs": [{ "summary": "", "weight": 5003.2, "duration": 2409.8, "steps": [], "distance": 25784.5 }], "weight_name": "routability", "weight": 5003.2, "duration": 2409.8, "distance": 25784.5 }], "waypoints": [{ "hint": "FKnvhBWp74RVAgAAAAAAAJ0DAAAAAAAAlcSEQgAAAABRq81CAAAAACoBAAAAAAAAzwEAAAAAAACJogAAFJY4AvcwUAOukDgCa0JQAwMA_xVCXW9w", "name": "", "location": [37.262868, 55.587063] }, { "hint": "wRVvgc4Vb4E5BQAA6gEAAHwAAAAAAAAAitEUQycCWkINC11BAAAAAJwCAAD1AAAAPgAAAAAAAACJogAAE1s8AnABUgMHXTwCWQBSAwEADw5CXW9w", "name": "", "location": [37.509907, 55.705968] }], "code": "Ok" }
                    console.log(route, 'ROUTE')
                    if (route.code == 'Ok') {
                        var pathcoord = [];
                        for (i = 0; i < route.routes["0"].geometry.coordinates.length; i++) {
                            var elem = route.routes["0"].geometry.coordinates[i];
                            a = elem[0];
                            b = elem[1];
                            elem[1] = a;
                            elem[0] = b;
                            pathcoord.push(elem)
                        };
                        AppMap.Map.directionsDisplay = L.polyline(pathcoord, { color: '#007bff', opacity: 0.9, weight: 5 }).addTo(AppMap.Map.map);
                        AppMap.Map.map.fitBounds(AppMap.Map.directionsDisplay.getBounds());
                        RouteInfo = {
                            Time: '',
                            TimeValue: route.routes["0"].duration,
                            Distance: '',
                            DistanceValue: route.routes["0"].distance,
                            // TimeTraffic: result['routes'][0].legs[0].duration_in_traffic.text,
                            // TimeValueTraffic: result['routes'][0].legs[0].duration_in_traffic.value,
                            // StaticMapUrl: 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=roadmap&path=enc:" + path + "&" + markers',
                        }
                        AppMap.Map.Call_CallBack('InfoRoute', RouteInfo);
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

    },

    GetDetailsPointAutocomplete: function (point, type) {

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

                if (cluster) {
                    if (this.markerCluster != null) {
                        this.markerCluster.addLayer(obj);
                    }
                }

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
                    AppMap.Map.HideBaloon();
                    AppMap.Map.SelectMarker = this;
                    AppMap.Map.Call_CallBack('PointClick', this.Point);
                });
            }

        }
    },

    SearchPoint: function (text, location) {
        console.log('SearchPoint', text);
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

        var jqxhr = $.getJSON('http://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&namedetails=1&addressdetails=1&limit=5&q=' + text, function (results) {
            console.log("success");
            if (results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    var point = AppMap.GetDefPoint();
                    var place = results[i];
                    console.log(place, 'Place')

                    if (typeof place.address.city !== 'undefined') {
                        point.Address.City.Title = place.address.city;
                    }
                    else {
                        point.Address.City.Title = place.address.state;
                    }
                    point.Address.City.Type = 'city';
                    if (typeof place.address.district !== 'undefined') {
                        point.Address.District.Title = place.address.district;
                    }
                    else {
                        point.Address.District.Title = place.address.state_district;
                        point.Address.District.Title = place.address.state;
                    }
                    point.Address.District.Type = 'district';

                    if (typeof place.address.postcode !== 'undefined') {
                        point.Address.PostCode = place.address.postcode;
                    }
                    if (typeof place.address.road !== 'undefined') {
                        point.Address.Street = place.address.road;
                    }
                    if (typeof place.address.house_number !== 'undefined') {
                        point.Address.House = place.address.house_number;
                    }
                    if (typeof place.address.country_code !== 'undefined') {
                        point.Address.Country.Code = place.address.country_code.toUpperCase();
                    }

                    if (typeof place.address.country !== 'undefined') {
                        point.Address.Country.Title = place.address.country
                    }

                    point.Address.Country.Type = 'country';
                    //  }
                    var name = '';
                    if (typeof place.namedetails != 'undefined' && place.namedetails != null) {
                        point.Title = place.namedetails.name;

                    }

                    point.ID = UUID.generate();
                    point.VisiblePoint = true;
                    point.Source.Source = "internet";
                    point.Source.SourcePath = "leaflet map";
                    point.SubType = 'none';
                    point.Type = "internet";
                    point.Position.Latitude = Number(place.lat);
                    point.Position.Longitude = Number(place.lon);
                    point.Address.raw = place.display_name;
                    result_point.point.push(point);
                    result_point.error.isError = false;
                }


                AppMap.Map.Call_CallBack('SearchAddress', result_point);
            }
            else {
                result_point.error.isError = true;

            }
            AppMap.Map.Call_CallBack('SearchAddress', result_point);
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
            AppMap.Map.Call_CallBack('GetAddress', result_point);;
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
                // google.maps.event.trigger(this.map, 'resize');
                AppMap.Map.map.invalidateSize();
                AppMap.FitBounds(true);
                AppMap.Map.map.setZoom(10);
                // this.map.panTo(center);
            }
            else {
                // google.maps.event.trigger(this.map, 'resize');
                AppMap.Map.map.invalidateSize();
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

    DrawingShapes: function (coord, type) {
        if (AppMap.Map.Layer.length > 0) {
            $.each(AppMap.Map.Layer, function (key, layer) {
                AppMap.Map.map.removeLayer(layer);
                if (typeof layer.removeAllArea != 'undefined') {
                    layer.removeAllArea();
                }
            });
        }
        AppMap.Map.Layer = [];
        if (AppMap.Map.polylineHandler != null) {
            AppMap.Map.map.removeLayer(AppMap.Map.polylineHandler);
            if (typeof AppMap.Map.polylineHandler.removeAllArea != 'undefined') {
                AppMap.Map.polylineHandler = AppMap.Map.map.selectAreaFeature.disable();
                AppMap.Map.polylineHandler.removeAllArea();
            }
        }
        var type = type;
        AppMap.Map.polylineHandler = null;

        var opt = {
            stroke: true,
            color: '#3388ff',
            //fillColor: '#1E90FF',
            fillColor: '#3388ff',
            weight: 3,
            opacity: 1,
            fill: false,
            clickable: true
        }

        if (type == 'polyne') {
            AppMap.Map.polylineHandler = null;
            AppMap.Map.polylineHandler = AppMap.Map.map.editTools.startPolygon();
            AppMap.Map.Layer.push(AppMap.Map.polylineHandler);
            AppMap.Map.ListenerClick = false;
            AppMap.Map.map.on('editable:vertex:new', function (e) {
                console.log(e, 'New')
                if (e.vertex.latlngs.length == 1) {
                    if (AppMap.Map.Layer.length > 1) {
                        AppMap.Map.map.removeLayer(AppMap.Map.Layer.shift());
                    }
                }
            });

            AppMap.Map.map.on('editable:drawing:commit', function (e) {
                AppMap.Map.polylineHandler.dragging.disable();
                var x = [];
                var y = [];
                var array = e.layer._latlngs[0];
                var length = array.length;
                for (var i = 0; i < length; i++) {
                    var item = array[i]
                    x.push(item.lat);
                    y.push(item.lng);
                }
                for (var i = 0; i < AppMap.Map.PointMap.length; i++) {
                    var point = AppMap.Map.PointMap[i];
                    var tt = AppMap.BelongingPolygon(AppMap.Map.PointMap[i].Point.Position, x, y);
                    if (tt == 0 || tt == false) {
                        AppMap.Map.map.removeLayer(point);
                        if (AppMap.Map.markerCluster != null) {
                            AppMap.Map.markerCluster.removeLayer(point);
                        }
                    }
                }
                AppMap.Map.polylineHandler.disableEdit();
                setTimeout(function () {
                    AppMap.Map.polylineHandler = AppMap.Map.map.editTools.startPolygon();
                    AppMap.Map.Layer.push(AppMap.Map.polylineHandler);
                }, 200);
            });
        }

        if (type == 'cicle') {
            AppMap.Map.map.editTools.stopDrawing();
            AppMap.Map.polylineHandler = null;
            AppMap.Map.polylineHandler = L.circle([AppMap.Map.SelectMarker.Point.Position.Latitude, AppMap.Map.SelectMarker.Point.Position.Longitude], { radius: 10000, shapeOptions: opt, dragging: false }).addTo(AppMap.Map.map);
            AppMap.Map.Layer.push(AppMap.Map.polylineHandler);
            AppMap.Map.polylineHandler.disableEdit()
            AppMap.Map.ListenerClick = false;
            AppMap.Map.polylineHandler.dragging.disable()
            //  AppMap.Map.map.on('editable:enable', function (e) {
            for (var i = 0; i < AppMap.Map.PointMap.length; i++) {
                var point = AppMap.Map.PointMap[i];
                var rt = AppMap.Distance(AppMap.Map.SelectMarker.Point.Position.Latitude, AppMap.Map.SelectMarker.Point.Position.Longitude, point.Point.Position.Latitude, point.Point.Position.Longitude);
                if (rt > 10) {
                    AppMap.Map.map.removeLayer(point);
                    if (AppMap.Map.markerCluster != null) {
                        AppMap.Map.markerCluster.removeLayer(point);
                    }
                }
            }
            //  });
        }

        if (type == 'drawing') {
            AppMap.Map.map.editTools.stopDrawing();
            if (AppMap.Map.polylineHandler != null) {
                if (typeof AppMap.Map.polylineHandler.removeAllArea != 'undefined') {
                    AppMap.Map.polylineHandler.removeAllArea();
                }
            }
            AppMap.Map.polylineHandler = null;
            AppMap.Map.polylineHandler = AppMap.Map.map.selectAreaFeature.enable();
            AppMap.Map.polylineHandler.options.color = '#3388ff';
            AppMap.Map.polylineHandler.options.weight = 3;
            AppMap.Map.polylineHandler.options.dasArray = '100';
            AppMap.Map.Layer.push(AppMap.Map.polylineHandler);
            AppMap.Map.ListenerClick = false;


            AppMap.Map.map.on('selectAreaFeature:mouseDown', function (e) {
                AppMap.Map.polylineHandler.removeAllArea();
            });

            AppMap.Map.map.on('selectAreaFeature:Commit', function (e) {
                if (typeof AppMap.Map.polylineHandler.getAreaLatLng != 'undefined') {
                    AppMap.Map.ListenerClick = false;
                    var x = [];
                    var y = [];
                    var pol = AppMap.Map.polylineHandler.getAreaLatLng();
                    for (var i = 0; i < pol.length; i++) {
                        var item = pol[i];
                        x.push(item.lat);
                        y.push(item.lng);
                    }
                    for (var i = 0; i < AppMap.Map.PointMap.length; i++) {
                        var point = AppMap.Map.PointMap[i];
                        var tt = AppMap.BelongingPolygon(AppMap.Map.PointMap[i].Point.Position, x, y);
                        if (tt == 0 || tt == false) {
                            AppMap.Map.map.removeLayer(point);
                            if (AppMap.Map.markerCluster != null) {
                                AppMap.Map.markerCluster.removeLayer(point);
                            }
                        }
                    }
                }
            });
        }

        if (type == 'stop') {
            AppMap.Map.ListenerClick = true;
            AppMap.Map.map.editTools.stopDrawing();
            AppMap.Map.polylineHandler = null;
        }
    },

    GeoJsonBoundary: function (e) {
        var style = {
            "color": "#ff7800",
            "weight": 5,
            "opacity": 0.65
        };

        var poly = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"coordinates\":[[[[11.4492185,42.3779784],[11.4492714,42.3779644],[11.4491694,42.3777782],[11.4494023,42.3776976],[11.4496865,42.3776709],[11.4502389,42.3775467],[11.4505362,42.377406],[11.4507521,42.3772653],[11.4509109,42.3771663],[11.4510235,42.3770625],[11.4511836,42.3770352],[11.4514198,42.3770825],[11.451696,42.3770529],[11.4520963,42.3769405],[11.4526447,42.3768016],[11.4528808,42.3767483],[11.4530009,42.3766419],[11.453117,42.3766448],[11.4532691,42.3766182],[11.4538375,42.376355],[11.4540137,42.3761806],[11.454155,42.37615],[11.4544205,42.3761862],[11.4547015,42.3761714],[11.4551706,42.3760454],[11.4555268,42.3759138],[11.4559633,42.3758026],[11.4562918,42.3756591],[11.4566413,42.375444],[11.4579476,42.3750076],[11.4584518,42.374939],[11.4589109,42.3748241],[11.4592922,42.3746518],[11.4595643,42.3745585],[11.4598491,42.3745109],[11.460258,42.3743775],[11.4605676,42.3742396],[11.4608951,42.3741829],[11.4614395,42.3740143],[11.461736,42.3738837],[11.4619663,42.373753],[11.4621851,42.373601],[11.4625611,42.3734848],[11.4629927,42.373416],[11.4635095,42.3732494],[11.4649,42.372819],[11.4670203,42.3720909],[11.4678407,42.3718751],[11.4683951,42.3716911],[11.4689169,42.3714252],[11.4693348,42.3712293],[11.4697245,42.3711046],[11.4702271,42.3710317],[11.4716036,42.3705944],[11.4722132,42.3703313],[11.4736766,42.369867],[11.4746993,42.3695948],[11.4751362,42.3693935],[11.4753852,42.3691922],[11.4757569,42.3690688],[11.4764812,42.3689374],[11.4796602,42.36796],[11.4807453,42.3676477],[11.4811469,42.3674812],[11.4816459,42.3673246],[11.4823275,42.3671511],[11.4825362,42.3670475],[11.4827287,42.3669222],[11.4829668,42.3668185],[11.4832766,42.3667752],[11.4843724,42.3664378],[11.4846725,42.3663149],[11.4848812,42.3661318],[11.4849367,42.3661005],[11.4850508,42.366086],[11.4853378,42.366127],[11.4856868,42.3660788],[11.4859966,42.3659294],[11.4861956,42.365833],[11.4870925,42.3655438],[11.4887558,42.3649847],[11.4891965,42.3648584],[11.4896456,42.3647257],[11.4902294,42.3643754],[11.4904539,42.364309],[11.490913,42.3642242],[11.4911625,42.3640768],[11.4914619,42.3640399],[11.4917314,42.363885],[11.4920008,42.3638408],[11.4925697,42.3636048],[11.4928491,42.3635643],[11.4934928,42.3632583],[11.4937772,42.3631735],[11.494401,42.3629559],[11.4952093,42.3625614],[11.4956135,42.3623697],[11.4960926,42.3622959],[11.4972402,42.3619309],[11.4978375,42.3617219],[11.4987441,42.3614424],[11.4996427,42.3611422],[11.4999929,42.3609632],[11.5003672,42.3608183],[11.5005533,42.3607798],[11.5008135,42.3607251],[11.5010596,42.3606527],[11.5013178,42.3605521],[11.5015139,42.3605211],[11.5018522,42.3603673],[11.5020403,42.3602904],[11.5022004,42.3602504],[11.5028849,42.3600138],[11.503007,42.3599547],[11.5031871,42.3598226],[11.5032723,42.3597457],[11.5034533,42.359678100000004],[11.5036403,42.3596218],[11.5037879,42.359584],[11.5039158,42.3595488],[11.5040258,42.3595109],[11.5044759,42.3593468],[11.5050409,42.3590391],[11.504941,42.3588228],[11.504983,42.3588072],[11.5050399,42.3589399],[11.5051327,42.3589135],[11.5050747,42.3587714],[11.5051167,42.3587596],[11.5052279,42.359012],[11.5054126,42.3589668],[11.5055579,42.3589243],[11.5057931,42.3588645],[11.5060302,42.3587915],[11.506251,42.3587497],[11.5065133,42.3586577],[11.5066364,42.3585817],[11.506805,42.3585124],[11.5069845,42.3584485],[11.507244,42.3583746],[11.5080164,42.3579864],[11.5082979,42.3578292],[11.508523,42.3577761],[11.5088013,42.3577461],[11.5091203,42.3577137],[11.50958,42.3575797],[11.5098489,42.3574826],[11.5101304,42.357374],[11.5102554,42.3573232],[11.5105087,42.3572747],[11.5112749,42.357002],[11.5117283,42.3567524],[11.5122412,42.3565606],[11.5128978,42.356311],[11.5134639,42.3561377],[11.5137985,42.3559482],[11.5140111,42.3557102],[11.5141956,42.3556132],[11.514477,42.3555161],[11.5148836,42.3554167],[11.5151212,42.3552989],[11.5152776,42.3551602],[11.5153997,42.3551212],[11.5164371,42.3546188],[11.516916,42.3544274],[11.5170919,42.3542974],[11.5172629,42.354218],[11.5174388,42.3541963],[11.5179763,42.3538424],[11.5184746,42.3536077],[11.5191489,42.3533189],[11.5200532,42.3528957],[11.5203577,42.3528415],[11.5209675,42.3525671],[11.5211942,42.3524111],[11.5214775,42.3522719],[11.5216086,42.3521598],[11.5216221,42.3521182],[11.5214941,42.3520014],[11.5214013,42.3519175],[11.5214226,42.3518421],[11.5214913,42.3518334],[11.5215668,42.3518441],[11.5216192,42.3518311],[11.5222045,42.3525977],[11.5224292,42.3525108],[11.5223064,42.3523505],[11.5219084,42.3517058],[11.5219338,42.3516894],[11.5219232,42.3516357],[11.5220021,42.3516032],[11.5220659,42.3516138],[11.5220876,42.3516439],[11.5221388,42.35177],[11.5221965,42.3518871],[11.5223292,42.3518798],[11.5227511,42.3517652],[11.5230744,42.3516138],[11.5236256,42.3513856],[11.5240586,42.3512313],[11.5246762,42.3511129],[11.5253407,42.3509251],[11.5258332,42.3507114],[11.5262905,42.3506045],[11.52674,42.3505467],[11.5272443,42.3503936],[11.5274827,42.3502549],[11.5277222,42.3500817],[11.5280673,42.3500277],[11.5283774,42.3499287],[11.5289323,42.3497618],[11.5294146,42.3495298],[11.5297591,42.3493035],[11.5300852,42.3491815],[11.5317417,42.3487039],[11.5321628,42.3485228],[11.5323771,42.3483276],[11.5325518,42.3482565],[11.5329829,42.3482698],[11.5335674,42.3481409],[11.5341224,42.3479033],[11.5345741,42.3476374],[11.5348267,42.3474677],[11.5354429,42.3472838],[11.5360132,42.3471516],[11.5366892,42.3469274],[11.5370199,42.346718],[11.5371347,42.3466162],[11.5372151,42.3464946],[11.5372725,42.3464749],[11.5376208,42.3464295],[11.538015,42.3463248],[11.5400436,42.3455752],[11.540411,42.3454083],[11.5406483,42.3451906],[11.5410617,42.3450576],[11.5412875,42.3450548],[11.5415325,42.3449954],[11.541766,42.344902],[11.5420415,42.3446474],[11.5421104,42.344605],[11.5426807,42.3444381],[11.5431783,42.3442202],[11.543362,42.3441212],[11.5436567,42.3440731],[11.5439783,42.3439062],[11.5442691,42.343711],[11.545096,42.3433755],[11.5456509,42.3431452],[11.5460298,42.3428906],[11.546212,42.3428147],[11.5468412,42.3426558],[11.5472048,42.34252],[11.5476144,42.342404],[11.5481655,42.342189],[11.548533,42.3420221],[11.5488775,42.341875],[11.5490918,42.3417448],[11.5504299,42.3411824],[11.5508065,42.3408791],[11.551285,42.3406217],[11.5518216,42.340503],[11.5521608,42.3403238],[11.5534573,42.3396708],[11.5535623,42.3396089],[11.554324,42.3392071],[11.5545145,42.3391383],[11.5548216,42.3389836],[11.5552158,42.3387092],[11.5557899,42.338497],[11.5560081,42.3383329],[11.5561574,42.3382509],[11.5563641,42.3382028],[11.5566052,42.338067],[11.5573926,42.3376695],[11.5575506,42.337552],[11.5580767,42.3373796],[11.5589945,42.3369906],[11.5591773,42.3368193],[11.5594256,42.3367001],[11.5598349,42.3364239],[11.5600078,42.3362873],[11.5604633,42.3360808],[11.560915,42.3359365],[11.5611982,42.3357752],[11.5614623,42.3357073],[11.5621849,42.335329],[11.5625364,42.3350799],[11.5634914,42.3345386],[11.5641144,42.3342492],[11.5644047,42.3340459],[11.5647807,42.3338541],[11.5650946,42.3335966],[11.565253,42.33351],[11.5656011,42.3334336],[11.5660379,42.3331122],[11.5666715,42.3328751],[11.5677467,42.3323522],[11.5685715,42.3317291],[11.5695613,42.3312708],[11.5705411,42.3306313],[11.5709775,42.3304672],[11.5719099,42.3297457],[11.57226,42.3295559],[11.5726572,42.3292256],[11.572862,42.3291186],[11.5730579,42.3288681],[11.5732528,42.3286911],[11.5733081,42.3284891],[11.573402,42.3283637],[11.5733987,42.3283155],[11.5729896,42.3278941],[11.5726189,42.3276606],[11.5725456,42.3276889],[11.5723306,42.3275882],[11.5723164,42.3275335],[11.5723211,42.3274883],[11.5723931,42.3274422],[11.5725178,42.3274422],[11.5726534,42.3275232],[11.5731258,42.3278225],[11.5734468,42.3282128],[11.5736509,42.3278832],[11.5738497,42.3275749],[11.573796,42.3274808],[11.5736904,42.3274046],[11.5734745,42.3271333],[11.5733522,42.3270677],[11.5732856,42.3269559],[11.5733138,42.3268939],[11.5734056,42.326852],[11.5734993,42.3268797],[11.5735961,42.3269336],[11.5739345,42.3274758],[11.5739725,42.3275058],[11.574256,42.3274888],[11.5746998,42.3273714],[11.5751106,42.3272454],[11.5755108,42.3271009],[11.5758117,42.3269582],[11.575954,42.326871],[11.5762711,42.3267357],[11.576643,42.3265389],[11.5770148,42.3263191],[11.577397,42.3261477],[11.5779527,42.3258599],[11.5783668,42.3256113],[11.578642,42.3254082],[11.5791946,42.3251286],[11.5795915,42.3250017],[11.5799536,42.3248153],[11.5804713,42.3245079],[11.5810863,42.3242093],[11.5812285,42.3240983],[11.5814141,42.324013],[11.5818052,42.3238068],[11.5821164,42.3236035],[11.582127,42.3235966],[11.5824146,42.323355],[11.5824221,42.3233487],[11.5826367,42.3232029],[11.5828889,42.3230773],[11.5831081,42.3229364],[11.5835715,42.3225645],[11.5836811,42.3224648],[11.583805,42.3223598],[11.5839553,42.3222997],[11.5840724,42.3222438],[11.584151,42.3221903],[11.5842195,42.322144],[11.5842276,42.3221385],[11.5843617,42.3220378],[11.5846158,42.3218034],[11.584998,42.3215944],[11.5851748,42.3214817],[11.5853923,42.3212638],[11.5857054,42.3210639],[11.5860367,42.320882],[11.5866201,42.3204883],[11.586864,42.3203004],[11.5871311,42.3200737],[11.5873336,42.3199412],[11.5875511,42.3197623],[11.5878668,42.3194982],[11.5878912,42.3194799],[11.5879134,42.3194633],[11.5879788,42.3194143],[11.5885292,42.3191104],[11.5886822,42.3190254],[11.588827,42.3189525],[11.5893877,42.3185333],[11.5895695,42.3184764],[11.5901426,42.3181027],[11.590353,42.3180345],[11.5908882,42.317679],[11.5910376,42.3175806],[11.5912814,42.3174199],[11.5915474,42.3172552],[11.5918249,42.3170548],[11.5922809,42.3167905],[11.5925551,42.3166196],[11.5929575,42.3164181],[11.5932884,42.3162232],[11.5939635,42.3158147],[11.594272,42.3156429],[11.5949697,42.3151766],[11.5952257,42.3150338],[11.5953876,42.3149531],[11.5956062,42.3148287],[11.5958976,42.3145486],[11.5967352,42.313967],[11.5977063,42.313388],[11.5978718,42.3132306],[11.5986213,42.3127571],[11.5991969,42.3123202],[11.5993743,42.3122549],[11.5996968,42.3119558],[11.5999127,42.3118489],[11.6000886,42.311724],[11.6004616,42.3112999],[11.600824,42.3110891],[11.6010126,42.3109342],[11.60116,42.3108258],[11.6013864,42.3106699],[11.6015717,42.3105164],[11.601863,42.3103602],[11.602076,42.3101482],[11.6022802,42.309993],[11.6022781,42.3099204],[11.6023628,42.3098455],[11.6025656,42.309771],[11.6027442,42.309743],[11.6029673,42.3097367],[11.6030879,42.3097532],[11.603179,42.3097369],[11.6034787,42.3096409],[11.603813,42.3095336],[11.6042088,42.309436],[11.6046443,42.3093742],[11.6055319,42.3091044],[11.606942,42.3086556],[11.6085054,42.3079772],[11.6089404,42.3077447],[11.6092634,42.307544],[11.6096381,42.3074039],[11.609918,42.3073465],[11.612416,42.3061776],[11.6128209,42.3059578],[11.6131869,42.3058368],[11.6136693,42.3055915],[11.6139504,42.3053488],[11.6142292,42.3052156],[11.6147331,42.3050691],[11.6151896,42.3047984],[11.6154437,42.30462],[11.6157323,42.3044735],[11.6160639,42.3043524],[11.6164659,42.304114],[11.6175428,42.3036459],[11.6187385,42.3030719],[11.6188505,42.3029732],[11.6190701,42.3029095],[11.6194405,42.3026993],[11.6195568,42.3026228],[11.61991,42.3024444],[11.6202148,42.3022493],[11.6208187,42.3019225],[11.6211856,42.3016573],[11.6220199,42.301282],[11.6224345,42.3009852],[11.6228135,42.3008526],[11.6231265,42.3006629],[11.6236443,42.3004564],[11.6238938,42.3002686],[11.624237,42.3000089],[11.6247573,42.2997248],[11.6251909,42.2995202],[11.625831,42.299117],[11.6262971,42.2988444],[11.6264951,42.2986293],[11.627552,42.2980846],[11.6276217,42.2979978],[11.6279619,42.2978494],[11.6281849,42.2977028],[11.6284987,42.2974432],[11.6287052,42.297208],[11.6290834,42.2970836],[11.6295187,42.2967773],[11.629667,42.2966277],[11.6300017,42.2964106],[11.6302312,42.2962217],[11.6304939,42.2960002],[11.6306127,42.2958751],[11.6308459,42.2956896],[11.6312263,42.2955843],[11.6315655,42.295455],[11.6318891,42.2953653],[11.6321286,42.2952446],[11.6324358,42.2949225],[11.6327128,42.2947955],[11.6331374,42.2945338],[11.633661,42.2941158],[11.6337857,42.2940382],[11.634027,42.2939468],[11.6343101,42.2936963],[11.634583,42.2936215],[11.6347852,42.2934421],[11.6349014,42.2933],[11.6351968,42.2931892],[11.6355077,42.2928438],[11.6357502,42.2927926],[11.6359363,42.2926915],[11.636226,42.292456],[11.6366708,42.2920128],[11.6371261,42.2917455],[11.6376639,42.2913735],[11.6377359,42.2912258],[11.637962,42.291013],[11.6385685,42.2906055],[11.6392079,42.2900303],[11.6396869,42.2896152],[11.6399617,42.2894541],[11.640279,42.2892057],[11.6406667,42.2888042],[11.6409185,42.2886437],[11.6412094,42.2883883],[11.6414711,42.2882306],[11.6415586,42.2881293],[11.6416941,42.2879724],[11.6418274,42.2878499],[11.642131,42.2877145],[11.6422562,42.2876032],[11.6423241,42.2874705],[11.6424744,42.2873592],[11.6429157,42.2871871],[11.6431482,42.2869905],[11.6434092,42.286657],[11.6435914,42.2865268],[11.6441305,42.2862849],[11.6444276,42.2859472],[11.6446522,42.2858496],[11.645264,42.2854584],[11.645541,42.2851461],[11.645993,42.2848473],[11.6464251,42.2845001],[11.6467168,42.2841433],[11.647042,42.2839102],[11.6478181,42.2831719],[11.6482001,42.2828775],[11.6484696,42.2825682],[11.6490337,42.2822144],[11.6498264,42.2813753],[11.6502353,42.281169],[11.6505672,42.2808417],[11.6507242,42.2806893],[11.6512485,42.2801798],[11.6520939,42.2793883],[11.6524981,42.2790926],[11.6528001,42.2788348],[11.6531068,42.2786526],[11.6533208,42.2784225],[11.6542529,42.2776712],[11.6545193,42.2775593],[11.654761,42.2773702],[11.6550538,42.2770382],[11.6559598,42.2761291],[11.6562367,42.2759981],[11.6565685,42.2757578],[11.656824,42.2754312],[11.6573241,42.2751023],[11.6576057,42.2747665],[11.658414,42.274078],[11.6586285,42.2738756],[11.6589352,42.2735858],[11.6590683,42.2733854],[11.6594912,42.2730607],[11.6615309,42.2711747],[11.6622656,42.2704543],[11.6632589,42.2695023],[11.6640432,42.2688257],[11.664649,42.2682589],[11.6651083,42.2677451],[11.6655805,42.2673195],[11.6662215,42.2664157],[11.6666045,42.2660936],[11.6672283,42.2653037],[11.6677093,42.2647232],[11.6680179,42.2642781],[11.6682738,42.2636553],[11.6684374,42.2631966],[11.6685033,42.2627827],[11.6688642,42.2620808],[11.6690599,42.2618105],[11.6696778,42.2610837],[11.6699615,42.2605777],[11.6701929,42.26013],[11.6704815,42.2594285],[11.6706964,42.259149],[11.6710843,42.258704],[11.6714089,42.2581548],[11.6716875,42.2574749],[11.6721714,42.2565457],[11.6722861,42.2561697],[11.672804,42.2556154],[11.6730202,42.2553838],[11.6735676,42.254645],[11.6738252,42.2542517],[11.6740885,42.2539352],[11.6748261,42.2534045],[11.6751455,42.2529289],[11.6754997,42.2527203],[11.6756881,42.2524963],[11.6758031,42.2522803],[11.6770738,42.2510843],[11.6773241,42.250823],[11.677472,42.2504941],[11.6776858,42.2501729],[11.6780387,42.2498458],[11.6783028,42.2495121],[11.6783476,42.2492493],[11.6795187,42.2478411],[11.6797839,42.2472195],[11.6802806,42.246449],[11.6810868,42.2454842],[11.6820574,42.2445683],[11.6837667,42.2433149],[11.6858636,42.2421702],[11.6876604,42.2412022],[11.6881717,42.2407423],[11.688839,42.2403441],[11.6894186,42.2399052],[11.6900651,42.2394116],[11.6919602,42.2380865],[11.6927019,42.2372787],[11.6933874,42.2368342],[11.6940369,42.2362591],[11.6943756,42.2359084],[11.6946341,42.2354916],[11.6952338,42.2349994],[11.6953255,42.2351364],[11.6954204,42.2352844],[11.6955896,42.2352086],[11.6957091,42.2351321],[11.695694,42.2350853],[11.6956155,42.2349846],[11.695648,42.2347437],[11.6956973,42.2345013],[11.695765,42.2340476],[11.6960315,42.2337767],[11.6962714,42.2334662],[11.6967467,42.2330089],[11.6969609,42.2326791],[11.6971826,42.2323595],[11.6973371,42.2321348],[11.6974565,42.2320312],[11.6974127,42.2319664],[11.6975118,42.2319456],[11.6975619,42.2318263],[11.697757,42.2316168],[11.6979019,42.2312148],[11.6984285,42.230376],[11.6987848,42.229935],[11.69887,42.2297167],[11.6990371,42.2293552],[11.6991923,42.2291212],[11.6991638,42.2291227],[11.6991144,42.2290909],[11.6991112,42.2290376],[11.6991381,42.2290034],[11.6992572,42.2290233],[11.6996923,42.2283007],[11.7001377,42.2278143],[11.7005345,42.2271352],[11.7009305,42.2268308],[11.7010408,42.2266304],[11.7010476,42.2264968],[11.7013888,42.226038],[11.701543,42.2256651],[11.7015626,42.2256174],[11.7014806,42.2255795],[11.7013953,42.2255938],[11.7013117,42.225545],[11.7013294,42.2254949],[11.7013777,42.2254806],[11.7014833,42.2254872],[11.7017736,42.2249562],[11.7020852,42.2246931],[11.702189,42.2244539],[11.7022159,42.2242517],[11.7022928,42.2241549],[11.7025928,42.2239528],[11.7028675,42.223638],[11.7030279,42.2233229],[11.7032715,42.2230382],[11.7034059,42.2228972],[11.7034803,42.2227283],[11.7033697,42.2226546],[11.7033902,42.2225847],[11.7035061,42.2225678],[11.7036821,42.2222015],[11.7040677,42.2218163],[11.7043542,42.2212852],[11.70455,42.2210331],[11.7049837,42.2206249],[11.7051283,42.2203372],[11.7055137,42.2199845],[11.7056976,42.21961],[11.7057023,42.2195043],[11.7056174,42.2195007],[11.7055523,42.2194254],[11.7055701,42.2193728],[11.7056273,42.2193597],[11.7057504,42.219382],[11.7063883,42.2185383],[11.7069742,42.2174175],[11.7069951,42.2173254],[11.7070525,42.2172678],[11.7070009,42.2171672],[11.7071317,42.2171163],[11.707395,42.2166128],[11.7076525,42.2159913],[11.7078278,42.2153604],[11.7079044,42.2151493],[11.7077258,42.2151047],[11.7073419,42.2151073],[11.7073652,42.2150016],[11.7075825,42.2150233],[11.7074234,42.2144212],[11.7071654,42.2141218],[11.707146,42.2141051],[11.7071117,42.2140646],[11.7070908,42.2140326],[11.7070285,42.2140831],[11.7070058,42.214016],[11.7069114,42.2140258],[11.7067812,42.2139628],[11.7065837,42.2139922],[11.7065162,42.2139586],[11.7066019,42.2139153],[11.7067229,42.2138917],[11.7072809,42.2127832],[11.7078335,42.2119093],[11.7079598,42.2117093],[11.7079982,42.2111007],[11.7078969,42.2108769],[11.7077317,42.2106741],[11.7076343,42.2106664],[11.7075847,42.2106624],[11.7075304,42.2106942],[11.7075079,42.2106785],[11.7074896,42.2106657],[11.7075755,42.2105619],[11.7082251,42.2102206],[11.7084149,42.2100457],[11.7087543,42.2097826],[11.7090049,42.2094917],[11.7091118,42.209243],[11.7092068,42.2090554],[11.7102489,42.2079214],[11.7107887,42.2074785],[11.7110517,42.2071622],[11.7115863,42.2064282],[11.7124572,42.2049878],[11.7127577,42.2043731],[11.7130881,42.2035431],[11.7133162,42.2030941],[11.713179,42.2026152],[11.7130104,42.2017783],[11.7130203,42.2014985],[11.7124373,42.2012346],[11.7126421,42.2008895],[11.7133535,42.2004593],[11.7138753,42.200049],[11.7143599,42.1994747],[11.7148438,42.1990045],[11.7155459,42.1981697],[11.7160172,42.1977721],[11.716491,42.1971699],[11.7167553,42.1969843],[11.7171532,42.1964301],[11.7176139,42.1958085],[11.7178853,42.1952982],[11.7181791,42.1950545],[11.7183348,42.1947477],[11.7192435,42.1935648],[11.7205875,42.191307],[11.7207873,42.190668],[11.7209305,42.1903378],[11.7209677,42.1900823],[11.7209518,42.1898543],[11.7207183,42.1897167],[11.7205385,42.1896696],[11.7205427,42.1896004],[11.7208271,42.189506],[11.7210053,42.1893237],[11.721103,42.1891098],[11.7210945,42.1889054],[11.7209714,42.1887356],[11.7208483,42.1886098],[11.7206487,42.1885294],[11.7201311,42.188528],[11.7201295,42.1888427],[11.7200074,42.1888423],[11.7200089,42.1885277],[11.7200349,42.188182],[11.720158,42.1881814],[11.7201406,42.1884138],[11.7205427,42.1884306],[11.7207846,42.1883582],[11.7209417,42.188135],[11.7209629,42.1879117],[11.7208228,42.1876979],[11.7207083,42.1876004],[11.7205045,42.1874935],[11.7203036,42.1874665],[11.7201645,42.1877693],[11.7200502,42.1877404],[11.7204023,42.1869741],[11.7205167,42.1870029],[11.7203656,42.1873315],[11.7207337,42.1873865],[11.7210223,42.1873268],[11.7212675,42.1871804],[11.7213576,42.186984],[11.7213831,42.1868173],[11.7212557,42.1866381],[11.7210241,42.1865132],[11.7208644,42.1866962],[11.7207585,42.1866455],[11.7212851,42.1860422],[11.7213838,42.1860896],[11.7212031,42.1862965],[11.7214255,42.1864242],[11.721642,42.1864368],[11.7218814,42.1863791],[11.7220537,42.1862639],[11.722147,42.1861223],[11.722198,42.1859557],[11.7221385,42.1857387],[11.7219645,42.1855972],[11.7217459,42.1857447],[11.7216724,42.1856872],[11.7222794,42.1852313],[11.7223529,42.1852888],[11.7221218,42.1854448],[11.7223083,42.1855343],[11.722495,42.1855783],[11.72272,42.1855626],[11.7229098,42.1854469],[11.7230703,42.1852482],[11.723065,42.1849966],[11.7229695,42.1848433],[11.7227346,42.1846597],[11.7225435,42.1848197],[11.7224783,42.184777],[11.7231092,42.1842485],[11.7231744,42.1842913],[11.7229603,42.1844705],[11.7231817,42.1846428],[11.7233917,42.1847013],[11.7236327,42.1846743],[11.7238502,42.1845642],[11.7240093,42.1843912],[11.7240571,42.1842536],[11.7243011,42.1841907],[11.7244191,42.1841164],[11.7244848,42.1840196],[11.7244762,42.183966],[11.7244965,42.1839187],[11.7246354,42.183888],[11.7247168,42.1838506],[11.724768,42.1837858],[11.7247799,42.1836752],[11.7248699,42.1836158],[11.7249908,42.1834949],[11.7250386,42.1833731],[11.7250281,42.1832168],[11.7250969,42.1832119],[11.7252773,42.1832433],[11.7255213,42.1832045],[11.7257335,42.1831529],[11.7259139,42.1830468],[11.7261208,42.1828266],[11.7262216,42.1826183],[11.7260412,42.1826222],[11.7261908,42.1822631],[11.7264124,42.1822824],[11.7269811,42.1820654],[11.7275108,42.1818317],[11.7285765,42.1814124],[11.7292486,42.180961],[11.7298676,42.180488],[11.7301992,42.180276],[11.7309094,42.1796222],[11.7314038,42.1790972],[11.7319094,42.1784848],[11.7324191,42.1781128],[11.7328243,42.1777598],[11.7329477,42.1775266],[11.7331911,42.1772729],[11.7333699,42.1771573],[11.7335715,42.177101],[11.7338111,42.1770953],[11.7338382,42.1769297],[11.7339594,42.1767317],[11.7337388,42.176743],[11.7335715,42.1766697],[11.7341344,42.1764161],[11.7348342,42.1759369],[11.7352905,42.1755479],[11.7357276,42.175081],[11.7362838,42.1744451],[11.7369444,42.1739135],[11.7376241,42.173258],[11.7380329,42.1729973],[11.7382515,42.1727437],[11.7383561,42.1724971],[11.7387411,42.1720885],[11.7391261,42.1717116],[11.7395728,42.1709683],[11.7395776,42.1707358],[11.739359,42.170697],[11.7393685,42.1706055],[11.7395491,42.1704434],[11.7399198,42.1701369],[11.7400496,42.1699167],[11.7401225,42.1695061],[11.7402316,42.1691869],[11.7402207,42.1689052],[11.7401848,42.1686594],[11.7400789,42.1684735],[11.7399483,42.1683403],[11.7398002,42.168305],[11.7397535,42.1683403],[11.7395587,42.1684585],[11.7394388,42.1684897],[11.739389,42.1684585],[11.7394974,42.1683511],[11.7395728,42.16829],[11.7395899,42.1681815],[11.7395369,42.1680106],[11.7394528,42.167879],[11.7393251,42.1677948],[11.7391771,42.1677205],[11.7389824,42.1676687],[11.738809,42.1675402],[11.7384805,42.1676507],[11.738155,42.1678107],[11.7380016,42.1677386],[11.7379788,42.1676116],[11.738067,42.1674899],[11.7383074,42.1674132],[11.7381218,42.1671336],[11.7381766,42.167084],[11.7382435,42.1670953],[11.7382921,42.1671224],[11.7383895,42.167287],[11.7384595,42.1672712],[11.7386389,42.167075],[11.7387211,42.1668901],[11.7386846,42.1667842],[11.7386176,42.1667887],[11.7385446,42.1667819],[11.7384716,42.1667368],[11.7384716,42.1666759],[11.7385385,42.1666354],[11.7385903,42.1665993],[11.7385081,42.1665249],[11.7382952,42.1663084],[11.7381005,42.1661754],[11.7377446,42.1660514],[11.7375317,42.1660108],[11.7373309,42.1660401],[11.7371818,42.1660942],[11.7371088,42.1662115],[11.7370936,42.1662385],[11.7372944,42.1664324],[11.7372914,42.166482],[11.7372427,42.1665091],[11.7371818,42.1665046],[11.7371332,42.166464],[11.7371271,42.1664121],[11.7369963,42.1662656],[11.7369263,42.1662363],[11.7368716,42.1662656],[11.7367986,42.1663716],[11.7366678,42.1663851],[11.7363909,42.1662904],[11.7362723,42.1662701],[11.736175,42.1662814],[11.7361141,42.1662385],[11.736108,42.1661844],[11.7361233,42.1661123],[11.7361202,42.1659973],[11.7360381,42.1657786],[11.7360381,42.1656658],[11.7361111,42.1655509],[11.7360928,42.1655013],[11.736029,42.1654832],[11.735889,42.1655035],[11.7358069,42.165508],[11.7357491,42.1654539],[11.7357734,42.1653953],[11.7358525,42.1653412],[11.736105,42.1653028],[11.7361506,42.1652555],[11.7360898,42.1651653],[11.7359985,42.165127],[11.7360533,42.1650142],[11.7360381,42.1649421],[11.7360077,42.1647572],[11.7359803,42.1646715],[11.7358799,42.1645633],[11.7358039,42.1644686],[11.7357917,42.1643852],[11.7355605,42.1643491],[11.7354449,42.164322],[11.7354054,42.1642499],[11.7354723,42.1641755],[11.7355818,42.1641462],[11.73567,42.1640695],[11.7357156,42.1639342],[11.7357096,42.1638034],[11.7356883,42.1637065],[11.7355757,42.1636434],[11.7355575,42.1635419],[11.7356274,42.1634246],[11.7356974,42.1633457],[11.7356883,42.1629308],[11.7356365,42.1626107],[11.7352323,42.1620588],[11.7349494,42.1618807],[11.7346574,42.1617972],[11.734411,42.1616349],[11.7343478,42.1613457],[11.7340966,42.1609217],[11.733976,42.1608186],[11.7339334,42.160742],[11.7340247,42.1606292],[11.7339121,42.1597994],[11.7341418,42.1592191],[11.734294,42.1589582],[11.7372261,42.1600873],[11.7444951,42.1619666],[11.7462929,42.1624144],[11.7481388,42.1628339],[11.7731771,42.1648154],[11.7957968,42.160754],[11.7994945,42.1600874],[11.8007602,42.1597438],[11.8010253,42.1596718],[11.80212,42.1592624],[11.803028,42.1587224],[11.8045519,42.1567805],[11.8151864,42.1515671],[11.8237523,42.1474752],[11.8255799,42.1485558],[11.8262918,42.1490696],[11.8280097,42.1507427],[11.8284263,42.1512267],[11.8291974,42.1521227],[11.8319657,42.1582948],[11.8319235,42.1589757],[11.8303264,42.1625317],[11.8290867,42.1650972],[11.8287114,42.1656377],[11.8285204,42.1662413],[11.8284459,42.1670131],[11.8286727,42.1674847],[11.8289562,42.1678875],[11.8316542,42.170842],[11.8353761,42.1747753],[11.8514045,42.1885966],[11.8520571,42.1890891],[11.8607431,42.1943297],[11.8702192,42.1995858],[11.8702873,42.1996641],[11.8707175,42.2001587],[11.8700917,42.20053],[11.8689648,42.2010355],[11.8686414,42.2013813],[11.8668646,42.2066313],[11.8670055,42.2078551],[11.8724454,42.2228439],[11.8739232,42.2232758],[11.8748326,42.2229554],[11.8751562,42.2220409],[11.8749498,42.2210515],[11.8744218,42.2196786],[11.8837179,42.2309816],[11.8848559,42.2307086],[11.8929632,42.2313012],[11.8947088,42.2315993],[11.8947685,42.2316282],[11.8955653,42.2320144],[11.8958275,42.2327282],[11.8956383,42.2333453],[11.894458,42.2337983],[11.8943328,42.2338536],[11.8933645,42.2342807],[11.8927073,42.234716],[11.8925727,42.2352507],[11.8929269,42.2361062],[11.8942264,42.2372305],[11.8948981,42.2376098],[11.9123242,42.2421165],[11.9128435,42.2420762],[11.9134821,42.2412406],[11.914565,42.2391959],[11.914691,42.2387074],[11.9147076,42.238643],[11.9145894,42.2379166],[11.9140191,42.2373593],[11.913343,42.2368857],[11.9129709,42.2362063],[11.9129958,42.2356609],[11.9132809,42.2350098],[11.9140855,42.2343275],[11.9153178,42.2339675],[11.9174326,42.2335985],[11.9182551,42.2335204],[11.9186698,42.2330987],[11.9215278,42.2307629],[11.9257704,42.2281046],[11.9407967,42.2203315],[11.95301,42.2153079],[11.9598988,42.213023],[11.9673097,42.2119399],[11.9692941,42.2116679],[11.9699164,42.2117643],[11.9705102,42.2122712],[11.9713061,42.2132276],[11.9714931,42.213601],[11.9716875,42.2141452],[11.9720779,42.2144458],[11.9743113,42.2145589],[11.9750399,42.2140808],[11.9797738,42.2081091],[11.9797934,42.2080779],[11.9801358,42.2075324],[11.9828459,42.2007803],[11.9837804,42.1988548],[11.9880234,42.1901097],[11.9911675,42.1843771],[11.9958966,42.1775765],[11.9986592,42.1724915],[11.9998524,42.1653569],[11.9999486,42.1649762],[12.0032071,42.1594519],[12.0042152,42.1588897],[12.0251363,42.1547826],[12.0305342,42.1537413],[12.0308627,42.1533076],[12.0315815,42.1531535],[12.0324327,42.1529869],[12.0356914,42.1525675],[12.0391171,42.1535843],[12.0448222,42.1549547],[12.045426,42.1549116],[12.0466181,42.1547854],[12.0493131,42.1544571],[12.0518005,42.1540893],[12.0586652,42.1650386],[12.0613238,42.165366],[12.0621133,42.1654215],[12.0636199,42.1655253],[12.0649278,42.1655398],[12.0685787,42.1654467],[12.0702452,42.1653525],[12.0709615,42.1651622],[12.0836454,42.1626245],[12.0886712,42.16247],[12.0894622,42.1622743],[12.0907826,42.1620496],[12.0916995,42.1619753],[12.0943259,42.1619585],[12.0950275,42.1619665],[12.0973276,42.1627058],[12.0990608,42.1632668],[12.1005918,42.1636216],[12.1187399,42.1624764],[12.1198291,42.1619515],[12.1245205,42.159631],[12.1296904,42.1569731],[12.1332486,42.1540214],[12.1347512,42.1525755],[12.1353986,42.1517339],[12.1360296,42.1507891],[12.1364887,42.1500247],[12.1368265,42.1490249],[12.1368737,42.1482627],[12.1383089,42.1493602],[12.1484592,42.1571209],[12.1488516,42.1586905],[12.1494804,42.1597062],[12.1498483,42.1604113],[12.1505893,42.1614973],[12.1532361,42.1619242],[12.1538997,42.1621067],[12.1545613,42.1622885],[12.1555843,42.1626295],[12.1567293,42.1630347],[12.1578138,42.1634236],[12.1588563,42.1639261],[12.1595604,42.1643096],[12.1606112,42.1648818],[12.1646351,42.1667887],[12.1651817,42.167498],[12.1669492,42.1726215],[12.168382,42.1745],[12.1688191,42.1753778],[12.1714725,42.176186],[12.1737059,42.1773472],[12.1759191,42.1784322],[12.1764972,42.1787185],[12.1786426,42.178385],[12.1841477,42.1781693],[12.1903394,42.1781154],[12.1942659,42.1783044],[12.1967121,42.1787795],[12.1993948,42.1792709],[12.2023061,42.1800419],[12.2029784,42.1817222],[12.2031817,42.1825974],[12.203492,42.1830165],[12.2037576,42.1830874],[12.2040836,42.1832824],[12.2042187,42.1834137],[12.2057773,42.1843587],[12.206206,42.1845016],[12.2075829,42.1849576],[12.2098608,42.1856859],[12.2126911,42.1861622],[12.2158325,42.1868534],[12.2175091,42.1855622],[12.2196347,42.1846622],[12.2203635,42.1841972],[12.2214567,42.1828171],[12.2227632,42.1834513],[12.2294111,42.1806688],[12.2298538,42.1804904],[12.2367065,42.1776608],[12.2372662,42.1774784],[12.2509031,42.1777497],[12.2531031,42.1781285],[12.2568242,42.1791754],[12.2671294,42.1817545],[12.2723594,42.1829018],[12.2751414,42.1788605],[12.2743089,42.1782134],[12.2739391,42.1778503],[12.2735866,42.177104],[12.2729033,42.1753586],[12.2728169,42.1746226],[12.2729962,42.1741088],[12.2735969,42.1733172],[12.2744736,42.1727294],[12.2752999,42.1725257],[12.2763638,42.1722656],[12.2782034,42.1722445],[12.2787478,42.172238],[12.2817996,42.1727179],[12.2829712,42.1729225],[12.2832173,42.1729654],[12.2839282,42.1733046],[12.2840986,42.1733859],[12.2847279,42.1738496],[12.2852718,42.1743023],[12.285784,42.1748279],[12.2863445,42.175145],[12.2919013,42.1720635],[12.2954243,42.1699767],[12.2973305,42.1685757],[12.2983318,42.1672007],[12.2998872,42.1652109],[12.3001495,42.1649017],[12.3007669,42.1644382],[12.3059112,42.1611653],[12.3069083,42.1607898],[12.3075555,42.1606541],[12.3041849,42.1568343],[12.3039833,42.1564484],[12.3035983,42.1553294],[12.3034704,42.1545002],[12.3037271,42.1538535],[12.3039,42.1536864],[12.3062902,42.1519336],[12.3098102,42.1500221],[12.310304,42.1497602],[12.310675,42.1496369],[12.3118592,42.1517233],[12.3122116,42.1519832],[12.3125977,42.1521927],[12.3129419,42.1522818],[12.3132215,42.1523052],[12.315688,42.1517881],[12.3208069,42.1496814],[12.3239339,42.1481455],[12.3250051,42.1475607],[12.3261429,42.1472687],[12.326691,42.1471741],[12.3304827,42.147244],[12.3450472,42.1534968],[12.3454946,42.153934],[12.3455877,42.1545526],[12.3474831,42.1583512],[12.3498941,42.1625129],[12.3533915,42.1660439],[12.3534788,42.1665378],[12.3541225,42.1666014],[12.3545731,42.1664106],[12.3551525,42.1663947],[12.3556675,42.1662356],[12.3568616,42.1665252],[12.3578776,42.1663152],[12.3593582,42.1662833],[12.3596586,42.1672535],[12.3604311,42.1680805],[12.3606886,42.1685894],[12.3605169,42.1690189],[12.3607744,42.1695437],[12.3615898,42.1699095],[12.3624052,42.1697504],[12.3627262,42.1703125],[12.3651732,42.170975],[12.3664821,42.1705774],[12.3666967,42.1700844],[12.3673405,42.1697027],[12.3679413,42.1697027],[12.3686708,42.1693528],[12.3690571,42.1697663],[12.368585,42.1708],[12.369039,42.1719332],[12.3704089,42.1721893],[12.3710589,42.1722866],[12.3712253,42.1729213],[12.3705618,42.1733545],[12.370476,42.1735095],[12.3704706,42.1738832],[12.3706852,42.1743364],[12.3705725,42.1745432],[12.3701219,42.174738],[12.3695747,42.1747499],[12.369446,42.1749089],[12.3698537,42.1754059],[12.3699234,42.1757756],[12.370374,42.1765687],[12.3709239,42.1769384],[12.3720665,42.1780873],[12.3722006,42.178946],[12.3732091,42.1792879],[12.3732118,42.1795562],[12.3729972,42.1799617],[12.372906,42.1805659],[12.3733352,42.1809674],[12.374333,42.1813331],[12.3749606,42.1818698],[12.3751001,42.1823587],[12.3749231,42.1828874],[12.3751001,42.1834399],[12.3753468,42.1837182],[12.3756526,42.1837818],[12.3762105,42.1838573],[12.3770205,42.1838493],[12.3776643,42.1838175],[12.3776965,42.1840282],[12.3772834,42.1840759],[12.3767148,42.1840839],[12.3763822,42.1842826],[12.3761515,42.1845807],[12.3753576,42.1852127],[12.3747353,42.1855824],[12.373999,42.1862955],[12.3739146,42.1871684],[12.374333,42.1909682],[12.373818,42.1922082],[12.3734103,42.1946882],[12.3715649,42.1958328],[12.3732386,42.1997752],[12.372316,42.2029066],[12.3725131,42.2060184],[12.3717795,42.2060538],[12.3699556,42.2069438],[12.3710321,42.2088024],[12.3708997,42.2093438],[12.3711787,42.2118391],[12.3730241,42.2124112],[12.3748587,42.2127211],[12.3769079,42.2129436],[12.3786674,42.2126734],[12.3798798,42.2124271],[12.3805128,42.2122443],[12.381881,42.2132455],[12.3828409,42.2133966],[12.3836134,42.2146203],[12.3854446,42.2155051],[12.3860381,42.2156056],[12.3863171,42.216567],[12.386868,42.2169816],[12.3869715,42.2179973],[12.3875509,42.218474],[12.3880766,42.2186965],[12.3885916,42.2199996],[12.3897396,42.2208418],[12.3910592,42.2215648],[12.39166,42.2222243],[12.3925398,42.2232333],[12.39269,42.2234716],[12.3945568,42.2241549],[12.3945783,42.2249017],[12.3957043,42.2256603],[12.3957894,42.2258405],[12.3951576,42.2263755],[12.3950933,42.2266933],[12.3965041,42.2277896],[12.3963419,42.2291062],[12.3966723,42.230157],[12.3969271,42.2309844],[12.3971782,42.2312837],[12.3975346,42.2315241],[12.3978872,42.2317539],[12.3979832,42.2318206],[12.3982761,42.2320129],[12.3986013,42.2321599],[12.3991415,42.2324047],[12.3996511,42.2325545],[12.402069,42.2316247],[12.4035431,42.2307666],[12.4035248,42.2305207],[12.4027004,42.2293051],[12.4033238,42.2291704],[12.4044347,42.2288699],[12.4060663,42.2290156],[12.4067636,42.2290544],[12.4082458,42.2291791],[12.4080517,42.2303337],[12.407414,42.2326954],[12.4084098,42.2332135],[12.410062,42.2337378],[12.4102444,42.2342144],[12.4108238,42.234687],[12.4105073,42.2354536],[12.4108452,42.2358865],[12.4112046,42.2363075],[12.4115909,42.2370979],[12.4113978,42.2376181],[12.4118376,42.2380074],[12.4120846,42.2384848],[12.411646,42.2394746],[12.4112555,42.2403412],[12.4102478,42.2408978],[12.4088925,42.2426916],[12.4076748,42.2430908],[12.407977,42.2442265],[12.4055935,42.2474273],[12.4033619,42.2484914],[12.4041558,42.2499687],[12.4061677,42.2516894],[12.4071384,42.2530659],[12.4092413,42.2537806],[12.4112055,42.2559766],[12.4116634,42.2562362],[12.4123432,42.255932],[12.4133826,42.2539156],[12.4152709,42.2526767],[12.4152923,42.2511202],[12.4143696,42.2502943],[12.4126745,42.2497225],[12.4129105,42.2488965],[12.4146915,42.2487854],[12.4150992,42.2484994],[12.4167885,42.2459492],[12.4190045,42.2445125],[12.417442,42.2425457],[12.4175493,42.2418401],[12.4175454,42.2407954],[12.4175668,42.2396834],[12.4179742,42.2384107],[12.418983,42.2377929],[12.4190045,42.2364902],[12.4181033,42.235251],[12.417762,42.2347942],[12.4183608,42.2344567],[12.4195409,42.2344884],[12.4206567,42.2337576],[12.4188543,42.231724],[12.4180604,42.2304212],[12.4179102,42.2297062],[12.4168802,42.229595],[12.4169231,42.2294202],[12.4181033,42.229166],[12.4169875,42.2281332],[12.4164725,42.2266873],[12.4169016,42.2250348],[12.4174595,42.2246376],[12.4174166,42.223859],[12.41776,42.2233982],[12.4193693,42.2225242],[12.4191976,42.2219998],[12.4183822,42.2213483],[12.4179457,42.2207384],[12.4178887,42.2200612],[12.4178458,42.2196718],[12.4182642,42.2194652],[12.4191011,42.2196639],[12.4194578,42.2193856],[12.4199182,42.2185556],[12.4199722,42.2182344],[12.4198199,42.2180032],[12.4188865,42.217461],[12.4183339,42.2173298],[12.4165905,42.2175126],[12.4161345,42.217453],[12.4157322,42.2171193],[12.4155766,42.2166465],[12.4156356,42.2163922],[12.4162847,42.2157645],[12.4168373,42.2153791],[12.4181033,42.2151328],[12.4193033,42.2150729],[12.4197126,42.2153712],[12.42019,42.2153791],[12.4202759,42.215244],[12.4202437,42.2150454],[12.4200291,42.2149143],[12.419439,42.2147951],[12.4192244,42.2145249],[12.4191708,42.2142706],[12.419042,42.2140362],[12.419085,42.2137939],[12.4192459,42.2135873],[12.4191118,42.2134323],[12.4184895,42.2134641],[12.4174113,42.2137303],[12.4159307,42.2139727],[12.4153781,42.2140044],[12.4142194,42.2136191],[12.4141819,42.2134959],[12.4142731,42.2130986],[12.4164939,42.2113782],[12.4170465,42.2111914],[12.4174408,42.2109749],[12.4177197,42.2104643],[12.4180979,42.210212],[12.4181542,42.2100888],[12.4188865,42.2100908],[12.4193478,42.2093319],[12.419895,42.2082034],[12.4200237,42.2070233],[12.4193747,42.2056028],[12.4187685,42.2045716],[12.4188704,42.2037451],[12.4188588,42.203525],[12.4184788,42.2032404],[12.4177594,42.2031697],[12.4167193,42.203002],[12.4157215,42.2023026],[12.4155605,42.2019449],[12.4156464,42.2013965],[12.4155391,42.2006415],[12.4151314,42.2000851],[12.4151314,42.1987499],[12.414949,42.1981776],[12.4147666,42.1978597],[12.4146379,42.1970609],[12.4141229,42.1962263],[12.4142302,42.1957573],[12.4145198,42.1953003],[12.4145306,42.1951175],[12.4141712,42.1947002],[12.4141658,42.1941994],[12.4141551,42.193953],[12.4138761,42.193798],[12.41305,42.1937304],[12.4129159,42.1935555],[12.4128783,42.1930468],[12.4126101,42.1927885],[12.4125082,42.1926891],[12.4124277,42.1924546],[12.4125511,42.1921963],[12.4125189,42.192085],[12.4120951,42.1919538],[12.411961,42.1917511],[12.4120844,42.1915405],[12.4124545,42.1912941],[12.4130661,42.1913815],[12.4133075,42.1913338],[12.4135757,42.1911073],[12.4139888,42.1907217],[12.4144984,42.1907297],[12.4146325,42.1906979],[12.4144877,42.1904515],[12.414375,42.1898433],[12.4140317,42.1895929],[12.4136508,42.1894856],[12.4129642,42.1894061],[12.4125082,42.1891915],[12.4120898,42.1885913],[12.4118001,42.1883767],[12.4115158,42.1878918],[12.4112583,42.1878083],[12.4109364,42.1877884],[12.4107272,42.1876692],[12.4106575,42.1874665],[12.4107057,42.1870332],[12.4116296,42.1846732],[12.4114138,42.1843671],[12.4112958,42.1836228],[12.411092,42.1829858],[12.4111862,42.1824638],[12.4112549,42.1823776],[12.4112442,42.1821391],[12.4123171,42.1813719],[12.4128428,42.1812645],[12.4152949,42.1795771],[12.4162558,42.1798505],[12.4176394,42.1814322],[12.4234128,42.1841801],[12.4243677,42.1826457],[12.4244857,42.1809284],[12.427125,42.1810954],[12.4278927,42.1821096],[12.4289184,42.1831026],[12.4292756,42.1834108],[12.4312166,42.1854446],[12.4320388,42.1870181],[12.4342197,42.1896044],[12.43456,42.1918013],[12.4347847,42.1924378],[12.434574,42.1937445],[12.4346003,42.1950151],[12.4343991,42.1955634],[12.4344098,42.1987586],[12.434724,42.2004742],[12.440021,42.2016199],[12.4453211,42.2027961],[12.4459861,42.2040579],[12.4468343,42.2047299],[12.4482749,42.2047904],[12.449783,42.204387],[12.4534964,42.2039962],[12.4544721,42.204047],[12.4559236,42.2032708],[12.4569608,42.2030243],[12.4575519,42.2028994],[12.4580493,42.2031691],[12.4586981,42.2035293],[12.4627117,42.206429],[12.4629932,42.2066771],[12.4661689,42.2150768],[12.4663505,42.2156836],[12.4663331,42.2170528],[12.4659085,42.2176915],[12.4652965,42.218723],[12.465385,42.2192471],[12.4655037,42.2195901],[12.4727561,42.233665],[12.480301,42.2404955],[12.4846995,42.2423473],[12.4780333,42.2492537],[12.4814304,42.2525946],[12.4852543,42.2622251],[12.4856624,42.2632532],[12.4898761,42.2709992],[12.4902955,42.2708289],[12.4909964,42.2705824],[12.4993603,42.2712411],[12.4994978,42.2712836],[12.4997318,42.2713558],[12.5000424,42.2714634],[12.5004379,42.2715999],[12.5009035,42.2717702],[12.5069414,42.2751333],[12.5062997,42.2761435],[12.5058535,42.2787144],[12.5115484,42.2836184],[12.5169239,42.2882302],[12.5205239,42.2957405],[12.5195763,42.2964604],[12.518945,42.2967904],[12.507866,42.2981343],[12.5065911,42.2981778],[12.5041459,42.2980456],[12.5026004,42.2978587],[12.496306,42.296101],[12.4958653,42.2960108],[12.4956166,42.2959599],[12.4949654,42.2958627],[12.4944949,42.2958245],[12.4943608,42.2958136],[12.4937408,42.2958551],[12.4928525,42.2959272],[12.4927318,42.2959822],[12.490048,42.2972057],[12.4891585,42.2979262],[12.4878714,42.2991765],[12.4823959,42.3050698],[12.4754249,42.3164965],[12.4753055,42.3167387],[12.475453,42.3173105],[12.4757856,42.3177867],[12.4762332,42.3181197],[12.4764973,42.3182063],[12.4774114,42.3184535],[12.4774756,42.3184709],[12.4779491,42.3185989],[12.4786289,42.3186053],[12.479261,42.3185726],[12.4801256,42.3184923],[12.4811035,42.3183095],[12.4834578,42.3183054],[12.4855168,42.3184049],[12.4866156,42.318529],[12.4886204,42.3187606],[12.4894049,42.3188762],[12.4897053,42.3189481],[12.4900478,42.3191898],[12.4902952,42.3193714],[12.4903735,42.3198417],[12.49013,42.3204704],[12.4898705,42.3207319],[12.4891948,42.3214129],[12.4886281,42.3219299],[12.488214,42.3222711],[12.4843536,42.3250494],[12.4836724,42.3253493],[12.482477,42.3258674],[12.4817139,42.3261382],[12.4810992,42.3263234],[12.4803708,42.3263321],[12.4799106,42.3263055],[12.4793962,42.3261231],[12.4788405,42.3260724],[12.4785272,42.3260603],[12.4783191,42.3260522],[12.4773596,42.3260769],[12.4762983,42.3262081],[12.4751745,42.3263908],[12.4738593,42.3267999],[12.471076,42.3278207],[12.4701921,42.3283788],[12.4686571,42.3297309],[12.4675197,42.3311565],[12.4638226,42.3364774],[12.4637844,42.3365551],[12.4631043,42.3380524],[12.4630352,42.3388648],[12.4638942,42.3461864],[12.4642409,42.3464344],[12.4643893,42.3465406],[12.4677827,42.3488015],[12.4688199,42.3489682],[12.4696232,42.3489258],[12.4702324,42.349173],[12.4725965,42.3507446],[12.4741046,42.3518965],[12.4756273,42.3532864],[12.4760747,42.3542723],[12.4763453,42.3553672],[12.4762908,42.3561117],[12.4760496,42.3569789],[12.4758739,42.3574254],[12.4756995,42.3578539],[12.4743712,42.3575858],[12.4742063,42.3575526],[12.4699331,42.3566196],[12.4657354,42.3556347],[12.4645176,42.3554285],[12.4641684,42.3554105],[12.4639119,42.3553972],[12.4619346,42.3559478],[12.455583,42.3584087],[12.455146,42.3650355],[12.4555579,42.3659461],[12.4566539,42.3676643],[12.456322,42.379479],[12.4451464,42.3832734],[12.4447287,42.3833805],[12.4425473,42.383939],[12.4398268,42.3846354],[12.4391875,42.3849247],[12.4382894,42.3862843],[12.437954,42.3868436],[12.4378833,42.3869808],[12.4376335,42.3874656],[12.4374485,42.3878313],[12.4372962,42.3881555],[12.4373401,42.3885144],[12.4374065,42.3886547],[12.4374875,42.3888255],[12.437546,42.3889494],[12.4389738,42.3910991],[12.4397771,42.3919889],[12.4403176,42.3923508],[12.4431545,42.3935667],[12.4429633,42.3960936],[12.4413476,42.3963456],[12.4387989,42.3967431],[12.4446889,42.3988177],[12.4452485,42.399088],[12.4457248,42.3993843],[12.4459139,42.3997163],[12.4460199,42.3998658],[12.4461764,42.4000866],[12.4467092,42.4004712],[12.4470248,42.4004828],[12.4478528,42.4005133],[12.4490266,42.4006221],[12.4499243,42.4008201],[12.4504043,42.4009182],[12.4509478,42.4009559],[12.4515771,42.4010359],[12.4521087,42.4010649],[12.4526531,42.4011746],[12.4537177,42.4014801],[12.4541494,42.4016247],[12.454557,42.401761],[12.4562309,42.4024443],[12.4579352,42.4035544],[12.4582612,42.4039048],[12.4584541,42.4042771],[12.458503,42.4045593],[12.4585472,42.4049632],[12.4586605,42.4069947],[12.4585438,42.4071514],[12.4580387,42.4073287],[12.457548,42.4074651],[12.4573727,42.4076054],[12.4572937,42.4077564],[12.4581536,42.4090181],[12.4592337,42.410237],[12.4596326,42.4105987],[12.4598593,42.4109925],[12.4599003,42.411101],[12.4599686,42.4112819],[12.4601065,42.4117999],[12.4609122,42.4128876],[12.4610259,42.4131048],[12.4610137,42.4133933],[12.4609267,42.4135949],[12.4608692,42.4139965],[12.4608378,42.4144342],[12.4607435,42.4152879],[12.4607899,42.4156602],[12.4606205,42.4159355],[12.4603638,42.4162809],[12.4601237,42.4164997],[12.4598379,42.416675],[12.4592134,42.417045],[12.4586351,42.4172606],[12.458796,42.4173548],[12.4588693,42.417397],[12.4596099,42.4178237],[12.459702,42.4178767],[12.4608822,42.4181652],[12.4625666,42.4182988],[12.4642224,42.4182359],[12.4643076,42.4182326],[12.4648747,42.4183236],[12.4651271,42.4183834],[12.4656175,42.4185847],[12.4661501,42.4189468],[12.4667127,42.4194655],[12.4673201,42.4203971],[12.4674175,42.4209659],[12.4676081,42.4219416],[12.4672209,42.4237632],[12.4670058,42.4242425],[12.4660772,42.4243741],[12.4653797,42.4244673],[12.465041,42.4247297],[12.4648739,42.4249508],[12.4647475,42.4254004],[12.4649569,42.4262224],[12.4649893,42.4266582],[12.4650042,42.4268738],[12.4642975,42.428426],[12.4639053,42.4287935],[12.4636024,42.4290863],[12.4631211,42.4292449],[12.4625578,42.4293475],[12.4621431,42.4294051],[12.4615819,42.4294356],[12.4611467,42.4293812],[12.460531,42.4292782],[12.4598422,42.429173],[12.4591819,42.4289768],[12.4579063,42.4283535],[12.4565777,42.4281461],[12.4559652,42.4279619],[12.4553594,42.4276245],[12.4543046,42.4269405],[12.4531862,42.4260243],[12.4524516,42.4254702],[12.4521123,42.4251832],[12.4515944,42.4247306],[12.4512481,42.4241648],[12.4509022,42.423815],[12.4506521,42.4235614],[12.45057,42.4234704],[12.4503399,42.4232152],[12.4501425,42.422996],[12.4500486,42.4230489],[12.4488678,42.4237143],[12.4475667,42.4243522],[12.4462878,42.4249805],[12.4445515,42.4256631],[12.4424849,42.4260989],[12.4417885,42.4262684],[12.4413548,42.42634],[12.4405581,42.4263552],[12.4394517,42.4264332],[12.4389998,42.4264198],[12.4382272,42.4263079],[12.4360599,42.4255986],[12.4346127,42.4251002],[12.4344715,42.4250515],[12.4343415,42.4250068],[12.4312259,42.4239337],[12.426029,42.422545],[12.4239411,42.4219366],[12.4222694,42.4216039],[12.4206755,42.421584],[12.4189995,42.4218412],[12.4170376,42.4224175],[12.4136502,42.4255981],[12.4129932,42.4269008],[12.4131171,42.4271537],[12.4132857,42.4275],[12.4135233,42.427988],[12.4136725,42.4282312],[12.4149318,42.4290671],[12.415832,42.4297381],[12.4158769,42.4297839],[12.4174575,42.4313959],[12.4176652,42.4316103],[12.4189445,42.4340394],[12.4190884,42.4342962],[12.4192834,42.4351998],[12.4193555,42.4354768],[12.4194316,42.4361769],[12.4194642,42.4364686],[12.4194531,42.4367255],[12.419399,42.4370018],[12.4192856,42.4379056],[12.4192328,42.4381773],[12.419092,42.4388298],[12.4183777,42.4398265],[12.4181544,42.4401293],[12.4175653,42.4409599],[12.4169257,42.4412852],[12.4165195,42.4416395],[12.4161486,42.4417496],[12.4158438,42.4419568],[12.4153948,42.4421953],[12.4149481,42.4422536],[12.414224,42.4423788],[12.4135468,42.4424305],[12.4127744,42.4427867],[12.4127106,42.4428658],[12.4118888,42.4438846],[12.4118574,42.4441602],[12.411698,42.4445836],[12.4115486,42.4448672],[12.41141,42.445101],[12.4114034,42.4453713],[12.4113701,42.4457396],[12.4113817,42.4460068],[12.4117168,42.446384],[12.4119812,42.4465517],[12.4123448,42.446739],[12.4131287,42.4472649],[12.4143466,42.4480029],[12.4146351,42.4481656],[12.414739,42.4482241],[12.4149989,42.4483707],[12.4150698,42.4484269],[12.4153165,42.4486223],[12.4156128,42.4489286],[12.4158633,42.4491328],[12.4158764,42.449416],[12.4158958,42.4498837],[12.4152449,42.4509251],[12.4149587,42.4511904],[12.4146777,42.4514507],[12.4139697,42.4518456],[12.413129,42.4522623],[12.4127475,42.4526249],[12.4127892,42.4529028],[12.4129117,42.4533538],[12.4131016,42.4537714],[12.4132759,42.4540003],[12.4136769,42.4551679],[12.4143355,42.4558191],[12.4153724,42.4567607],[12.416263,42.4572473],[12.4167922,42.4576007],[12.4174095,42.4581766],[12.4178989,42.4584546],[12.4185798,42.4584523],[12.4197978,42.4580287],[12.4212787,42.4575343],[12.4221185,42.4573246],[12.4228525,42.4571541],[12.4236241,42.4570454],[12.42455,42.4568557],[12.4256566,42.4568271],[12.4263748,42.4568416],[12.4272169,42.4568974],[12.4283439,42.4570348],[12.4293484,42.4573784],[12.4298529,42.4576964],[12.4303823,42.4580227],[12.4303206,42.4583127],[12.4302477,42.4586481],[12.4300352,42.4588615],[12.4292668,42.4596409],[12.4279118,42.460645],[12.427472,42.4610679],[12.4268065,42.4615605],[12.4266601,42.4618035],[12.4265904,42.4620712],[12.4265176,42.4623525],[12.4265392,42.4628877],[12.4270156,42.4635667],[12.4275952,42.4643823],[12.4275877,42.4645682],[12.4275836,42.4646708],[12.4275746,42.4649232],[12.4275726,42.4649863],[12.4275655,42.4652117],[12.4275149,42.4653482],[12.4263995,42.4654971],[12.4260298,42.4655457],[12.4245191,42.4655099],[12.423983,42.465715],[12.4235182,42.4661116],[12.4225393,42.4662534],[12.4213513,42.4663114],[12.4194341,42.4664047],[12.4166568,42.4667848],[12.4156276,42.4668695],[12.4151134,42.4668218],[12.4142178,42.4669161],[12.4136134,42.4669836],[12.4132047,42.4670724],[12.4128458,42.4671821],[12.4124409,42.4675633],[12.4124219,42.4678431],[12.4123935,42.4682446],[12.4123756,42.4685153],[12.4126167,42.4696922],[12.4126883,42.4699602],[12.4126408,42.470862],[12.4126286,42.4711415],[12.4126387,42.4715914],[12.4127058,42.4719316],[12.4128913,42.4721422],[12.4134692,42.4728003],[12.4136734,42.4729923],[12.4139956,42.4737381],[12.4141457,42.4740858],[12.4142819,42.4743248],[12.4143388,42.4758449],[12.414356,42.476119],[12.4143085,42.476377],[12.4138024,42.4765632],[12.413015,42.4768613],[12.4126447,42.4769849],[12.4126151,42.4772649],[12.4125846,42.4775585],[12.4125581,42.4778384],[12.4125784,42.4782115],[12.4127411,42.4784362],[12.4128525,42.4787796],[12.4136504,42.479107],[12.4150274,42.4795702],[12.4157624,42.480111],[12.416858,42.4807671],[12.4182009,42.4815104],[12.4188055,42.4816545],[12.4195239,42.4819031],[12.4203094,42.4822398],[12.421168,42.4823403],[12.42165,42.4824789],[12.4226022,42.4829727],[12.4232391,42.4832598],[12.4244912,42.4838977],[12.4255335,42.4848975],[12.4263417,42.4854271],[12.4268605,42.4860149],[12.4274046,42.4863858],[12.427825,42.4869405],[12.4247929,42.4895614],[12.4230925,42.4907289],[12.4230042,42.4910061],[12.4229044,42.4913378],[12.4227876,42.4916069],[12.4226346,42.4919536],[12.4218614,42.4922334],[12.4213899,42.4925266],[12.4212616,42.4927961],[12.4210323,42.4932757],[12.4208633,42.4935238],[12.4205036,42.4944845],[12.420387,42.4947581],[12.4203173,42.4952645],[12.4202872,42.495549],[12.4200855,42.4966896],[12.4196244,42.4971176],[12.4192424,42.4974756],[12.4190452,42.4976526],[12.4187876,42.4977764],[12.4186296,42.4978406],[12.4184231,42.4978468],[12.418235,42.4977444],[12.4161658,42.4962124],[12.4159441,42.4959398],[12.4154456,42.4955135],[12.4149815,42.4950501],[12.4147705,42.4947502],[12.4145099,42.4944609],[12.414226,42.4941497],[12.4139506,42.4937842],[12.413265,42.4939251],[12.4113621,42.4943161],[12.411064,42.4944285],[12.4103576,42.4948638],[12.410285,42.4951361],[12.4102067,42.4954311],[12.4101204,42.4957038],[12.4100903,42.496353],[12.4100974,42.4966229],[12.4103207,42.4981695],[12.4061794,42.4979101],[12.4052709,42.4977481],[12.4048739,42.4978454],[12.4047226,42.498084],[12.4045811,42.4983088],[12.4043603,42.4985],[12.4039268,42.4995349],[12.4038043,42.4997862],[12.4035232,42.4999611],[12.4028443,42.4998102],[12.402718,42.4997284],[12.4024919,42.499582],[12.4017962,42.499094],[12.3998323,42.4980943],[12.3986107,42.4975858],[12.398188,42.4974048],[12.3979734,42.4972626],[12.3977117,42.4971623],[12.3972058,42.4972583],[12.396331,42.4975904],[12.3961305,42.497862],[12.3958981,42.4980355],[12.3951028,42.4991081],[12.3949177,42.4993117],[12.3944049,42.4992954],[12.3918449,42.498759],[12.3901677,42.4981918],[12.3878467,42.4972791],[12.3865097,42.4966298],[12.3861305,42.4959162],[12.3861857,42.4956579],[12.3862788,42.4952274],[12.3863354,42.4949646],[12.386829,42.494869],[12.3876853,42.4948121],[12.3877761,42.4946298],[12.3878979,42.4943826],[12.388776,42.4939289],[12.3888684,42.4932059],[12.3884004,42.4926074],[12.3876905,42.4916289],[12.3877174,42.491367],[12.3878371,42.490373],[12.3877835,42.4901269],[12.3876957,42.4893326],[12.3876677,42.4890813],[12.3865662,42.4889744],[12.3853476,42.4891635],[12.3840636,42.4890709],[12.3828525,42.4887375],[12.3819912,42.4881709],[12.3818308,42.4880653],[12.3810481,42.4875527],[12.3804204,42.4869814],[12.3796594,42.4864051],[12.3786318,42.4863274],[12.3785141,42.486556],[12.37836,42.4868577],[12.3781983,42.4870605],[12.3775909,42.4871055],[12.3767439,42.4867253],[12.3757341,42.4862733],[12.3751214,42.4857241],[12.3750357,42.4855015],[12.3747606,42.4844876],[12.3747779,42.4842575],[12.3748182,42.4839051],[12.3749607,42.4836983],[12.3750093,42.4835573],[12.3749618,42.4831265],[12.374948,42.4828838],[12.374959,42.4826223],[12.3749313,42.4823755],[12.3749246,42.4819255],[12.3749216,42.4816735],[12.3741738,42.4811282],[12.3732134,42.4809269],[12.3722575,42.480811],[12.3706947,42.4804924],[12.3694039,42.4802692],[12.3681482,42.479991],[12.3671204,42.4801068],[12.3663268,42.4802787],[12.3657454,42.4798861],[12.3651796,42.479331],[12.3646165,42.4789286],[12.3643566,42.4787428],[12.3633855,42.4774477],[12.3627199,42.476846],[12.3617477,42.4764378],[12.3606716,42.4761047],[12.3596982,42.4758722],[12.3585141,42.4758079],[12.357869,42.4758268],[12.3566904,42.4754111],[12.3554822,42.4750954],[12.3547831,42.4747737],[12.3539117,42.47443],[12.3526364,42.4739946],[12.3514141,42.4736989],[12.3512254,42.4736533],[12.3505074,42.4744847],[12.3491503,42.4759516],[12.3489751,42.4761143],[12.3481839,42.477173],[12.3480247,42.4773532],[12.3473519,42.4784354],[12.3472096,42.4786332],[12.3468413,42.4794813],[12.3467308,42.4796917],[12.3463907,42.480485],[12.3462861,42.4806907],[12.3462594,42.4810021],[12.3462537,42.4812229],[12.3459028,42.4823272],[12.3458311,42.4825364],[12.3458264,42.4830152],[12.3458258,42.4830915],[12.3458385,42.4833016],[12.345515,42.4840919],[12.3454786,42.484181],[12.3453846,42.4843863],[12.345169,42.4846037],[12.3448327,42.4849427],[12.3437255,42.4854118],[12.3428387,42.4858789],[12.3415478,42.4865379],[12.3404862,42.4871497],[12.3393215,42.4876969],[12.3381798,42.4881759],[12.3378463,42.4883267],[12.3356136,42.4893358],[12.3355027,42.4895371],[12.3351769,42.4901184],[12.334656,42.490075],[12.3345819,42.4901058],[12.3341196,42.4902977],[12.3306663,42.4923837],[12.3294928,42.4929672],[12.328474,42.4932579],[12.3279226,42.4934135],[12.3270988,42.4939102],[12.325856,42.4945946],[12.3253657,42.4947574],[12.3249212,42.4948784],[12.3244712,42.494869],[12.3241773,42.494846],[12.3239066,42.4947908],[12.3233933,42.4945311],[12.3229954,42.4939258],[12.3226702,42.4935301],[12.3223553,42.4931115],[12.3222715,42.4930443],[12.3221381,42.4929372],[12.322063,42.4928769],[12.3214901,42.4926143],[12.3211547,42.4922819],[12.3208788,42.4918466],[12.3208352,42.4917779],[12.3206754,42.4915034],[12.3205175,42.4912919],[12.3192903,42.4906476],[12.3190514,42.4905386],[12.318391,42.490237],[12.3180476,42.4899408],[12.3177544,42.4895574],[12.3176669,42.4894431],[12.3172067,42.4890242],[12.3167744,42.4886855],[12.3164419,42.48838],[12.3158348,42.4881725],[12.3151314,42.4879992],[12.3141505,42.4878836],[12.3127618,42.4878517],[12.3120102,42.487887],[12.3110383,42.4879286],[12.3086911,42.487974],[12.3073315,42.4880313],[12.3061594,42.4879661],[12.3053377,42.4879133],[12.3042186,42.487833],[12.3016846,42.4875639],[12.2998659,42.4875083],[12.2995629,42.4875306],[12.2976122,42.4879019],[12.2958504,42.4884074],[12.293841,42.4892981],[12.2935013,42.4894952],[12.2930979,42.4897292],[12.2925043,42.4901067],[12.2924058,42.4901693],[12.2916667,42.4906393],[12.2914892,42.4907345],[12.2905782,42.491517],[12.2904089,42.491639],[12.2901553,42.4919867],[12.2901114,42.4920468],[12.289718,42.4925863],[12.289597,42.4927293],[12.2895568,42.4929296],[12.2895212,42.4931066],[12.2892389,42.4945135],[12.2895056,42.4947129],[12.2907182,42.4946195],[12.2914402,42.4946978],[12.2922475,42.4947782],[12.2928919,42.4947551],[12.2938325,42.494593],[12.295769,42.4946138],[12.2969003,42.4946083],[12.2973354,42.4947848],[12.2976212,42.4948982],[12.298564,42.4951546],[12.2987735,42.4948424],[12.299618,42.4935935],[12.3006606,42.492726],[12.3029813,42.4913219],[12.307352,42.4973008],[12.3071951,42.4976647],[12.3071538,42.4978963],[12.3071306,42.4980636],[12.3068242,42.4983966],[12.3066345,42.4984336],[12.3054307,42.4986664],[12.3045776,42.4988711],[12.3036517,42.4994427],[12.3034489,42.499534],[12.3005115,42.5036033],[12.2996122,42.5034536],[12.2986259,42.5038017],[12.2983932,42.50402],[12.2982129,42.5041062],[12.298075,42.5043623],[12.2979605,42.5045277],[12.2978708,42.5047734],[12.2977056,42.5054806],[12.2976837,42.5056567],[12.2973335,42.5061846],[12.2972055,42.5063548],[12.2969327,42.506894],[12.2961363,42.5074437],[12.2952736,42.507455],[12.2942712,42.5073983],[12.2934847,42.5072543],[12.2929106,42.5069962],[12.2921747,42.5066572],[12.2914133,42.506526],[12.2907514,42.5066666],[12.2897488,42.5070556],[12.2895241,42.5071656],[12.2894214,42.5073396],[12.2892634,42.5076053],[12.289152,42.5077571],[12.2891259,42.5079424],[12.2891463,42.5081129],[12.2893734,42.5086872],[12.2897906,42.5089679],[12.2902765,42.5093861],[12.2907321,42.5097332],[12.2909751,42.5099423],[12.290895,42.5102283],[12.2903468,42.5106087],[12.2897795,42.510598],[12.2881999,42.5102112],[12.2870143,42.5096509],[12.285548,42.5090762],[12.2847877,42.5085307],[12.2828649,42.5076179],[12.2825926,42.5075447],[12.2824973,42.507759],[12.2825359,42.5079875],[12.2825472,42.5080592],[12.2813766,42.5075795],[12.279227,42.5065021],[12.2791311,42.5065101],[12.2787417,42.5065425],[12.2781838,42.5068422],[12.278121,42.5068763],[12.278009,42.5069398],[12.2777044,42.507203],[12.2776267,42.5073116],[12.2774251,42.5075937],[12.2771312,42.5080388],[12.2763072,42.5084856],[12.2755841,42.5086504],[12.2751527,42.5088762],[12.2749974,42.5089508],[12.274765,42.5092051],[12.274625,42.5095107],[12.2745732,42.5098278],[12.2744965,42.5102978],[12.2744178,42.5122405],[12.2751067,42.5135174],[12.2753289,42.5145199],[12.2753536,42.5146315],[12.275452,42.5153625],[12.2754986,42.5155278],[12.2755041,42.5159958],[12.2761505,42.5161203],[12.2835017,42.5175361],[12.2851376,42.5178448],[12.2871908,42.5182361],[12.2892077,42.518831],[12.2902672,42.5190437],[12.2901364,42.519205],[12.2884776,42.521291],[12.2883599,42.5214351],[12.2882554,42.521525],[12.2877906,42.5219242],[12.2875828,42.5219797],[12.2869959,42.5221181],[12.2849765,42.5223742],[12.2826442,42.5227158],[12.2779304,42.5233731],[12.2775437,42.5233855],[12.27663,42.5234148],[12.2751457,42.5236779],[12.275087,42.5237055],[12.2744501,42.5238779],[12.2743519,42.5240518],[12.2737968,42.5250226],[12.2735956,42.5252855],[12.2733642,42.5255879],[12.27273,42.5260476],[12.2716426,42.526583],[12.2714419,42.5266607],[12.270715,42.5272083],[12.2705375,42.5273214],[12.2691257,42.5293112],[12.2690108,42.529472],[12.2682035,42.5310304],[12.2677153,42.5317827],[12.2671692,42.5326177],[12.266757,42.5334668],[12.2665246,42.5342479],[12.2663614,42.5348828],[12.2662339,42.5356924],[12.2661799,42.5360856],[12.2661986,42.5362426],[12.2666131,42.536528],[12.2677865,42.5366025],[12.2693456,42.536585],[12.2707182,42.5365368],[12.2716822,42.5365768],[12.2724473,42.5366144],[12.2727824,42.5366309],[12.2734224,42.536578],[12.2736977,42.5365552],[12.2734343,42.5382987],[12.2731612,42.5401058],[12.2731486,42.5404024],[12.2735467,42.5405077],[12.2742768,42.5407009],[12.2769261,42.5414018],[12.2775824,42.5416261],[12.2785537,42.5415578],[12.278414,42.5417238],[12.2778529,42.5423882],[12.2777445,42.5425129],[12.2777498,42.5432241],[12.277781,42.5433988],[12.2774832,42.5445869],[12.2774532,42.5455828],[12.2778685,42.5463047],[12.2785797,42.5479817],[12.2788965,42.5486975],[12.2789989,42.5488206],[12.2790171,42.549362],[12.2790679,42.5495254],[12.2788128,42.5508879],[12.278061,42.553174],[12.2776316,42.5540732],[12.2773455,42.5546577],[12.2772543,42.5549175],[12.2764675,42.5553225],[12.2757337,42.5557001],[12.2757382,42.5558551],[12.2758994,42.5580439],[12.2759249,42.5582461],[12.2758527,42.5584154],[12.2751324,42.5597596],[12.2750432,42.5599148],[12.27257,42.5603816],[12.2712247,42.560321],[12.2698892,42.5601297],[12.2669706,42.5595196],[12.266405,42.5594322],[12.2661333,42.5593831],[12.2651985,42.5592145],[12.2647635,42.5592674],[12.2631073,42.5595352],[12.2623585,42.5596647],[12.2621408,42.5597023],[12.2619645,42.5598695],[12.2618163,42.5599908],[12.2617139,42.5602687],[12.2615596,42.5606869],[12.2609007,42.5632044],[12.2608631,42.5633901],[12.2607519,42.5635076],[12.2606376,42.5636486],[12.2604193,42.5637989],[12.2602035,42.5638913],[12.2588643,42.5644645],[12.258725,42.5645133],[12.2586408,42.5645429],[12.2549764,42.5663535],[12.2541743,42.566858],[12.2536945,42.5670608],[12.2534837,42.5671208],[12.2531376,42.5670676],[12.2528755,42.5669039],[12.2515408,42.5667123],[12.2467223,42.5680197],[12.2449999,42.5685801],[12.2422051,42.5694894],[12.2395817,42.5709638],[12.2389052,42.5717213],[12.2387204,42.5720057],[12.238657,42.5721785],[12.2386135,42.5724994],[12.2386578,42.5729574],[12.2397612,42.5747227],[12.2400597,42.5750608],[12.2408544,42.5756146],[12.2420351,42.5764006],[12.2409019,42.5775382],[12.2407838,42.5776607],[12.2393255,42.5781882],[12.2391154,42.5782482],[12.2385883,42.5787313],[12.237927000000001,42.5794164],[12.2367132,42.5813146],[12.235854,42.5833109],[12.2360773,42.5840339],[12.2367089,42.5860691],[12.2373775,42.5870092],[12.238182,42.5870134],[12.238376,42.5870473],[12.2388468,42.5871297],[12.2395555,42.5874158],[12.2400676,42.5878785],[12.2403567,42.588298],[12.2407377,42.5890661],[12.2409645,42.589708],[12.2409525,42.5904466],[12.241087,42.5911453],[12.2422136,42.5917347],[12.2435179,42.592283],[12.2426406,42.5927131],[12.2424075,42.5928142],[12.2398419,42.5947777],[12.2399234,42.595041],[12.2405625,42.596995],[12.2407995,42.597335],[12.2413978,42.597372],[12.242017,42.597296],[12.242064,42.5974972],[12.2422493,42.5977801],[12.2429804,42.597998],[12.2435212,42.5979377],[12.2438667,42.5976668],[12.2440168,42.5974914],[12.2442339,42.5972872],[12.2444043,42.5971203],[12.2449013,42.596674],[12.245171,42.5965813],[12.2452438,42.5965431],[12.2453752,42.596486],[12.245624,42.5964509],[12.2458288,42.596301],[12.2466879,42.5964027],[12.2475562,42.5966932],[12.2474076,42.5968685],[12.2462351,42.5982569],[12.2459604,42.5985844],[12.2459958,42.5987545],[12.2459134,42.5989414],[12.245967,42.5990929],[12.2458983,42.599266],[12.245949,42.5999489],[12.2462601,42.6014933],[12.246262,42.6025558],[12.2459803,42.6033652],[12.2459383,42.6035555],[12.2456975,42.6038909],[12.2454399,42.6042404],[12.2452933,42.6044247],[12.2449695,42.6046725],[12.2443712,42.6050631],[12.2441504,42.6052134],[12.2398516,42.6075368],[12.2391893,42.6070541],[12.2390606,42.6069604],[12.2387297,42.6069738],[12.2384784,42.6070704],[12.2382956,42.6071351],[12.238008,42.6071797],[12.2378219,42.607225],[12.2375829,42.6072003],[12.2373001,42.6072713],[12.2368377,42.6073294],[12.2365797,42.6073367],[12.2360367,42.6075457],[12.2355063,42.6076462],[12.2350878,42.6077436],[12.2335796,42.6081014],[12.2333111,42.608154],[12.2317129,42.6088654],[12.2313119,42.6090658],[12.2310969,42.6092115],[12.2310067,42.6097048],[12.2307318,42.6099286],[12.2305682,42.6100953],[12.2302233,42.6101726],[12.2298519,42.6102686],[12.2294217,42.6103483],[12.2291946,42.610402],[12.2288376,42.6104863],[12.2285735,42.6105208],[12.2284143,42.6106243],[12.2281905,42.6107747],[12.229135,42.6110943],[12.2293264,42.6115261],[12.2292864,42.6116938],[12.2296767,42.6121555],[12.2298122,42.6124038],[12.2302525,42.6133729],[12.2305186,42.6137886],[12.2309496,42.6143437],[12.232108,42.6155266],[12.2332682,42.6164933],[12.2344564,42.6172791],[12.234714,42.6174602],[12.2348874,42.6175821],[12.2349119,42.6176996],[12.2349695,42.6179759],[12.2350794,42.6184636],[12.2352789,42.6190207],[12.2354552,42.619583],[12.2358612,42.62058],[12.2360018,42.6213954],[12.2366537,42.6219623],[12.2373181,42.6223127],[12.2380502,42.6225441],[12.2387113,42.6228315],[12.2389877,42.6229069],[12.2396389,42.6230844],[12.2402746,42.6247322],[12.2406385,42.6256044],[12.2414056,42.6265236],[12.2419433,42.6270306],[12.2429411,42.6277878],[12.2433406,42.6280911],[12.2430737,42.6283492],[12.242823,42.6284959],[12.2427785,42.6288123],[12.2429166,42.629065],[12.2426689,42.6292116],[12.239776,42.6309459],[12.2395319,42.6310878],[12.2389591,42.6315048],[12.2387877,42.6316402],[12.2372315,42.6317292],[12.2365845,42.631671],[12.2363119,42.6316472],[12.2358354,42.6317327],[12.2346,42.6320422],[12.2343341,42.6321173],[12.2341228,42.6322763],[12.2339449,42.6324615],[12.2332385,42.6329181],[12.2330074,42.6330777],[12.2327873,42.633228],[12.2325914,42.6334046],[12.2321331,42.6336337],[12.2318737,42.6337626],[12.231113,42.6340407],[12.2308239,42.6341254],[12.230336,42.6343733],[12.2300889,42.6344883],[12.2297436,42.6345746],[12.2294472,42.6346054],[12.2277216,42.6350188],[12.2274311,42.6350765],[12.2271841,42.6351915],[12.2269113,42.6353118],[12.226558,42.6353623],[12.2262592,42.6354067],[12.2260029,42.6354905],[12.2256523,42.6355487],[12.2258051,42.6356824],[12.2268132,42.6365031],[12.2274447,42.6371741],[12.2279183,42.6376065],[12.2280167,42.638108],[12.2269187,42.6434786],[12.2264499,42.6436854],[12.2252061,42.6440896],[12.224917,42.6441743],[12.2231849,42.645218],[12.2230518,42.6454153],[12.2222234,42.6464246],[12.2220693,42.6466136],[12.2219002,42.6471316],[12.2217431,42.647235],[12.2215827,42.6474196],[12.2211289,42.647608],[12.2176249,42.6488975],[12.2165854,42.6492801],[12.2163015,42.6493781],[12.2157062,42.649764],[12.2154831,42.6499323],[12.2150228,42.6502605],[12.2148329,42.6504369],[12.2130545,42.6521572],[12.2128788,42.6523422],[12.2091169,42.6560135],[12.2089333,42.6561942],[12.2045244,42.6602797],[12.2043355,42.6604606],[12.2038508,42.6606588],[12.2020979,42.6609735],[12.2012839,42.6611583],[12.2010069,42.6612291],[12.2008386,42.6613508],[12.20066,42.661644],[12.2001609,42.6623783],[12.1998919,42.6625164],[12.1979336,42.6635391],[12.1976628,42.6636862],[12.1972806,42.6638455],[12.196536,42.6636007],[12.1951925,42.6633365],[12.1941866,42.6632295],[12.1934697,42.6630334],[12.1925233,42.6628978],[12.1921602,42.6627008],[12.1914236,42.6623882],[12.1911369,42.6622701],[12.1907618,42.662123],[12.1904459,42.6621122],[12.1902659,42.6619603],[12.1894767,42.661941],[12.189073,42.6621329],[12.188901,42.6625772],[12.1883132,42.6634824],[12.1871668,42.664657],[12.1866244,42.6652127],[12.1864106,42.6654726],[12.1857562,42.6662679],[12.1849005,42.666997],[12.1846816,42.6671835],[12.1823774,42.6684052],[12.180825,42.6698024],[12.1785632,42.6700831],[12.1773093,42.6702541],[12.1771902,42.6707303],[12.1770534,42.6707921],[12.1768933,42.6708649],[12.1765705,42.6711755],[12.1764111,42.6715627],[12.1765147,42.67192],[12.1765592,42.6723149],[12.1762221,42.6726574],[12.1759073,42.6727517],[12.1752175,42.6728339],[12.1749036,42.6728696],[12.1746456,42.6730163],[12.1740659,42.6733431],[12.1738367,42.673516],[12.1735429,42.6736457],[12.1732991,42.673801],[12.1722909,42.6739821],[12.1719584,42.6740273],[12.1716927,42.6741112],[12.1713664,42.6741743],[12.1707736,42.6742447],[12.1704437,42.6742809],[12.1699435,42.6744343],[12.1696499,42.6745235],[12.169089,42.6748181],[12.1688516,42.6749778],[12.168125,42.675223],[12.1678223,42.6753305],[12.1675402,42.6754058],[12.167147,42.6758489],[12.1668436,42.6759563],[12.1665898,42.6760489],[12.1663083,42.6761828],[12.1657679,42.6763868],[12.1654816,42.6765163],[12.1652363,42.6766266],[12.1650017,42.6767817],[12.1638543,42.6768224],[12.1635217,42.6768361],[12.1629405,42.6769557],[12.1626097,42.6770054],[12.1619658,42.6770007],[12.1616671,42.6769459],[12.1610116,42.67691],[12.1607883,42.6763264],[12.1604886,42.6757268],[12.1600542,42.6753664],[12.1599424,42.6752737],[12.1593352,42.6748943],[12.1591483,42.6745482],[12.1589528,42.6740764],[12.1585735,42.6735601],[12.1582427,42.673083],[12.1579575,42.6727532],[12.1572524,42.6723225],[12.1566679,42.6718794],[12.1554424,42.671535],[12.1544793,42.6713274],[12.1539007,42.6712398],[12.1534715,42.6711841],[12.1521642,42.6704412],[12.1516843,42.6696531],[12.1510831,42.6691068],[12.1506338,42.6689076],[12.1501207,42.6684265],[12.1494514,42.6679947],[12.1488965,42.6676228],[12.1488563,42.6673853],[12.1485367,42.667385],[12.1484316,42.6667531],[12.1486127,42.6663569],[12.1483929,42.6662139],[12.148729,42.6657725],[12.1490253,42.6653726],[12.1490881,42.6649252],[12.1491821,42.6646119],[12.1493137,42.6643337],[12.149347,42.6640131],[12.1493382,42.6636127],[12.149488,42.6634375],[12.1494883,42.6632168],[12.1494511,42.6629793],[12.1494532,42.6627631],[12.1495485,42.6624768],[12.1492858,42.6621059],[12.1489894,42.6617944],[12.1488646,42.661271],[12.1487065,42.6610097],[12.1484775,42.660854],[12.1481781,42.6607226],[12.1478102,42.6604446],[12.1478627,42.6600335],[12.1474777,42.6599135],[12.1473786,42.6596281],[12.1470345,42.6593359],[12.1467388,42.6592945],[12.1462086,42.6589398],[12.1457851,42.65892],[12.1450674,42.6585841],[12.1447145,42.6583597],[12.1443784,42.6582247],[12.144084,42.6583005],[12.1438912,42.6581661],[12.1423057,42.6573723],[12.1416442,42.6570618],[12.1410573,42.6567943],[12.1407746,42.6563008],[12.1396469,42.6569963],[12.1394383,42.6571269],[12.1392993,42.6571574],[12.1388443,42.6573683],[12.1385253,42.6578182],[12.1382845,42.6579419],[12.1376863,42.6581608],[12.1367585,42.6582538],[12.136464,42.6582348],[12.1355876,42.6583489],[12.1352872,42.6583797],[12.1345322,42.6584544],[12.1342304,42.6584716],[12.133789,42.6584883],[12.1336424,42.6587263],[12.133453,42.6588576],[12.1332064,42.659049],[12.1331203,42.659263],[12.1323633,42.6615573],[12.1323269,42.6616664],[12.1320992,42.661506],[12.13196,42.6614063],[12.1315735,42.6609981],[12.1309371,42.6607319],[12.1303611,42.660437],[12.1299833,42.6599431],[12.1295875,42.659121],[12.1289911,42.6586781],[12.1282679,42.6583827],[12.128098,42.6581578],[12.128174,42.657728],[12.1284547,42.6572431],[12.1281472,42.6569498],[12.1270565,42.6561512],[12.1261834,42.6547974],[12.1260268,42.6538787],[12.1260108,42.6530867],[12.1258017,42.6525522],[12.1255793,42.6517794],[12.1256266,42.6512783],[12.1257688,42.6509368],[12.1257065,42.6504388],[12.1255454,42.650146],[12.1253469,42.6498497],[12.1247735,42.6495907],[12.1243361,42.6493955],[12.1240622,42.6492859],[12.1238258,42.6494365],[12.1236532,42.6495673],[12.1233406,42.6496433],[12.1221926,42.6496611],[12.1215136,42.6497427],[12.1212387,42.6497187],[12.1208502,42.6497248],[12.12057,42.6497459],[12.119791,42.6497987],[12.1195439,42.6498234],[12.1187786,42.6501775],[12.1185561,42.6503006],[12.1178503,42.6505495],[12.1177037,42.6506976],[12.1175357,42.6507886],[12.117415,42.650854],[12.1171998,42.6509724],[12.1170658,42.6517234],[12.1167827,42.6521453],[12.116726,42.6525206],[12.1163739,42.6527373],[12.1162382,42.6528895],[12.1158423,42.6530849],[12.1156128,42.6532667],[12.1153255,42.6533151],[12.114986,42.6535855],[12.1146469,42.6541395],[12.1141701,42.6546072],[12.1141661,42.6550305],[12.1141211,42.6553514],[12.113815,42.6558324],[12.1132773,42.6563333],[12.1131968,42.6566596],[12.1129773,42.6567376],[12.1128486,42.6569843],[12.113315,42.6572867],[12.1135074,42.6574751],[12.1136977,42.657605],[12.1137317,42.6577977],[12.1134851,42.6579439],[12.1132202,42.6580142],[12.1129812,42.6581287],[12.1123345,42.6582634],[12.1120488,42.6583297],[12.1102491,42.6586622],[12.1099537,42.6587018],[12.1096816,42.6593755],[12.1088852,42.660194],[12.1086452,42.6602591],[12.1084125,42.660378],[12.1081158,42.6608047],[12.1074158,42.6626564],[12.1068156,42.6642439],[12.106664,42.6646426],[12.1041698,42.6635381],[12.1027306,42.6629089],[12.1023875,42.6626753],[12.101456,42.6621239],[12.1010727,42.6617783],[12.1006714,42.6613795],[12.100567,42.6612551],[12.1002135,42.6607375],[12.0999135,42.6604316],[12.0997034,42.66025],[12.0996063,42.6601936],[12.0991061,42.659919],[12.0985242,42.6595026],[12.0979128,42.6592129],[12.0974511,42.6585141],[12.097189,42.658134],[12.0968835,42.6576335],[12.0966363,42.657307],[12.0963212,42.657104],[12.0958745,42.6567063],[12.0953895,42.6562602],[12.0945086,42.6554872],[12.0938675,42.6555045],[12.0935855,42.6555526],[12.0931844,42.6555815],[12.0928926,42.6556029],[12.0923265,42.6554876],[12.0918972,42.6554857],[12.0916197,42.6555597],[12.090898,42.6556478],[12.0902176,42.6556256],[12.0891924,42.6555542],[12.088444,42.6558086],[12.088206,42.655914],[12.0874732,42.6560508],[12.0871897,42.6560225],[12.0863497,42.6559956],[12.0860654,42.6559673],[12.0850735,42.6557374],[12.0848251,42.6556315],[12.0840571,42.6556117],[12.0824215,42.6556558],[12.0813673,42.6556932],[12.0810766,42.6556875],[12.080232,42.6556922],[12.0799407,42.655691],[12.0793306,42.6555184],[12.0788227,42.6556086],[12.0785545,42.6556743],[12.0770779,42.6560202],[12.0759876,42.6564052],[12.0756325,42.6564417],[12.075346,42.6564764],[12.075023,42.6565121],[12.0744751,42.6565809],[12.0741915,42.656629],[12.0737154,42.6566703],[12.0730552,42.6563759],[12.0721422,42.6554414],[12.0715203,42.6549494],[12.0713869,42.6547188],[12.0711371,42.6543518],[12.0708487,42.6543641],[12.0705232,42.6543503],[12.0702805,42.6542668],[12.0696686,42.6541346],[12.0694646,42.6540185],[12.0688106,42.6537884],[12.0681611,42.6535582],[12.0676983,42.6533725],[12.0675094,42.6532515],[12.0672311,42.6531742],[12.0670699,42.6530427],[12.0666659,42.6528734],[12.0662218,42.6524171],[12.065936,42.6524203],[12.0655225,42.6522738],[12.065303,42.6521986],[12.0643701,42.6522191],[12.0638702,42.6519758],[12.0633422,42.6520755],[12.0630794,42.6521591],[12.0624202,42.6522578],[12.0621349,42.6522699],[12.0616599,42.6523006],[12.0610807,42.6523206],[12.0608995,42.6521093],[12.0606145,42.6521125],[12.059668,42.6520117],[12.0593951,42.651965],[12.0588938,42.6519108],[12.0586134,42.6518823],[12.0583123,42.6518678],[12.0580639,42.6517935],[12.05786,42.6517719],[12.0575322,42.6513664],[12.0568752,42.6512309],[12.0566256,42.6511475],[12.0562427,42.6510812],[12.0560077,42.6509839],[12.0555118,42.6508531],[12.0553537,42.6507223],[12.0550554,42.6506087],[12.0546042,42.6501299],[12.0540586,42.6496987],[12.0538282,42.6494617],[12.0534741,42.6494712],[12.0529265,42.649981],[12.0524551,42.6503179],[12.0519317,42.650575],[12.0517091,42.6507925],[12.05104,42.6503151],[12.0506792,42.6499374],[12.0504375,42.6498583],[12.0499473,42.6497599],[12.0494406,42.6496778],[12.048618,42.6495061],[12.0481087,42.6494417],[12.047555,42.6494083],[12.04728,42.6493661],[12.0469009,42.6493312],[12.0466218,42.6493296],[12.0458677,42.6493272],[12.0455911,42.6492985],[12.0446518,42.64922],[12.0443719,42.6492004],[12.0424763,42.6490842],[12.0421943,42.6490872],[12.0412315,42.6490723],[12.0409517,42.6490572],[12.040363,42.6490233],[12.0400768,42.6489994],[12.0397255,42.6489727],[12.0395045,42.6488795],[12.0392848,42.6488314],[12.0390944,42.6487103],[12.0385279,42.6484733],[12.0383652,42.6483426],[12.0376625,42.6479379],[12.0368494,42.6474913],[12.0358072,42.6464249],[12.0349811,42.645929],[12.0344286,42.6456195],[12.034265,42.6454843],[12.033842,42.6453784],[12.0335873,42.6453132],[12.03314,42.6448928],[12.0326055,42.6443263],[12.0324512,42.6441638],[12.032261,42.6440608],[12.0316801,42.643842],[12.0314788,42.6437303],[12.0308278,42.6434639],[12.0305996,42.6433799],[12.0302722,42.6432625],[12.0299992,42.6432412],[12.0299389,42.6497206],[12.0299336,42.6502905],[12.0297918,42.6504158],[12.029211,42.6504449],[12.0263602,42.6507137],[12.0261471,42.6508139],[12.0247113,42.6514867],[12.0210255,42.6541863],[12.0183322,42.6557762],[12.0138476,42.6584231],[12.0075897,42.6621175],[12.0070818,42.662452],[12.0052414,42.6632642],[12.0037087,42.6638492],[12.0023942,42.664406],[12.000394,42.6651833],[11.9991393,42.6657159],[11.996059,42.6673769],[11.995572,42.6676373],[11.9887191,42.6707105],[11.9779797,42.6755251],[11.9768905,42.6757471],[11.9763328,42.6758846],[11.9725627,42.676814],[11.9685194,42.6774998],[11.9668,42.6777573],[11.966411,42.6778156],[11.9651263,42.6780019],[11.964012,42.6781793],[11.9627176,42.67842],[11.9612853,42.6788218],[11.9599346,42.6791628],[11.9587862,42.6794267],[11.9572981,42.6796677],[11.9557156,42.6799923],[11.9546626,42.680177],[11.953366,42.6803726],[11.9523063,42.6806316],[11.9520869,42.68069],[11.9511473,42.6807598],[11.9501213,42.6810509],[11.9497974,42.681312],[11.9496239,42.6813581],[11.9494032,42.6814151],[11.9490518,42.6815028],[11.9486447,42.6816073],[11.9483393,42.6816805],[11.9479233,42.6817851],[11.9473579,42.681929],[11.9470476,42.6821962],[11.9463617,42.6822935],[11.9456621,42.6823876],[11.9448108,42.6824981],[11.9439373,42.6826178],[11.9423934,42.683023],[11.9413298,42.6833009],[11.9410581,42.6836657],[11.9410609,42.6839093],[11.9410693,42.6840853],[11.9412427,42.6845373],[11.941533,42.6847777],[11.9414525,42.6851816],[11.9415014,42.6852188],[11.9416764,42.6853515],[11.942134,42.6857044],[11.9423687,42.685991],[11.9436502,42.6869891],[11.9438508,42.687182],[11.9446175,42.6876035],[11.9446471,42.6885527],[11.9446855,42.6887202],[11.9448615,42.6894882],[11.9450022,42.6902164],[11.9453679,42.6906872],[11.9454975,42.690854],[11.9456479,42.6914534],[11.9460847,42.6921312],[11.9461616,42.6922506],[11.9464396,42.6924011],[11.9471613,42.6927877],[11.9473301,42.6929859],[11.9477826,42.6935191],[11.9480311,42.694143],[11.947912,42.6944972],[11.9481401,42.6949145],[11.9487176,42.6955435],[11.9487565,42.6959338],[11.9487642,42.6960105],[11.9482568,42.6961226],[11.9466419,42.696722],[11.9459887,42.6969645],[11.9454024,42.6971944],[11.9440925,42.6976706],[11.9430454,42.6979857],[11.9421301,42.6982343],[11.9410952,42.6985671],[11.9405013,42.6987243],[11.9400221,42.6988513],[11.9389259,42.6991631],[11.93847,42.6991994],[11.9377576,42.6992561],[11.9358957,42.6993819],[11.9358235,42.6993868],[11.935379,42.6995557],[11.9346831,42.6998302],[11.9336236,42.7001275],[11.9325399,42.7004479],[11.9316366,42.7009844],[11.9310167,42.7015765],[11.930405,42.7020694],[11.9296121,42.7026345],[11.9289064,42.7029452],[11.9280259,42.7031568],[11.9270014,42.7034532],[11.9265431,42.7035729],[11.9262456,42.7039167],[11.9262025,42.7038608],[11.9261128,42.7043043],[11.9262928,42.7047409],[11.9266327,42.7052365],[11.9268989,42.7057204],[11.9275669,42.707009],[11.9280544,42.7077844],[11.9284169,42.7079642],[11.9287963,42.7084858],[11.9308236,42.7114459],[11.9310811,42.7119706],[11.930525,42.712381],[11.9301707,42.7126197],[11.9301005,42.7129457],[11.9304461,42.713315],[11.9305693,42.7136135],[11.9309565,42.7140403],[11.9311655,42.7143636],[11.9315464,42.7144619],[11.9320812,42.7145962],[11.9322299,42.7146335],[11.9325926,42.7147187],[11.9330121,42.7150862],[11.9331218,42.71534],[11.9334707,42.7156822],[11.93799,42.7173087],[11.9383362,42.7174304],[11.9392263,42.7178484],[11.9394282,42.7179606],[11.9407831,42.7182544],[11.9411645,42.7183302],[11.9412217,42.7187654],[11.9434285,42.7190148],[11.9435515,42.7192098],[11.9437713,42.7197579],[11.9439276,42.7204652],[11.9441825,42.7212556],[11.9443529,42.7220166],[11.9446103,42.7225367],[11.9449732,42.7233018],[11.9453624,42.7240256],[11.9455905,42.724587],[11.9444281,42.724887],[11.9448231,42.7250975],[11.9450223,42.7251599],[11.9453818,42.7252902],[11.9456671,42.725382],[11.946002,42.7255399],[11.9462334,42.725606],[11.9465873,42.7257455],[11.946996,42.7261221],[11.9472408,42.7261023],[11.9473908,42.7262065],[11.9491459,42.7274039],[11.9493292,42.7273406],[11.9520878,42.7265987],[11.9527218,42.7263662],[11.9538868,42.7259355],[11.9555999,42.7257471],[11.956549,42.7256731],[11.9569121,42.7256052],[11.957968,42.7254158],[11.9583381,42.7255278],[11.9587775,42.725665],[11.9591207,42.7258047],[11.9595538,42.7261942],[11.9603075,42.7268906],[11.9606065,42.7268694],[11.9609674,42.726788],[11.9615022,42.7267651],[11.9618878,42.7267507],[11.9622339,42.7266787],[11.9625432,42.7266166],[11.9629343,42.7266875],[11.9630917,42.7268816],[11.9630649,42.7270894],[11.9627903,42.7274612],[11.9625763,42.7276153],[11.9621012,42.7278662],[11.9615098,42.7280301],[11.9605866,42.728153],[11.9595692,42.7283324],[11.9591147,42.7285017],[11.9589851,42.7286176],[11.9589498,42.7288707],[11.9590673,42.7290612],[11.9593926,42.7294805],[11.9607055,42.7306172],[11.9621872,42.7316909],[11.962089,42.7319545],[11.9615609,42.7329182],[11.9617647,42.7330795],[11.9622674,42.7328774],[11.9631701,42.7326784],[11.9636681,42.732715],[11.9640509,42.7327051],[11.9649115,42.7329349],[11.9652951,42.7330556],[11.9676721,42.7336423],[11.9679752,42.733819],[11.9684336,42.7340007],[11.9687896,42.7341355],[11.9688471,42.7343322],[11.9687261,42.7345784],[11.9669774,42.7362525],[11.9665606,42.7366516],[11.9668434,42.7367208],[11.9672953,42.7369612],[11.9675936,42.7371471],[11.9681779,42.737312],[11.9684403,42.7375168],[11.9689067,42.7377388],[11.9692403,42.7378967],[11.9699495,42.7387212],[11.9704379,42.7390732],[11.9709929,42.7393762],[11.971083,42.7394247],[11.9726059,42.7403306],[11.9728275,42.740622],[11.9726312,42.7408747],[11.9723957,42.7412995],[11.9721807,42.7416563],[11.972006,42.742075],[11.9722266,42.7426006],[11.9724382,42.7429372],[11.9725062,42.7433227],[11.9724984,42.7439262],[11.9728114,42.74485],[11.9732584,42.7452886],[11.9730864,42.7457478],[11.9726922,42.7461903],[11.9730814,42.7464098],[11.9735822,42.746901],[11.9739204,42.7475855],[11.9740678,42.7483696],[11.9740793,42.7488645],[11.9741168,42.7493768],[11.9745138,42.7499338],[11.975144,42.750147],[11.9754871,42.7503272],[11.9758906,42.7504608],[11.9766749,42.750796],[11.9769986,42.7509857],[11.9783016,42.7514696],[11.9786558,42.7516269],[11.978921,42.7516785],[11.9792652,42.7518497],[11.9799804,42.7522092],[11.9802773,42.7524131],[11.9811254,42.7526927],[11.9814794,42.7528455],[11.9818706,42.7535827],[11.9819886,42.7540028],[11.9819442,42.7548459],[11.9818509,42.7552085],[11.9812815,42.7558041],[11.9807046,42.7565125],[11.9804381,42.7568166],[11.9805101,42.757283],[11.9806541,42.7582472],[11.9806169,42.759],[11.9803826,42.7592087],[11.9799948,42.7592774],[11.9797135,42.7592396],[11.9791192,42.759093],[11.9786987,42.7590049],[11.9783733,42.759099],[11.9784203,42.7595705],[11.9785319,42.7600988],[11.9787033,42.7608687],[11.9788504,42.7616438],[11.9793805,42.7625034],[11.9794818,42.7645853],[11.9770061,42.7649469],[11.9738014,42.7659082],[11.9718116,42.766194],[11.9683331,42.7665589],[11.9664368,42.7667882],[11.9653926,42.7671394],[11.9638326,42.7680172],[11.9624824,42.7689346],[11.961791,42.7697809],[11.9610916,42.7704924],[11.9605907,42.7712347],[11.9602342,42.7719913],[11.9596027,42.7725569],[11.9584416,42.7730867],[11.9574446,42.7732979],[11.9571831,42.7733533],[11.9567207,42.7733473],[11.9561878,42.7733385],[11.9557436,42.773395],[11.9549909,42.7733244],[11.9543946,42.7732993],[11.9537388,42.7732757],[11.9532728,42.7732112],[11.9520872,42.7736605],[11.9506445,42.7749043],[11.9496252,42.7760742],[11.9488399,42.777409],[11.9480827,42.7775366],[11.9476185,42.777445],[11.9471806,42.7773617],[11.9467555,42.7772106],[11.9459643,42.7769744],[11.945537,42.7768233],[11.944634,42.7765494],[11.9442211,42.7763799],[11.9437935,42.7762559],[11.9433337,42.7761776],[11.9426466,42.7760422],[11.9421811,42.7759552],[11.9412245,42.7761463],[11.9401165,42.776526],[11.9384106,42.7779475],[11.937547,42.7788116],[11.9368817,42.7789772],[11.9364658,42.7788078],[11.9361956,42.7787337],[11.935464,42.7782212],[11.9350197,42.778084],[11.9346493,42.77799],[11.9341896,42.7778802],[11.9331467,42.778024],[11.9313076,42.7784403],[11.9298471,42.779108],[11.9285203,42.7800019],[11.927425,42.7809169],[11.9270148,42.7818077],[11.9269697,42.7819055],[11.926561,42.7828795],[11.92532,42.7837981],[11.9246609,42.7845984],[11.9244724,42.785283],[11.9252277,42.7862992],[11.9255594,42.7879205],[11.9254266,42.7895627],[11.924803,42.7909068],[11.9241048,42.7913974],[11.9229677,42.7921738],[11.9214272,42.79378],[11.920361,42.794523],[11.9202304,42.7951432],[11.9202243,42.7957916],[11.9199136,42.7964974],[11.9195707,42.7972806],[11.9195214,42.7980697],[11.9194833,42.7991107],[11.9192996,42.8001599],[11.9191976,42.801144],[11.918707,42.8019083],[11.9183836,42.8028801],[11.9181077,42.8035309],[11.9176029,42.8044983],[11.9171311,42.8067524],[11.9168316,42.807665],[11.916406,42.807991],[11.9158339,42.8083252],[11.9153366,42.8086891],[11.914759,42.8091495],[11.9142119,42.8094786],[11.9138135,42.8098669],[11.9132872,42.8103936],[11.9130008,42.8105449],[11.9119474,42.8118459],[11.9112606,42.8126017],[11.9105961,42.8130373],[11.9100598,42.8136137],[11.9096349,42.8142504],[11.909274,42.8148989],[11.9087735,42.8154428],[11.908421,42.8157669],[11.9083487,42.8159013],[11.9081728,42.816228],[11.9079205,42.8168467],[11.9077543,42.8180305],[11.907477,42.8191901],[11.9074135,42.8199391],[11.9072113,42.8206151],[11.9068387,42.8215385],[11.9066306,42.8226108],[11.9064155,42.823242],[11.9061497,42.8238656],[11.9059503,42.8243254],[11.9058525,42.8248816],[11.9058036,42.8250458],[11.9054397,42.8262698],[11.9051285,42.8272322],[11.9049256,42.8278946],[11.9050743,42.828179],[11.9051708,42.8286898],[11.9056266,42.8295562],[11.9061705,42.8302132],[11.9063804,42.8307931],[11.9064047,42.8313283],[11.9060867,42.8321287],[11.9055759,42.8325019],[11.9051116,42.8324011],[11.90394,42.8321517],[11.9036384,42.8320648],[11.9023635,42.8317145],[11.9020972,42.8316447],[11.9018284,42.8315705],[11.9012562,42.83163],[11.9009507,42.8316378],[11.9005601,42.8316747],[11.9002723,42.8317991],[11.8998404,42.8319631],[11.8996261,42.8321081],[11.8994246,42.8322617],[11.8991399,42.8324536],[11.8987771,42.8327869],[11.8981975,42.8332293],[11.8977947,42.8335277],[11.8973113,42.8336389],[11.8962011,42.8340497],[11.8955,42.8341665],[11.8947457,42.8348152],[11.8941819,42.8348388],[11.8935596,42.8347912],[11.8926991,42.8346216],[11.8919395,42.8342743],[11.8910549,42.8341012],[11.8902331,42.8341641],[11.8894993,42.8343762],[11.88901,42.8347621],[11.8881496,42.8350846],[11.8872575,42.835336],[11.8856728,42.835657],[11.884343,42.8358635],[11.8826264,42.8358883],[11.8767674,42.8360832],[11.8741503,42.8363348],[11.8736061,42.8361418],[11.8728599,42.8356963],[11.872273,42.8351161],[11.8713944,42.8348234],[11.8706739,42.8346267],[11.8694476,42.8344796],[11.8684407,42.8345882],[11.8679493,42.8347868],[11.867414,42.8352558],[11.8648952,42.8355021],[11.8635172,42.8355862],[11.8622384,42.8355331],[11.8617786,42.8356582],[11.8610609,42.8356963],[11.8604295,42.8356649],[11.859871,42.8357227],[11.8588191,42.8356916],[11.858957,42.8358926],[11.8588845,42.8360445],[11.8587198,42.836122],[11.8584227,42.8362156],[11.858281,42.8363745],[11.8581416,42.8367034],[11.8579264,42.8370417],[11.8575386,42.8373512],[11.8572918,42.8376821],[11.857339,42.8378308],[11.8574968,42.8380097],[11.8573916,42.8382949],[11.8571325,42.8384751],[11.8568562,42.8385384],[11.8564158,42.8386253],[11.8562624,42.8385227],[11.8554835,42.8385455],[11.8545072,42.8388456],[11.8541091,42.8388917],[11.8505032,42.8397873],[11.8502682,42.8397484],[11.8489587,42.8401409],[11.8485092,42.8400804],[11.848131,42.8398054],[11.847306,42.8387658],[11.8464262,42.836666],[11.8447949,42.8356987],[11.8454634,42.834364],[11.8454477,42.833888],[11.8453984,42.8336382],[11.8447863,42.8333785],[11.844141,42.8329446],[11.8435831,42.8328352],[11.8426078,42.8325508],[11.841897,42.8322514],[11.8415124,42.8318966],[11.8409524,42.8312825],[11.840719,42.8310386],[11.8402485,42.8309225],[11.8397969,42.8308604],[11.8391172,42.8309599],[11.8382718,42.8312825],[11.8378973,42.8312463],[11.8376173,42.8310807],[11.8374467,42.830742],[11.8368105,42.8297714],[11.8353708,42.8291961],[11.8346974,42.8283795],[11.8343788,42.8280738],[11.8338182,42.8278468],[11.8327979,42.8270131],[11.8319755,42.82691],[11.8311505,42.8264037],[11.8302273,42.8257128],[11.8294081,42.8256046],[11.8286898,42.8255484],[11.8282505,42.8255791],[11.8277672,42.8255566],[11.8271363,42.8256597],[11.8266299,42.8256668],[11.8261267,42.8257191],[11.8257405,42.8259493],[11.8253006,42.8259328],[11.8246043,42.8258371],[11.8237771,42.8259575],[11.8233587,42.8258792],[11.8225626,42.8257742],[11.8203358,42.8249649],[11.8197114,42.8245703],[11.8195607,42.8245152],[11.8191401,42.8244872],[11.8182822,42.8242224],[11.816954,42.824075],[11.8154471,42.8237632],[11.8145721,42.8233525],[11.8136976,42.8226717],[11.8131439,42.8215215],[11.8131584,42.8207647],[11.8131581,42.8199476],[11.8132964,42.8194917],[11.8136148,42.8189616],[11.814084,42.8179889],[11.8139739,42.81744],[11.8140426,42.816799],[11.8145957,42.8160583],[11.814873,42.8154212],[11.8144131,42.8141809],[11.8138118,42.813338],[11.8135427,42.8127976],[11.8137202,42.8121179],[11.8133087,42.8108741],[11.8126877,42.8098471],[11.8115298,42.8085857],[11.8108322,42.8077564],[11.8107961,42.8075116],[11.810761,42.8072719],[11.8109063,42.8069186],[11.8113534,42.8057716],[11.8115472,42.8051906],[11.8112438,42.8041625],[11.8109185,42.8037315],[11.8108732,42.8032712],[11.8106977,42.8026362],[11.8108889,42.8022758],[11.8113412,42.8018527],[11.8115663,42.8017099],[11.8112999,42.8010839],[11.8113845,42.8002511],[11.8114144,42.7995454],[11.8114317,42.7991356],[11.8108498,42.7984273],[11.8103397,42.7979716],[11.809683,42.7969703],[11.8078483,42.7959153],[11.8076743,42.7958152],[11.8071999,42.795262],[11.8068483,42.794854],[11.8065776,42.794926],[11.8063147,42.7949999],[11.806045,42.7950605],[11.8048436,42.7956753],[11.8044361,42.796678],[11.8034957,42.7977163],[11.8034051,42.7977886],[11.8027731,42.7982932],[11.8025844,42.7984455],[11.8026574,42.7989795],[11.8028479,42.7997357],[11.8030011,42.8009701],[11.8032856,42.8011981],[11.8036207,42.8014726],[11.804028,42.8018273],[11.8040453,42.8022186],[11.8034583,42.8027665],[11.8030672,42.8033119],[11.8026962,42.8040503],[11.8023098,42.8044717],[11.79938,42.8051352],[11.7990902,42.8052011],[11.798266,42.8050592],[11.7978087,42.8051379],[11.7970602,42.8053701],[11.7968137,42.8054946],[11.7966872,42.8055458],[11.7957892,42.8059819],[11.7955455,42.8060937],[11.7950423,42.8063644],[11.7948192,42.8064963],[11.7945976,42.8081091],[11.7931936,42.8098519],[11.7932919,42.8112205],[11.7925781,42.8116566],[11.7914672,42.8121092],[11.791218,42.8121941],[11.7906779,42.8125224],[11.7894984,42.8130914],[11.7892575,42.8132188],[11.7877778,42.8141058],[11.787414,42.8145987],[11.7870745,42.8152013],[11.7869007,42.8156895],[11.7863949,42.8162893],[11.7859004,42.8164792],[11.784985,42.8167514],[11.7847064,42.8168144],[11.7825875,42.8176854],[11.7818016,42.8177608],[11.7815163,42.8177159],[11.7809676,42.8177788],[11.7806869,42.8178034],[11.7805461,42.8178325],[11.7802724,42.817916],[11.7799836,42.8180053],[11.7785927,42.818114],[11.7784787,42.8181229],[11.7781989,42.8181378],[11.7777482,42.8182082],[11.7774799,42.8182597],[11.777169,42.8183933],[11.7769133,42.8190839],[11.7767358,42.8197635],[11.775874,42.8206736],[11.7752598,42.8208281],[11.7749734,42.8208992],[11.7742431,42.8210689],[11.7731271,42.8208596],[11.7721281,42.8201296],[11.7706771,42.8203674],[11.769067,42.820188],[11.7685009,42.8199586],[11.7681756,42.8193812],[11.768253,42.8188885],[11.7686755,42.8179328],[11.7689391,42.816425],[11.7685655,42.8154097],[11.7659275,42.8132179],[11.7644327,42.8117255],[11.7631136,42.8109335],[11.7611193,42.8100384],[11.7592893,42.8090133],[11.7584518,42.8082793],[11.7580999,42.8078016],[11.7574804,42.8062092],[11.7564774,42.8053284],[11.7556583,42.8044995],[11.7533479,42.8022364],[11.7529944,42.8015755],[11.7529237,42.801443],[11.7525062,42.7996971],[11.7519692,42.7983256],[11.751431,42.796213],[11.749967,42.7904633],[11.7496961,42.7898738],[11.749321,42.7890583],[11.7489655,42.7885769],[11.7486841,42.7881957],[11.7481755,42.7877324],[11.7460176,42.7857594],[11.7465696,42.7855135],[11.7474091,42.7850769],[11.7482296,42.7845124],[11.7488345,42.7841534],[11.7494247,42.7838174],[11.749841,42.7836071],[11.7503679,42.7833513],[11.7510157,42.7830206],[11.7516229,42.7826548],[11.7521284,42.7822689],[11.7525571,42.7818917],[11.7529344,42.7816305],[11.7534577,42.7815008],[11.7541652,42.7815446],[11.7545231,42.7817588],[11.7548471,42.7817774],[11.7550546,42.7818113],[11.7554036,42.7817669],[11.756,42.7818291],[11.7565189,42.7819764],[11.7570591,42.7820895],[11.7576062,42.7821686],[11.7582329,42.7822165],[11.7587427,42.782238],[11.7592732,42.7822365],[11.7599459,42.7817005],[11.7601311,42.7815539],[11.7604041,42.7814446],[11.7608297,42.7812602],[11.7612583,42.7809842],[11.7614879,42.7805802],[11.7614731,42.7803959],[11.7614677,42.7801282],[11.7616804,42.7797652],[11.7620245,42.7795978],[11.7624582,42.7797329],[11.7629549,42.7798795],[11.7632503,42.7796777],[11.7636535,42.7794069],[11.7641063,42.7792631],[11.7645269,42.7789716],[11.7645903,42.7787584],[11.7645786,42.7784953],[11.7644785,42.7781851],[11.7643935,42.7779145],[11.7643093,42.7776532],[11.7642452,42.7773125],[11.7648265,42.7771814],[11.7651442,42.7774619],[11.7653984,42.7776809],[11.7658575,42.7779196],[11.7661019,42.7775671],[11.7660661,42.7772955],[11.766116,42.7770487],[11.7661416,42.7769982],[11.7663343,42.7767488],[11.7661963,42.7764617],[11.7664314,42.7761139],[11.7668075,42.7758211],[11.767247,42.775277],[11.7673409,42.7749145],[11.7673628,42.7745763],[11.7677314,42.7743693],[11.7681088,42.7741036],[11.7683216,42.7738913],[11.7685615,42.7734375],[11.769619,42.772561],[11.7699995,42.7722456],[11.7703689,42.7718878],[11.770655,42.7715882],[11.7709566,42.7713625],[11.7712724,42.7711388],[11.7717248,42.7707744],[11.7719885,42.7705384],[11.7724315,42.770109],[11.772858,42.7697047],[11.7732697,42.7693416],[11.7734802,42.7691575],[11.7736195,42.7690285],[11.7737612,42.7688957],[11.7738973,42.7687691],[11.7740942,42.7686077],[11.7742275,42.7684946],[11.7743728,42.7683713],[11.7746355,42.7681556],[11.774916,42.7679462],[11.7753308,42.7677155],[11.7756046,42.7675859],[11.7757228,42.767534],[11.7759369,42.7674444],[11.7760622,42.7673912],[11.7762705,42.7672981],[11.7765646,42.7671566],[11.7769428,42.7669965],[11.7773073,42.7669652],[11.7777488,42.7669905],[11.7781793,42.7670701],[11.7787995,42.7672666],[11.7792338,42.7674204],[11.7798489,42.7674933],[11.7803905,42.7674351],[11.7808563,42.7672775],[11.7812796,42.7671794],[11.7816589,42.7671364],[11.7820539,42.7671223],[11.782492,42.7670981],[11.7829443,42.7670826],[11.7830351,42.7666549],[11.7830447,42.766281],[11.7830412,42.7659569],[11.7829476,42.7657409],[11.7827167,42.7654899],[11.7824858,42.7652546],[11.7822778,42.764967],[11.7821796,42.7646835],[11.7821173,42.7643766],[11.782045,42.7641015],[11.7819842,42.7638171],[11.7818727,42.7635451],[11.7816046,42.7632455],[11.7812879,42.7629966],[11.7809236,42.7627758],[11.7805595,42.7625505],[11.7803183,42.7623403],[11.7800238,42.7620233],[11.7797426,42.7617555],[11.7794689,42.7613817],[11.7792972,42.7610527],[11.7791082,42.7606741],[11.7790015,42.7604273],[11.7789395,42.7601406],[11.7789397,42.7598637],[11.778962,42.7595368],[11.7789838,42.7592031],[11.7790307,42.7588508],[11.7790745,42.7585612],[11.7791051,42.7583199],[11.7794188,42.7580174],[11.7803173,42.7581104],[11.7807108,42.7581571],[11.7811559,42.7582159],[11.7815722,42.7583005],[11.7819738,42.7583065],[11.7820442,42.7582761],[11.7823674,42.7581363],[11.7825031,42.7580775],[11.7828249,42.7578716],[11.7831304,42.7576841],[11.7835479,42.7574398],[11.783915,42.7571878],[11.7842264,42.7570451],[11.7844978,42.7569955],[11.7848769,42.7569055],[11.7854776,42.756864],[11.7858278,42.7568306],[11.7861648,42.7568789],[11.7864717,42.7569184],[11.7867731,42.7570675],[11.7869431,42.7571806],[11.787063,42.7572809],[11.7872591,42.7574201],[11.7874624,42.7575201],[11.7877118,42.7573925],[11.788083,42.7572124],[11.78833,42.7568889],[11.7889672,42.7562656],[11.7891639,42.7559006],[11.7894138,42.7557376],[11.7898088,42.7555675],[11.7902344,42.7555392],[11.790541,42.7555631],[11.7908543,42.7556827],[11.7911388,42.7557865],[11.7913851,42.755871],[11.7916707,42.7559746],[11.7919445,42.7560444],[11.7922032,42.7561169],[11.7927298,42.7561491],[11.7930953,42.7561672],[11.793609,42.7559745],[11.7939345,42.755818],[11.7943598,42.7557243],[11.7946343,42.7556661],[11.7949042,42.755603],[11.7954014,42.755476],[11.7960456,42.7554333],[11.7964802,42.755596],[11.7968131,42.7557049],[11.7973643,42.7557275],[11.7978546,42.7555677],[11.7980734,42.7554827],[11.7983988,42.755432],[11.7987823,42.7553416],[11.7992594,42.7552151],[11.799787,42.7551212],[11.8003115,42.7549913],[11.8007207,42.7548867],[11.8010592,42.754866],[11.8015449,42.7548002],[11.8018163,42.7547451],[11.8023225,42.7545976],[11.8027005,42.7545636],[11.8030585,42.7543658],[11.8033438,42.7542327],[11.8036598,42.7542099],[11.8038072,42.7541943],[11.803964,42.7539879],[11.8045455,42.7540299],[11.8049689,42.7537125],[11.8050182,42.7536739],[11.8055491,42.753796],[11.8060915,42.753911],[11.8065411,42.7539135],[11.8070946,42.7535339],[11.8072355,42.753507],[11.807604,42.7532282],[11.807838,42.7530735],[11.8083816,42.7529994],[11.8086868,42.753199],[11.8091268,42.7531859],[11.8093111,42.7529023],[11.8095867,42.7525623],[11.8100005,42.752246],[11.8101246,42.7517567],[11.810413,42.7515988],[11.810677,42.751401],[11.8109323,42.7511178],[11.8113515,42.7509229],[11.8117725,42.7508361],[11.8119289,42.7505891],[11.8121753,42.7503039],[11.8124938,42.7500439],[11.8125401,42.7496133],[11.8125756,42.7493643],[11.8128856,42.7490506],[11.8133336,42.7486996],[11.813411200000001,42.7482362],[11.8133351,42.747914],[11.8132582,42.7475647],[11.8132487,42.7473488],[11.8132415,42.7471869],[11.8132026,42.7468839],[11.8132103,42.746814],[11.8132472,42.7465024],[11.8133051,42.7461791],[11.8134404,42.7459214],[11.8136998,42.745781],[11.8140262,42.7456458],[11.8143375,42.7455053],[11.814898,42.7454646],[11.8155073,42.7454293],[11.8161931,42.7454665],[11.8167199,42.7455075],[11.8173358,42.7456184],[11.8178658,42.7457044],[11.8182439,42.7457829],[11.8186584,42.7457719],[11.8191599,42.745668],[11.8194861,42.7454259],[11.8195773,42.7450229],[11.8194976,42.7445949],[11.819421,42.7442524],[11.8192675,42.7438307],[11.8191926,42.743583],[11.8190973,42.7433014],[11.8189452,42.7429022],[11.818695,42.7427755],[11.8183022,42.7426816],[11.8178832,42.7426109],[11.8174394,42.7425048],[11.8169761,42.7422641],[11.8164563,42.7418537],[11.8159331,42.7413353],[11.8155445,42.7408406],[11.8152479,42.7401995],[11.8150738,42.7395825],[11.8150979,42.7392983],[11.815182,42.7381706],[11.8151526,42.7377909],[11.8151244,42.7373954],[11.8150445,42.7369719],[11.8149333,42.736682],[11.8147887,42.7364402],[11.8145067,42.7361477],[11.814178,42.7358857],[11.8140737,42.7358139],[11.8138872,42.7356857],[11.8135993,42.7355307],[11.8132684,42.7354668],[11.8129372,42.7355199],[11.812508,42.7355755],[11.8121382,42.7355103],[11.8117889,42.7353478],[11.8114627,42.7351577],[11.8109977,42.7348608],[11.810572,42.7346303],[11.8102698,42.7344487],[11.8099459,42.7342833],[11.8095698,42.7340854],[11.8093527,42.7338769],[11.8093718,42.7334802],[11.8093897,42.7330746],[11.8093726,42.7326788],[11.8093075,42.732327],[11.8091306,42.7319171],[11.8089439,42.7315705],[11.808809,42.7313037],[11.808698,42.7310025],[11.8085751,42.7307151],[11.8084851,42.7303166],[11.808495,42.7301925],[11.8084899,42.7300558],[11.8083777,42.7287862],[11.8082171,42.728484],[11.8081667,42.7281701],[11.8082272,42.7278872],[11.8081358,42.7274865],[11.8080707,42.7271166],[11.8079785,42.7267069],[11.807803,42.7263331],[11.8076513,42.7259316],[11.8074735,42.7255217],[11.8072644,42.7252275],[11.8069176,42.7248398],[11.8066805,42.7244584],[11.8064921,42.7240691],[11.8063639,42.7236557],[11.8063577,42.7232507],[11.8063896,42.7228672],[11.8064207,42.722486],[11.8063271,42.7220358],[11.8061122,42.7216111],[11.8058258,42.7212107],[11.8055148,42.7208041],[11.8052546,42.7204503],[11.8050718,42.7199348],[11.8050657,42.7195297],[11.805125,42.7192108],[11.8052194,42.7188663],[11.805204,42.7185245],[11.8050377,42.7180874],[11.8049192,42.7176333],[11.8048248,42.7171651],[11.8047648,42.7166376],[11.8047523,42.7160976],[11.8047564,42.7156383],[11.8048076,42.7151485],[11.8047431,42.7148102],[11.8047154,42.7144687],[11.8046751,42.7141072],[11.8045353,42.7138788],[11.8043341,42.7135933],[11.804039,42.7132696],[11.8037195,42.7129533],[11.8036086,42.7127372],[11.8035331,42.712563],[11.8034892,42.7124569],[11.8017651,42.7123776],[11.8019464,42.7120985],[11.802022,42.7115992],[11.8019353,42.7112929],[11.801774,42.7109637],[11.8015891,42.7103829],[11.801514,42.7100696],[11.8013048,42.7097708],[11.8008941,42.7093194],[11.800768,42.7089996],[11.8006908,42.708721],[11.8008011,42.7084077],[11.8009633,42.7080953],[11.8011681,42.7077436],[11.801386,42.7073871],[11.8015557,42.7071915],[11.8008319,42.7070736],[11.8006199,42.7070321],[11.8000433,42.706963],[11.7993055,42.7068369],[11.7985786,42.7067016],[11.7977924,42.7065948],[11.797081,42.7065131],[11.7963908,42.70653],[11.7957816,42.7065494],[11.7954201,42.7066482],[11.7949316,42.7066287],[11.794268,42.7066944],[11.7936437,42.7068042],[11.7929403,42.7069609],[11.7921424,42.70712],[11.7916124,42.7072387],[11.7910337,42.7073856],[11.7903962,42.7075498],[11.7898574,42.7075809],[11.7893102,42.7074862],[11.7889171,42.707426],[11.7884192,42.7072219],[11.7882546,42.7072225],[11.7880715,42.7072232],[11.7879484,42.7072222],[11.7871165,42.7074406],[11.7865028,42.7072416],[11.7857885,42.7070947],[11.7849426,42.7070275],[11.7841605,42.7070713],[11.7835352,42.7071585],[11.7828899,42.7072665],[11.7821764,42.7073357],[11.7814424,42.707457],[11.7809956,42.707576],[11.7804514,42.7077355],[11.7799583,42.7078623],[11.7794165,42.708015],[11.778937,42.7081662],[11.7781023,42.7083306],[11.7777489,42.7084832],[11.7774363,42.708779],[11.7772076,42.7090772],[11.7770579,42.7093352],[11.7769707,42.7096479],[11.7768679,42.7099431],[11.7764521,42.7105362],[11.7759447,42.7103336],[11.7756436,42.7098625],[11.7755424,42.7095092],[11.7757545,42.7091491],[11.7759199,42.7090008],[11.7760588,42.70888],[11.7763628,42.7086227],[11.7765902,42.7083649],[11.7768108,42.7079702],[11.7769375,42.7075192],[11.7769686,42.7069916],[11.7771343,42.7066094],[11.7782391,42.7064701],[11.7783512,42.7062971],[11.7785699,42.7060163],[11.7786895,42.7057982],[11.7787967,42.705663],[11.7788776,42.7056062],[11.779249,42.7054348],[11.7799604,42.7053454],[11.7805938,42.7053548],[11.7811431,42.7053257],[11.7818179,42.7053994],[11.7825382,42.7054854],[11.7824634,42.7037516],[11.7824523,42.7024012],[11.7822601,42.7016359],[11.7820796,42.7008322],[11.7819544,42.7001981],[11.7819148,42.6995845],[11.7819813,42.6990066],[11.7820567,42.6986626],[11.7821607,42.6984034],[11.7822483,42.6981514],[11.7822699,42.6974913],[11.7821158,42.6971687],[11.7820848,42.6969163],[11.7820704,42.6968075],[11.7820794,42.6967318],[11.7822323,42.6963689],[11.7826544,42.6958521],[11.7829926,42.6954815],[11.7833693,42.6950671],[11.7835507,42.6947475],[11.7837478,42.6944884],[11.7839797,42.6941541],[11.7840409,42.6937474],[11.7838719,42.6931752],[11.7837289,42.692904],[11.7839027,42.6925468],[11.7840712,42.6924306],[11.7842359,42.692335],[11.7845257,42.6921778],[11.7848272,42.6919588],[11.7850396,42.6916497],[11.7851693,42.6912999],[11.7852259,42.691075],[11.7852709,42.6909344],[11.7853363,42.6908383],[11.7855443,42.6906447],[11.7858427,42.690365],[11.7860677,42.6900241],[11.7863221,42.6895542],[11.7864459,42.689182],[11.7865185,42.688631],[11.78631,42.6881926],[11.7860946,42.6879905],[11.7856278,42.6876239],[11.7853488,42.6873988],[11.7850839,42.6866443],[11.7850378,42.6861502],[11.7849453,42.6857112],[11.7847652,42.6852316],[11.7846503,42.6848022],[11.784583,42.6843806],[11.7845857,42.6839033],[11.7845619,42.6833613],[11.7844812,42.6829131],[11.7843631,42.6824477],[11.7841502,42.6820522],[11.7839908,42.6817634],[11.783843,42.6814518],[11.783852,42.6811319],[11.7839063,42.6807592],[11.7840487,42.6802762],[11.7842866,42.6795231],[11.7845198,42.67886],[11.7845986,42.6784484],[11.7846764,42.678221],[11.7847339,42.678079],[11.7848777,42.6777978],[11.7849799,42.6774914],[11.7850472,42.6771453],[11.785047,42.6766636],[11.7848379,42.6762927],[11.7849279,42.6757977],[11.7849527,42.6756908],[11.7850037,42.675508],[11.7850586,42.6753867],[11.7851762,42.6751837],[11.7853927,42.6748588],[11.7855058,42.6745048],[11.7857139,42.6741103],[11.7857829,42.6736741],[11.7857693,42.6733706],[11.7857504,42.672878],[11.7854291,42.6725076],[11.7851592,42.6721923],[11.78479,42.6718163],[11.7846086,42.6714853],[11.7845116,42.6713211],[11.7847924,42.6709136],[11.7849424,42.6707985],[11.7850667,42.6707043],[11.78554,42.6705509],[11.7859488,42.6705595],[11.7860251,42.6705616],[11.7865198,42.6706577],[11.7872134,42.6706048],[11.7877989,42.6706018],[11.7883579,42.6705656],[11.7889415,42.6705447],[11.7894456,42.6705954],[11.7897999,42.6706138],[11.7899474,42.6705042],[11.7901788,42.6703299],[11.7902977,42.670124],[11.7904035,42.6699475],[11.7904829,42.6698278],[11.790632,42.6696277],[11.7909032,42.6693465],[11.7911893,42.6691887],[11.7915729,42.669087],[11.7923331,42.6689807],[11.7927452,42.669243],[11.7930375,42.6693597],[11.7935172,42.6693232],[11.7939794,42.6692557],[11.7944044,42.6691845],[11.794728,42.6690815],[11.7953327,42.6690876],[11.7957705,42.6690273],[11.7962068,42.6689567],[11.7964152,42.6689113],[11.7965646,42.6688819],[11.7968294,42.6687989],[11.7971686,42.6687951],[11.7976023,42.6687215],[11.7979532,42.6685373],[11.7984011,42.6683733],[11.7987756,42.6682966],[11.7993478,42.6683096],[11.79973,42.6683813],[11.8000754,42.6684989],[11.8004442,42.6685507],[11.8008901,42.6684204],[11.8009891,42.668275],[11.801305,42.667825],[11.8016096,42.6673717],[11.8017758,42.6671021],[11.8018863,42.6667044],[11.8019395,42.6665779],[11.8019958,42.6664327],[11.8020467,42.6663008],[11.8021447,42.66608],[11.8022916,42.665759],[11.8024259,42.6655349],[11.80253,42.6653928],[11.8026098,42.6653182],[11.8029807,42.6650668],[11.8031574,42.6649664],[11.8033284,42.6648692],[11.8036262,42.6646413],[11.8038135,42.6643891],[11.8040403,42.6640053],[11.8043508,42.6637298],[11.8048449,42.6635484],[11.8050732,42.6634913],[11.8052456,42.6634595],[11.8054401,42.663442],[11.8055803,42.6633171],[11.8056589,42.6632477],[11.805982,42.6629695],[11.8062728,42.6627282],[11.806688,42.6621102],[11.8069383,42.6617169],[11.8071056,42.6614359],[11.8073133,42.6611629],[11.807553,42.6608801],[11.8078217,42.6605471],[11.8081767,42.6600319],[11.8084077,42.6597516],[11.8085619,42.6594597],[11.8087128,42.6591881],[11.8088176,42.6589466],[11.8089418,42.6586669],[11.8090377,42.6582661],[11.8091217,42.6578544],[11.8091588,42.6575788],[11.8092655,42.6572565],[11.8093473,42.6568448],[11.8094206,42.6563478],[11.8094563,42.6558471],[11.8094662,42.6553966],[11.8094595,42.6550366],[11.809456,42.6543839],[11.8094133,42.6538852],[11.8093579,42.6533575],[11.8092825,42.6529519],[11.8089863,42.6525472],[11.8088609,42.6521991],[11.808636,42.6518106],[11.8084476,42.6514101],[11.8082968,42.6510333],[11.8080815,42.6505861],[11.8078635,42.6500377],[11.8077859,42.6496681],[11.8076263,42.6493659],[11.8074513,42.649149],[11.8071477,42.6487608],[11.8068351,42.6483115],[11.8065762,42.6479779],[11.8062785,42.647589],[11.8060482,42.6473087],[11.8057888,42.6469572],[11.8055491,42.6465083],[11.8053387,42.646169],[11.8051401,42.6458227],[11.8050841,42.6455247],[11.8049871,42.6452592],[11.804954,42.6449898],[11.8049535,42.6446387],[11.8049,42.6442798],[11.804776,42.6439992],[11.8043707,42.6441712],[11.8041213,42.6443034],[11.8036669,42.6444991],[11.8032089,42.6445779],[11.8026046,42.6444306],[11.8020007,42.6442833],[11.8015443,42.6441774],[11.8011294,42.644165],[11.8006792,42.6441986],[11.8003873,42.6441753],[11.7999933,42.6441253],[11.7996469,42.6440167],[11.7993499,42.6439699],[11.7989601,42.6439322],[11.7984712,42.6439014],[11.7980467,42.6439568],[11.7976309,42.6439309],[11.7972712,42.6437979],[11.7970061,42.6437007],[11.7967628,42.6436122],[11.7964455,42.6434901],[11.7960591,42.6431432],[11.7956636,42.6427048],[11.795331,42.6423573],[11.7949884,42.6420617],[11.7945599,42.6417458],[11.7941529,42.6413708],[11.7938276,42.6411986],[11.7933573,42.6410277],[11.7929571,42.6408056],[11.7924451,42.640548],[11.7918461,42.6402362],[11.791514,42.6401317],[11.7911073,42.6400381],[11.7902331,42.6398433],[11.7895837,42.6397736],[11.7894977,42.6397644],[11.7886919,42.6397277],[11.78813,42.6397257],[11.787652,42.639663],[11.7871582,42.639531],[11.7865736,42.6392683],[11.7860946,42.638886],[11.7856068,42.6386052],[11.7849045,42.6381631],[11.7845675,42.6379822],[11.7841377,42.6376505],[11.7839859,42.6375036],[11.7836792,42.6372069],[11.7832732,42.6368453],[11.7828765,42.6364182],[11.7824701,42.6360567],[11.7820572,42.6358236],[11.7816781,42.6354838],[11.7814114,42.6352449],[11.7811428,42.6349566],[11.7808862,42.6346829],[11.7804245,42.6347106],[11.7796575,42.634808],[11.7792709,42.6348917],[11.7788103,42.635074],[11.7782842,42.6351205],[11.7778891,42.6350716],[11.7769986,42.6350752],[11.7764145,42.6351051],[11.7757477,42.6351933],[11.7750781,42.6352186],[11.7744589,42.6352808],[11.7738187,42.6354202],[11.7731896,42.6355345],[11.7726166,42.6355393],[11.7719454,42.6355376],[11.7712624,42.6355271],[11.7706177,42.6356328],[11.7701841,42.6357378],[11.7698777,42.6358665],[11.7697435,42.6359088],[11.7694731,42.6359567],[11.7693308,42.6359701],[11.7690686,42.6361056],[11.7689435,42.6361677],[11.7686259,42.6363608],[11.7681883,42.6366168],[11.7677804,42.6368472],[11.7674641,42.6370372],[11.7671017,42.6372621],[11.7665013,42.6375423],[11.7663968,42.6375398],[11.7662991,42.6375374],[11.7658068,42.637523],[11.7652052,42.6374318],[11.7645798,42.6373456],[11.7641632,42.6373038],[11.7635929,42.6373694],[11.7631549,42.6373912],[11.7626444,42.6374306],[11.7619997,42.6374619],[11.7614021,42.6374605],[11.760819,42.6374431],[11.7602851,42.6375663],[11.7598815,42.6376863],[11.7594696,42.6378606],[11.7590834,42.6380905],[11.7586332,42.638349],[11.758145,42.6385543],[11.7573516,42.6388076],[11.7566228,42.6388746],[11.7558098,42.6389685],[11.7550307,42.638994],[11.7542507,42.639006],[11.7535404,42.6389398],[11.7529038,42.6388854],[11.7519686,42.6387683],[11.7513809,42.6388792],[11.7509953,42.6390213],[11.7506876,42.6391727],[11.7503357,42.6393523],[11.7497543,42.6396499],[11.7498155,42.6381942],[11.7497842,42.6375016],[11.7499296,42.6368894],[11.7499535,42.6367861],[11.7500198,42.6365588],[11.7500565,42.6364326],[11.7500713,42.6363356],[11.7501207,42.6356498],[11.7502223,42.6352646],[11.7503357,42.634994],[11.7505505,42.6346624],[11.7507602,42.6343873],[11.7509267,42.633816],[11.7509635,42.6333963],[11.7509671,42.6329933],[11.7510005,42.6327776],[11.7510291,42.6325934],[11.7511547,42.6322009],[11.7511185,42.6317853],[11.7511167,42.6313486],[11.7510914,42.6309732],[11.7510976,42.6307441],[11.7511018,42.6305858],[11.7511294,42.6301912],[11.7510452,42.6298555],[11.7509638,42.6294095],[11.7508629,42.6289774],[11.7508684,42.6286959],[11.750917,42.6281229],[11.751036,42.6276496],[11.7511505,42.6271763],[11.7512637,42.6267031],[11.7514078,42.6264093],[11.7516231,42.6260822],[11.7518303,42.6255954],[11.7508277,42.6237353],[11.7504434,42.6230466],[11.7501109,42.6227642],[11.7498039,42.6224294],[11.7493993,42.6221015],[11.7493405,42.6220184],[11.7491034,42.6216899],[11.7489244,42.621424],[11.7483831,42.6211579],[11.7479446,42.6208577],[11.7471813,42.6204213],[11.7463893,42.6198708],[11.7458498,42.6195055],[11.7450716,42.6189816],[11.7443901,42.6184217],[11.7439698,42.6177969],[11.7436759,42.6173672],[11.7432962,42.6168946],[11.7430166,42.6165051],[11.7427525,42.6161039],[11.7425473,42.6158139],[11.7421751,42.6156743],[11.7418238,42.6154305],[11.7414925,42.6151143],[11.7412481,42.614823],[11.7408072,42.6144914],[11.7404331,42.6142841],[11.7385016,42.6132769],[11.737374,42.6128625],[11.7365333,42.6125945],[11.7358151,42.6123416],[11.7355194,42.6121911],[11.7351994,42.6120006],[11.7352188,42.611739],[11.7352841,42.6112805],[11.7352997,42.6107937],[11.7353825,42.6104744],[11.7356928,42.6101743],[11.7360008,42.6098315],[11.7361886,42.6095343],[11.7363,42.6090769],[11.7363048,42.6087797],[11.7362552,42.6085312],[11.7362373,42.6084185],[11.7362275,42.6082615],[11.7362304,42.6081448],[11.7362459,42.6079635],[11.7362568,42.6078469],[11.7362937,42.6074652],[11.7363065,42.6072552],[11.7363048,42.6071384],[11.736304,42.6070126],[11.7359717,42.6066625],[11.7352485,42.6065717],[11.7344201,42.6063124],[11.7336206,42.6061401],[11.7331296,42.6060618],[11.732617,42.606047],[11.7317724,42.6059681],[11.7309774,42.605906],[11.7298928,42.6059139],[11.7292909,42.6059744],[11.7290122,42.6060024],[11.7279452,42.6061944],[11.7274105,42.6063715],[11.7271474,42.6065331],[11.7268112,42.6071557],[11.7266502,42.6079092],[11.7266218,42.6086212],[11.7266428,42.609179],[11.7267148,42.6097469],[11.7267857,42.6103328],[11.7267675,42.6108059],[11.7266949,42.610817],[11.7259921,42.6109257],[11.7251059,42.6107577],[11.7241906,42.6107952],[11.7232121,42.6109131],[11.7221861,42.6111041],[11.7214334,42.6111671],[11.7202484,42.6111097],[11.7193509,42.6109373],[11.7186244,42.610761],[11.7180968,42.6106834],[11.7173611,42.6105862],[11.7168833,42.6104782],[11.7160961,42.6103258],[11.7150416,42.6101864],[11.7141543,42.6102277],[11.7131771,42.6102531],[11.7128557,42.6104319],[11.7122694,42.6107473],[11.7116168,42.6110285],[11.7111113,42.6109053],[11.7105914,42.6106116],[11.7104023,42.6103797],[11.7102822,42.6099907],[11.7102439,42.6095121],[11.71012,42.6092022],[11.7098213,42.6087792],[11.7097382,42.6084705],[11.7096012,42.6080438],[11.7091236,42.6075711],[11.7085304,42.6075356],[11.7078505,42.6073266],[11.7071577,42.607012],[11.7066746,42.6068344],[11.7063822,42.6066194],[11.7060789,42.6062384],[11.7058451,42.6059152],[11.7056572,42.6055977],[11.7054876,42.6053226],[11.7053121,42.6049981],[11.7050404,42.6047321],[11.7046718,42.6044369],[11.7043223,42.604265],[11.7040146,42.604099],[11.7036109,42.6039262],[11.7032366,42.6036468],[11.7030346,42.6034333],[11.7027116,42.6031617],[11.7020904,42.6027577],[11.7018109,42.6025391],[11.7014421,42.602316],[11.701133,42.6020914],[11.7008572,42.6018458],[11.7006043,42.6015864],[11.700422,42.6013743],[11.7001866,42.6010039],[11.6997736,42.6008065],[11.6990984,42.6008449],[11.6987316,42.6008716],[11.6983748,42.6008125],[11.6980578,42.6005723],[11.6975548,42.600224],[11.6971035,42.6001766],[11.6967654,42.600166],[11.6962215,42.6003342],[11.6955794,42.6004168],[11.6950042,42.6003178],[11.6946918,42.6002095],[11.6944412,42.6001059],[11.6938578,42.6000814],[11.6933824,42.5998766],[11.692902,42.5998923],[11.6923146,42.5998295],[11.6919322,42.5995145],[11.6916047,42.5992588],[11.6909462,42.5988983],[11.6905992,42.5987219],[11.6903142,42.5986565],[11.6900863,42.5984503],[11.6898636,42.5983012],[11.689588,42.5981558],[11.6891467,42.5981054],[11.6886716,42.598112],[11.6882133,42.5982151],[11.6878427,42.5982304],[11.6877023,42.5982361],[11.6871977,42.5981309],[11.6868023,42.5979961],[11.6863008,42.5979448],[11.6857347,42.5978095],[11.6853671,42.5974895],[11.6850698,42.5973704],[11.6845542,42.5972834],[11.684009,42.5970666],[11.6836626,42.5969216],[11.6831885,42.5966491],[11.6827631,42.5964002],[11.6824522,42.5962386],[11.6820936,42.5961187],[11.6816026,42.5957452],[11.6814454,42.5954968],[11.6811178,42.5952388],[11.6805906,42.5951566],[11.68005,42.5953133],[11.6794548,42.5951111],[11.6791165,42.5948422],[11.6789561,42.5945127],[11.6789677,42.5944],[11.6789907,42.5941833],[11.6792504,42.5939768],[11.6798186,42.593887],[11.6803625,42.5937819],[11.6807536,42.5935049],[11.6810874,42.5930468],[11.6812388,42.5925998],[11.6814575,42.5920071],[11.6815136,42.5918555],[11.6816104,42.5915938],[11.6818037,42.5912696],[11.6822943,42.591069],[11.682717,42.5909691],[11.682996,42.5906564],[11.6831788,42.5903634],[11.6832241,42.5902908],[11.6834616,42.589817],[11.6836725,42.5893911],[11.6839858,42.5889605],[11.6842726,42.5885553],[11.6845975,42.5878724],[11.6848741,42.5872378],[11.6850902,42.58685],[11.6853579,42.5862832],[11.6855611,42.585907],[11.6857441,42.585628],[11.6859379,42.5853082],[11.6859185,42.5848384],[11.685541,42.5848178],[11.6851708,42.5847386],[11.6848159,42.5846659],[11.6843117,42.5845517],[11.6839119,42.5843224],[11.6837864,42.5840237],[11.6835787,42.583664],[11.6833593,42.5834975],[11.683102,42.5833285],[11.6826546,42.5831341],[11.682389,42.5830401],[11.6821379,42.5829225],[11.6818781,42.5825916],[11.6817803,42.5823014],[11.6817573,42.5820498],[11.6817354,42.5818117],[11.6816853,42.5815247],[11.6814586,42.5813251],[11.6811375,42.581166],[11.6808744,42.5810394],[11.6803273,42.5807911],[11.6799787,42.5806191],[11.6794947,42.5804053],[11.6790386,42.5802742],[11.6785548,42.5800626],[11.6781686,42.5798398],[11.6777325,42.5796136],[11.677311,42.5794456],[11.6767006,42.5791245],[11.6763148,42.5789084],[11.6759257,42.5788745],[11.6755791,42.5788288],[11.6751175,42.5785491],[11.6748047,42.5783673],[11.6743187,42.5783899],[11.6737969,42.5784494],[11.6730147,42.5783934],[11.6724262,42.578263],[11.6714781,42.5780128],[11.6708728,42.5778198],[11.6704121,42.5775987],[11.6697683,42.5773413],[11.6693941,42.5771474],[11.6690075,42.576893],[11.6686154,42.5765465],[11.6681944,42.5761037],[11.6674389,42.576101],[11.6668171,42.5760817],[11.6663816,42.5761549],[11.665957,42.5762024],[11.66548,42.5764326],[11.6651327,42.5765848],[11.664594,42.576809],[11.664206,42.576836],[11.6637054,42.5768296],[11.6631114,42.5768907],[11.662434,42.5770055],[11.6619048,42.5768918],[11.6613018,42.5767324],[11.6608601,42.5766437],[11.6603269,42.5766831],[11.6594185,42.5768122],[11.658875,42.5769599],[11.6584175,42.5770448],[11.6578685,42.5770373],[11.6571679,42.5771616],[11.656832,42.5770073],[11.6565985,42.5766751],[11.6564541,42.5764128],[11.6560829,42.5763043],[11.6559524,42.5760641],[11.65591,42.5757559],[11.655842700000001,42.5754995],[11.6557062,42.5751537],[11.6556576,42.5748351],[11.6557061,42.5745594],[11.6557045,42.5742082],[11.6555245,42.5739783],[11.6554065,42.5738899],[11.6551337,42.5736857],[11.6548467,42.5735077],[11.6545302,42.5732292],[11.6545023,42.5728674],[11.6543567,42.5725758],[11.6540412,42.5723085],[11.6535687,42.5720673],[11.6529997,42.5718374],[11.6524314,42.5716434],[11.6517637,42.5714202],[11.6512411,42.5711442],[11.650572,42.5708805],[11.6500528,42.5706944],[11.6494189,42.5703985],[11.6489471,42.5701527],[11.6486325,42.5699056],[11.6484132,42.569627],[11.6480686,42.5692388],[11.6477342,42.5688233],[11.6474229,42.5683757],[11.6469953,42.5680412],[11.646673,42.567891],[11.6459401,42.567863],[11.6454087,42.5676772],[11.6450978,42.5675267],[11.6447491,42.5673007],[11.6443996,42.567115],[11.6440897,42.5669602],[11.6437617,42.5666999],[11.6433687,42.5663465],[11.6430112,42.5662287],[11.6425941,42.5661775],[11.6420235,42.5662065],[11.6416242,42.5662697],[11.6412594,42.5662421],[11.6406764,42.5659944],[11.6402501,42.5657521],[11.6396707,42.5656645],[11.6393183,42.5657348],[11.6390764,42.5658962],[11.6388043,42.5660871],[11.6383708,42.5662164],[11.6379813,42.5662141],[11.6377329,42.5660825],[11.6374974,42.5657075],[11.6372966,42.56545],[11.6371128,42.5652481],[11.6367151,42.5650411],[11.6360516,42.5649258],[11.6356959,42.5650269],[11.635403,42.5651344],[11.6350462,42.5653317],[11.6343418,42.5654238],[11.6340297,42.5654541],[11.633679,42.5655162],[11.6333275,42.5658845],[11.6332917,42.5661563],[11.6332873,42.5663852],[11.6333402,42.5666096],[11.6333785,42.5668243],[11.6331027,42.5671998],[11.6329989,42.5673785],[11.6328975,42.5675512],[11.6327995,42.5678281],[11.6326413,42.5681222],[11.6323936,42.5683148],[11.6320998,42.5684424],[11.6318668,42.5685443],[11.6316442,42.5686549],[11.6314149,42.5687965],[11.6311551,42.5690029],[11.6308344,42.5691971],[11.6303343,42.5694652],[11.6300215,42.5695579],[11.6296575,42.5695933],[11.6292088,42.5696509],[11.6287132,42.5697343],[11.6283242,42.5697545],[11.6280308,42.569723],[11.6277219,42.5697144],[11.6274938,42.5697083],[11.6271015,42.5696497],[11.6261073,42.5694294],[11.6257664,42.5693369],[11.625479,42.5692525],[11.6250219,42.5690918],[11.6246536,42.5687356],[11.6243477,42.5685213],[11.6241264,42.568356],[11.6240048,42.5680526],[11.62393,42.5677301],[11.6236291,42.5672371],[11.6232482,42.5668362],[11.6228921,42.5664572],[11.6224846,42.5660433],[11.6220046,42.5656288],[11.621529,42.5653178],[11.6209408,42.564944],[11.6205016,42.5646209],[11.6199765,42.5642997],[11.6194785,42.564005],[11.6189462,42.5635039],[11.6183505,42.5629502],[11.6179796,42.5625197],[11.6174954,42.5619994],[11.6172312,42.561472],[11.617058,42.5610977],[11.6168094,42.5606982],[11.616574,42.5602938],[11.6161915,42.5598748],[11.6158933,42.5594539],[11.6156731,42.5591213],[11.6153068,42.5585173],[11.6150063,42.5579929],[11.6144605,42.557447],[11.6140127,42.5572344],[11.6137291,42.5574344],[11.6134492,42.557642],[11.6133625,42.5577062],[11.6127837,42.5581291],[11.6123954,42.5584667],[11.6119584,42.5587851],[11.6116756,42.5590144],[11.6097783,42.5605525],[11.6095233,42.5608644],[11.6092317,42.5611728],[11.6089199,42.5615851],[11.6087749,42.5622052],[11.6086787,42.5628197],[11.6087128,42.5633908],[11.6087675,42.5638263],[11.6087946,42.5642016],[11.6086855,42.564508],[11.6084903,42.5648119],[11.6082885,42.5652127],[11.6082645,42.5655194],[11.6082608,42.565801],[11.6082711,42.5659763],[11.6082937,42.5662301],[11.6077957,42.5665566],[11.6072441,42.5667943],[11.6068368,42.5669364],[11.606278,42.5672462],[11.6057906,42.5675454],[11.6051812,42.5678678],[11.6045948,42.5680838],[11.6038366,42.5683059],[11.6033904,42.5684083],[11.602874,42.568294],[11.6021562,42.5680154],[11.6018335,42.5681646],[11.6010586,42.56827],[11.601008,42.5685277],[11.6008825,42.5687332],[11.600781,42.5692218],[11.6008645,42.569481],[11.6008902,42.5697956],[11.6008347,42.5702381],[11.6007015,42.5705698],[11.6004769,42.5707618],[11.6000109,42.5706891],[11.5997391,42.5704445],[11.5996462,42.5703597],[11.5993603,42.5701665],[11.5991453,42.5700243],[11.5987155,42.5696581],[11.5981785,42.5693326],[11.5977839,42.5692178],[11.5973715,42.5692361],[11.5970572,42.5692658],[11.5966199,42.569332],[11.596232,42.569379],[11.5957097,42.5694179],[11.594975,42.5695651],[11.5945398,42.569647],[11.5939868,42.5698802],[11.5933152,42.5701385],[11.5930581,42.570356],[11.5927566,42.570732],[11.592613,42.5711269],[11.5925825,42.5715284],[11.5925431,42.571777],[11.5925229,42.5719102],[11.5923272,42.5721757],[11.5921217,42.5722898],[11.5917788,42.5724763],[11.5913306,42.5725382],[11.5909671,42.5725419],[11.5905981,42.572485],[11.5902498,42.5722925],[11.5900846,42.5721094],[11.5898424,42.5718425],[11.5894015,42.5714923],[11.5890146,42.5712691],[11.5886043,42.5710691],[11.5880467,42.570825],[11.5875633,42.5706243],[11.5868698,42.5703428],[11.5861733,42.5699443],[11.5854049,42.5696375],[11.5847473,42.5693394],[11.5840299,42.5690765],[11.5832377,42.5687184],[11.5825842,42.5685666],[11.5820913,42.5683751],[11.5815069,42.568113],[11.5812102,42.5679852],[11.5807202,42.5679197],[11.5803324,42.567969],[11.5799214,42.5680548],[11.5795456,42.5681015],[11.5791654,42.568029],[11.578837,42.5677483],[11.578741,42.5674779],[11.5787177,42.5671993],[11.578729,42.566857],[11.5786891,42.5665044],[11.5785572,42.566211],[11.5788253,42.5659205],[11.5788466,42.5655599],[11.5787493,42.5652626],[11.5786053,42.5650092],[11.5784481,42.5647426],[11.5783977,42.5644061],[11.5786154,42.5640545],[11.578955,42.5637317],[11.5793146,42.5635885],[11.5795334,42.5632819],[11.5797703,42.5628331],[11.5799027,42.5626011],[11.5800671,42.5623041],[11.5802134,42.5620104],[11.5803585,42.561728],[11.580495,42.5614457],[11.580601,42.5612296],[11.5807077,42.5609817],[11.5807456,42.5607197],[11.5807602,42.5605123],[11.5806823,42.5603229],[11.5805792,42.5601188],[11.5804685,42.5599088],[11.5804095,42.5596489],[11.5804091,42.5594305],[11.5804013,42.5591786],[11.5804077,42.5589532],[11.5803922,42.5586295],[11.5804273,42.5583315],[11.5804736,42.5579456],[11.5805244,42.557645],[11.5805938,42.5572787],[11.5806539,42.5569465],[11.5807159,42.5566772],[11.5808021,42.5564051],[11.5809005,42.5561327],[11.5810113,42.5558646],[11.581012,42.5555786],[11.5809991,42.5552638],[11.5809298,42.5550264],[11.5808062,42.5547121],[11.5807425,42.5544787],[11.580675,42.5541882],[11.5806993,42.5539018],[11.5807501,42.5535922],[11.58079,42.5533819],[11.5808643,42.5531574],[11.5809816,42.5529708],[11.5811404,42.5527369],[11.5813494,42.552603],[11.5815516,42.5524775],[11.5817012,42.5524027],[11.5823448,42.5521425],[11.5826437,42.5520539],[11.5828654,42.5519907],[11.5831392,42.5519232],[11.5833992,42.5518773],[11.5836478,42.5518487],[11.5839141,42.5518437],[11.5841863,42.5518545],[11.584357,42.5518624],[11.5846703,42.5518582],[11.5849023,42.5518413],[11.5851181,42.5518104],[11.5853465,42.5517593],[11.5856067,42.5516675],[11.5859001,42.5515355],[11.5861606,42.551363],[11.5862937,42.5511784],[11.5864394,42.551001],[11.5864642,42.5508285],[11.5864498,42.5506235],[11.5864042,42.5504573],[11.5863092,42.550189],[11.5862255,42.549932],[11.5861196,42.5497387],[11.5859502,42.5494497],[11.5857704,42.5492331],[11.5855878,42.5491398],[11.5853193,42.5490516],[11.5850542,42.5490142],[11.5847156,42.5490176],[11.5844118,42.5490522],[11.5841313,42.5491024],[11.5838808,42.5491383],[11.5836238,42.5491709],[11.5832616,42.5492155],[11.582936,42.5492829],[11.5825982,42.5493632],[11.5823199,42.5494166],[11.5821397,42.5494529],[11.5819211,42.549497],[11.5816319,42.5495561],[11.5811737,42.5496317],[11.5807818,42.549461],[11.580682,42.5493659],[11.5805509,42.5489974],[11.5805963,42.5487744],[11.5806654,42.5485063],[11.5807015,42.5482106],[11.5807718,42.5478376],[11.5808462,42.5475567],[11.5809811,42.5473106],[11.5811173,42.5470644],[11.5812907,42.5468454],[11.5814901,42.5466417],[11.5817998,42.5464727],[11.5821229,42.5463348],[11.5825076,42.5462136],[11.5829664,42.5461177],[11.58339,42.5460541],[11.5837995,42.5459525],[11.5841243,42.5458554],[11.5845097,42.5457609],[11.5847876,42.5456955],[11.5851516,42.5456269],[11.5855128,42.5455649],[11.5858391,42.5454986],[11.5861021,42.5454483],[11.58637,42.5453992],[11.5866384,42.5453612],[11.5868891,42.5453354],[11.5871231,42.5453128],[11.5873747,42.5452873],[11.5875564,42.5452644],[11.5877722,42.545228],[11.5880518,42.5451521],[11.58816,42.5451134],[11.5882997,42.5449302],[11.5884155,42.5444998],[11.5884609,42.5441611],[11.5885849,42.5438746],[11.5886585,42.5436634],[11.5887126,42.5434283],[11.5887146,42.5432009],[11.5887176,42.5429599],[11.5886573,42.5426798],[11.5885878,42.5424652],[11.588518,42.5422575],[11.5883945,42.5420444],[11.5882557,42.5417839],[11.5881205,42.541585],[11.5880482,42.5414779],[11.5879416,42.5412012],[11.587864,42.5408428],[11.5877542,42.5405436],[11.5876679,42.5401763],[11.5875953,42.5399742],[11.5875538,42.5399195],[11.5875207,42.5398465],[11.5873529,42.5397465],[11.5872032,42.5396847],[11.5870234,42.539648],[11.5866952,42.539613],[11.5865155,42.5398258],[11.5863707,42.5399856],[11.586229,42.5401368],[11.5861288,42.5403552],[11.5860187,42.5406368],[11.58597,42.5409328],[11.5859071,42.5411903],[11.5858696,42.5414596],[11.5858481,42.5417252],[11.5858159,42.5419651],[11.585757,42.5421994],[11.5856962,42.5423763],[11.5855947,42.5425681],[11.585332,42.542764],[11.5850635,42.5428228],[11.5846695,42.542798],[11.5843506,42.5427546],[11.5836247,42.5425459],[11.5832796,42.5424276],[11.582947,42.542336],[11.5825525,42.5422099],[11.5819349,42.5419987],[11.5816525,42.541884],[11.5814024,42.5417833],[11.5810562,42.541665],[11.5806155,42.5415894],[11.5802593,42.5415164],[11.5797295,42.5413662],[11.5792627,42.5412574],[11.578955,42.5411417],[11.5786832,42.5410476],[11.578417,42.5409829],[11.5783218,42.5409462],[11.5782474,42.5409176],[11.5780763,42.5408041],[11.5779436,42.5406679],[11.5778675,42.5405483],[11.5778061,42.5404031],[11.5777756,42.5402772],[11.5777528,42.5400217],[11.5777277,42.5396981],[11.5776181,42.5394012],[11.5771925,42.5390753],[11.5768962,42.5388166],[11.5767535,42.5386883],[11.5764575,42.5384232],[11.5762547,42.5382747],[11.576021,42.5381246],[11.5756608,42.5379346],[11.575401,42.5377796],[11.5751231,42.537591],[11.5744582,42.5370972],[11.5742285,42.5368502],[11.5740616,42.5365951],[11.5738042,42.5362564],[11.5735104,42.5359141],[11.5732162,42.5355785],[11.5728856,42.535219],[11.572509,42.5349438],[11.5721747,42.5348185],[11.5718488,42.5347848],[11.5714779,42.5347328],[11.5708855,42.534539],[11.5705575,42.5345162],[11.5701179,42.5344887],[11.5696029,42.5343922],[11.5692546,42.5342019],[11.5688252,42.5338266],[11.5685425,42.5334682],[11.5684326,42.5331533],[11.5683208,42.5328023],[11.5681619,42.5324997],[11.5679199,42.5322102],[11.5677507,42.5319439],[11.567772,42.5315652],[11.567858,42.5312931],[11.5678813,42.5309707],[11.5676203,42.530497],[11.5672994,42.5300967],[11.5670191,42.5297923],[11.5665649,42.529386],[11.5662018,42.529142],[11.5658978,42.5288517],[11.5655893,42.5284083],[11.5653149,42.5279507],[11.5651548,42.5275896],[11.5649403,42.5271081],[11.5647771,42.5266998],[11.5645415,42.5262886],[11.5642813,42.5258712],[11.5639876,42.5255266],[11.5637684,42.5252006],[11.5635871,42.5249255],[11.5634547,42.524656],[11.5635037,42.5243758],[11.5637382,42.5241567],[11.5640625,42.5240661],[11.5644094,42.5238895],[11.5643434,42.5234655],[11.5639417,42.5231683],[11.5635636,42.5228549],[11.5632601,42.522569],[11.5630672,42.5223077],[11.5629303,42.521946],[11.5629551,42.5216415],[11.5629551,42.5214119],[11.5629471,42.5211104],[11.5628237,42.52078],[11.5626636,42.5204099],[11.5624688,42.5201216],[11.5622993,42.5198282],[11.5622458,42.5194309],[11.5623291,42.5190756],[11.5623909,42.5188109],[11.5623428,42.518499],[11.5621334,42.5181503],[11.5618804,42.5179173],[11.5615158,42.5175967],[11.5612356,42.5172923],[11.5609107,42.5170587],[11.5605987,42.5168811],[11.5602964,42.5166335],[11.5601247,42.5163041],[11.5601101,42.5159465],[11.560189,42.5157559],[11.5602591,42.5156068],[11.5603171,42.5155169],[11.5606251,42.515138],[11.5608574,42.5148514],[11.5614731,42.5147274],[11.5621107,42.5148594],[11.5624659,42.5149235],[11.562991,42.5149455],[11.5634372,42.5148545],[11.5637826,42.5146779],[11.5644527,42.514386],[11.5647998,42.5142432],[11.5652348,42.5141636],[11.5656086,42.5140765],[11.5659257,42.513842],[11.5659364,42.5134726],[11.5657917,42.5131989],[11.5656274,42.5127433],[11.5656267,42.5124282],[11.5658428,42.5120586],[11.5660264,42.5118854],[11.566288,42.5116367],[11.566469,42.5114292],[11.5666834,42.5111753],[11.5669853,42.5105224],[11.5671522,42.5101495],[11.5673375,42.5099202],[11.5678155,42.5096934],[11.5682904,42.5096985],[11.5690226,42.5097563],[11.5695462,42.5097716],[11.5701442,42.50981],[11.5706807,42.509843],[11.5710698,42.5101224],[11.5714097,42.5104434],[11.5717608,42.5106945],[11.5722918,42.5108986],[11.5727343,42.5110035],[11.573199,42.5110764],[11.5737079,42.5110109],[11.5740836,42.5109619],[11.5745143,42.5107789],[11.5748229,42.5105784],[11.5751313,42.5103823],[11.5754767,42.510208],[11.5759294,42.5099794],[11.5763025,42.5098675],[11.5770833,42.5098296],[11.5775251,42.5097139],[11.5780808,42.5096136],[11.5784561,42.5095646],[11.5788522,42.5094296],[11.5793202,42.509266],[11.5797521,42.5091144],[11.5802,42.508919],[11.5805412,42.5087702],[11.5808743,42.5085736],[11.5812663,42.5083577],[11.5816587,42.5081237],[11.5820286,42.5079645],[11.5824346,42.507755],[11.5829474,42.5075003],[11.5832595,42.5072456],[11.5837551,42.5071084],[11.5841883,42.506905],[11.5845519,42.5065456],[11.5851288,42.5061386],[11.585484,42.5058605],[11.5857026,42.5056011],[11.5861588,42.5054017],[11.5863116,42.5051908],[11.5863844,42.5050905],[11.586642,42.504873],[11.5868549,42.5046228],[11.5870611,42.5043188],[11.5871325,42.5040493],[11.5871137,42.503667],[11.5870284,42.5032952],[11.5868424,42.5028334],[11.5866626,42.5024592],[11.5865137,42.5021947],[11.5861583,42.5016849],[11.5859698,42.5014551],[11.5858164,42.5012644],[11.5856878,42.5010964],[11.5855562,42.5009253],[11.5854874,42.5008333],[11.5853341,42.5007863],[11.5851675,42.5007152],[11.5850856,42.5006721],[11.58473,42.5004497],[11.5845133,42.5002295],[11.5843014,42.4999596],[11.5840595,42.4995801],[11.5839985,42.4993181],[11.5839624,42.4990533],[11.5840639,42.4987088],[11.5843357,42.498365],[11.5847746,42.4980084],[11.5852017,42.4977398],[11.5856219,42.497602],[11.5860537,42.4974504],[11.5863656,42.4973601],[11.5867238,42.4971832],[11.5869353,42.4968722],[11.5870821,42.4963376],[11.5872642,42.4958855],[11.5874519,42.49544],[11.5875331,42.495336],[11.5876571,42.4951787],[11.5883923,42.4951261],[11.5887821,42.4951443],[11.5893572,42.4951763],[11.5895272,42.4951716],[11.5897836,42.4951622],[11.5906272,42.4950733],[11.5912545,42.4951064],[11.5921826,42.4952047],[11.5929164,42.4953885],[11.5934588,42.495491],[11.5940809,42.495639],[11.594604,42.4956452],[11.5952368,42.4955903],[11.5958024,42.4954919],[11.5962381,42.4954258],[11.596698,42.4953748],[11.5973875,42.4952782],[11.5978939,42.4951001],[11.5983396,42.4949819],[11.5988162,42.494755],[11.5992704,42.4945578],[11.6000232,42.4942143],[11.6005774,42.4937875],[11.6008974,42.4935821],[11.6014098,42.4935254],[11.6015117,42.4935141],[11.602132,42.4935158],[11.6029731,42.493553],[11.6037398,42.4935558],[11.6044449,42.4935488],[11.6052962,42.4935744],[11.6059379,42.4934991],[11.6066142,42.4933666],[11.6071182,42.4932065],[11.6077318,42.4930372],[11.6083215,42.492891],[11.6087804,42.4928062],[11.6093924,42.4926009],[11.6099516,42.4922955],[11.6106005,42.491808],[11.6110737,42.491482],[11.6114886,42.4912204],[11.6118823,42.4910314],[11.6125943,42.4909003],[11.6131382,42.4908204],[11.6134129,42.4905237],[11.6134617,42.4904702],[11.6137151,42.4901926],[11.6139054,42.4898596],[11.6141901,42.4893826],[11.6145935,42.4890739],[11.6150612,42.4889192],[11.6155533,42.4887751],[11.6159621,42.4886397],[11.6162594,42.4886217],[11.6163167,42.4883907],[11.6163844,42.4882909],[11.6165986,42.4879836],[11.6168514,42.4875095],[11.6168106,42.4872832],[11.6167763,42.4870925],[11.6165516,42.4868117],[11.6162987,42.4865091],[11.616052,42.4861275],[11.6159345,42.4856439],[11.6159354,42.4850991],[11.6160394,42.4844484],[11.6162098,42.4839289],[11.6164381,42.4833519],[11.6167045,42.482828],[11.61717,42.4823762],[11.6173591,42.4818878],[11.6175818,42.4814572],[11.6178506,42.4808298],[11.6180944,42.4802479],[11.618328,42.4796707],[11.6185724,42.4791136],[11.6188027,42.4785635],[11.6190595,42.4780308],[11.6194282,42.477257],[11.6196201,42.4767528],[11.6197823,42.4762583],[11.6199019,42.4757716],[11.619993,42.4751684],[11.6200322,42.4747218],[11.6200326,42.474231],[11.6200206,42.473808],[11.6199763,42.4735658],[11.6199495,42.4734505],[11.6199001,42.4732923],[11.6198572,42.4731736],[11.6197511,42.4729069],[11.6195736,42.4726431],[11.6191662,42.4722607],[11.6189384,42.4720588],[11.6186643,42.4717656],[11.6184541,42.4714665],[11.6182807,42.471081],[11.6181666,42.4706064],[11.6180634,42.470163],[11.6179202,42.4696012],[11.6178166,42.4691578],[11.6176719,42.468605],[11.6175264,42.468032],[11.6173044,42.4675936],[11.6171101,42.4673033],[11.6170462,42.4672078],[11.6165601,42.4668632],[11.6159976,42.4666712],[11.6153523,42.4665103],[11.6148629,42.4663684],[11.6143881,42.4661294],[11.6141817,42.4659198],[11.614054,42.4657903],[11.6137619,42.4653017],[11.6135238,42.4645867],[11.613417,42.4640736],[11.6134056,42.4634728],[11.6135448,42.4629721],[11.6138233,42.4624119],[11.6142191,42.4619864],[11.6148204,42.4615224],[11.6155375,42.4612292],[11.6158975,42.4611129],[11.6163491,42.460866],[11.6177881,42.4600791],[11.6181406,42.4597829],[11.6185689,42.4596178],[11.6187891,42.4590584],[11.6188912,42.4588],[11.618908,42.4587123],[11.6189923,42.4582709],[11.6190045,42.4578158],[11.6187348,42.4572817],[11.6184656,42.4567948],[11.6180564,42.4562324],[11.6176162,42.4558169],[11.6172023,42.4555247],[11.6167247,42.45527],[11.6163436,42.4550266],[11.6158783,42.4545397],[11.6155522,42.4540451],[11.6153662,42.453401],[11.6153195,42.452864],[11.6155104,42.452182],[11.6157835,42.4518696],[11.6159162,42.451342],[11.6159858,42.4511175],[11.6159369,42.4507359],[11.6157403,42.4502767],[11.6156434,42.4497746],[11.6157772,42.4491097],[11.6159635,42.4484818],[11.6163326,42.4477552],[11.6164883,42.4468219],[11.6167087,42.4462292],[11.6168522,42.4458613],[11.6171874,42.4455271],[11.6175553,42.4450099],[11.6178724,42.4444489],[11.6180953,42.443953],[11.6183373,42.4433509],[11.6185786,42.4425755],[11.6187002,42.4418298],[11.6188739,42.4413305],[11.6191697,42.440797],[11.6191879,42.4403756],[11.6191973,42.4399093],[11.619119,42.4394789],[11.6190012,42.4391687],[11.6188071,42.4388062],[11.6186204,42.4384007],[11.6184723,42.4380012],[11.618403,42.4376426],[11.6182187,42.4371582],[11.6180992,42.4367602],[11.6179345,42.4364736],[11.6177547,42.4361368],[11.6177074,42.4360395],[11.6174442,42.4360186],[11.6172712,42.4359942],[11.6168207,42.4359621],[11.6163801,42.4359367],[11.615835,42.4359279],[11.6153389,42.4359463],[11.6149686,42.4360043],[11.6145805,42.4360911],[11.6141102,42.4362717],[11.6130169,42.4366364],[11.6123646,42.436807],[11.6120534,42.4369061],[11.611323,42.437036],[11.6098078,42.4369077],[11.6078336,42.4370023],[11.6063304,42.4364702],[11.6043586,42.4361611],[11.6035162,42.4361236],[11.6030003,42.4361283],[11.6015746,42.4360828],[11.6011421,42.4360219],[11.6002294,42.4361346],[11.5990098,42.4362189],[11.5978641,42.4362449],[11.59672,42.4363062],[11.5955298,42.4364111],[11.5941806,42.4365974],[11.593414,42.4367775],[11.5921174,42.4370829],[11.5911124,42.4372755],[11.5898638,42.4373533],[11.5891601,42.4372063],[11.5884235,42.4371877],[11.5877569,42.4370116],[11.5871066,42.436998],[11.5865074,42.4368346],[11.5858075,42.4367796],[11.5855599,42.4367993],[11.585036,42.4368395],[11.5839878,42.4369127],[11.5815762,42.4370591],[11.5810048,42.4371073],[11.5792296,42.4371615],[11.5788104,42.4371921],[11.578421,42.4372504],[11.5782428,42.4373323],[11.5775354,42.4375606],[11.5769892,42.4377569],[11.576546,42.4376678],[11.5763423,42.4375945],[11.5760831,42.437565],[11.5756983,42.4375028],[11.5751744,42.4373093],[11.5749305,42.437421],[11.5748445,42.4374229],[11.5746397,42.4375549],[11.5742454,42.4377266],[11.5737831,42.4378715],[11.5727436,42.4379231],[11.5723409,42.4381233],[11.5716627,42.4383649],[11.5710372,42.4384922],[11.5704988,42.438646],[11.5696768,42.4388767],[11.5692047,42.4390148],[11.568382100000001,42.4392314],[11.5674424,42.4393869],[11.5670891,42.4393948],[11.5662683,42.4394204],[11.5653642,42.4392778],[11.5647824,42.4390714],[11.5642507,42.4389205],[11.5633124,42.4388777],[11.5626883,42.4390404],[11.5623949,42.4391107],[11.562103,42.4392163],[11.5616436,42.4391983],[11.5612738,42.4390367],[11.5608786,42.4389535],[11.5604698,42.4390051],[11.5599484,42.4391088],[11.5596646,42.4391788],[11.5583036,42.4393154],[11.5578824,42.4392965],[11.5573917,42.4392154],[11.5567523,42.4390032],[11.5559504,42.4387875],[11.5553168,42.4387167],[11.555193,42.4387265],[11.5545067,42.4387701],[11.5535341,42.4392944],[11.5528432,42.4394583],[11.5523953,42.4394896],[11.5509845,42.4395776],[11.5504629,42.4396742],[11.5498058,42.4397313],[11.5491423,42.4398664],[11.5486614,42.4400257],[11.5483387,42.440316],[11.5480747,42.4406404],[11.5475587,42.441112],[11.5468083,42.4414614],[11.5462984,42.4416143],[11.544237,42.4421556],[11.5435189,42.442122],[11.5431503,42.4419886],[11.5427415,42.4418065],[11.5423825,42.4416729],[11.5409112,42.4412101],[11.5388775,42.4405473],[11.5375351,42.4399613],[11.5369977,42.4396688],[11.5368522,42.4396154],[11.5360984,42.4391721],[11.5355416,42.4388729],[11.5348144,42.4386129],[11.5340351,42.4384815],[11.5334102,42.4383891],[11.5324121,42.4382838],[11.5314072,42.4380088],[11.5307694,42.4378318],[11.5300557,42.4376706],[11.5294448,42.4374505],[11.5278355,42.4368773],[11.5267234,42.4363143],[11.5261945,42.4359933],[11.5258397,42.4357251],[11.5255397,42.4353919],[11.5253879,42.4351829],[11.5251297,42.4349814],[11.5248916,42.4348449],[11.5244521,42.4346893],[11.524133,42.43463],[11.5239797,42.4346192],[11.5236778,42.4346021],[11.523559,42.4345867],[11.522932,42.4348978],[11.5225913,42.435025],[11.522056,42.4347819],[11.5219587,42.434501],[11.5218376,42.4343408],[11.5216636,42.4341464],[11.5215876,42.4340671],[11.5214221,42.4340729],[11.5207389,42.4339147],[11.5203136,42.4339866],[11.5202457,42.4339976],[11.5199668,42.4339971],[11.51982,42.4339947],[11.5196655,42.4339817],[11.5192094,42.4339123],[11.5191399,42.4338982],[11.5188944,42.4338478],[11.518725,42.4338009],[11.5185683,42.4337413],[11.5184032,42.4336643],[11.5181295,42.4335848],[11.5179666,42.4335389],[11.5177936,42.4335391],[11.5174323,42.4335349],[11.516575,42.433556],[11.5162147,42.4336651],[11.5159056,42.4337941],[11.515703,42.4338921],[11.5156299,42.433928],[11.5154178,42.434106],[11.5152287,42.4343059],[11.5147275,42.4343237],[11.5141977,42.4343645],[11.5138152,42.4342986],[11.5131522,42.4342974],[11.5122856,42.4345145],[11.5119711,42.434544],[11.5115638,42.4346857],[11.5112827,42.4348301],[11.5109197,42.4350038],[11.5105028,42.4352111],[11.5101174,42.4353096],[11.5096338,42.4353855],[11.5091875,42.4354741],[11.5087781,42.4355641],[11.5081494,42.4356409],[11.5074982,42.4357812],[11.506872,42.43593],[11.5064508,42.4360383],[11.506056,42.4362],[11.5056513,42.436425],[11.5051634,42.4366788],[11.5047458,42.436868],[11.5041132,42.4371813],[11.5035058,42.4374984],[11.5027347,42.43776],[11.5026545,42.4377872],[11.5022233,42.4379497],[11.5016253,42.4381968],[11.501147,42.4383873],[11.50075,42.4386068],[11.5003471,42.4387764],[11.4999652,42.4389446],[11.499523,42.4391185],[11.4988823,42.4391821],[11.4983792,42.439058],[11.4979287,42.4388651],[11.497447,42.4385986],[11.4969485,42.4383123],[11.4965025,42.4380723],[11.496233,42.4378868],[11.4959011,42.4376419],[11.4955744,42.4374419],[11.495141,42.4373387],[11.4944963,42.437301],[11.4938652,42.4374228],[11.4932458,42.4374971],[11.4928857,42.437622],[11.492538,42.4377466],[11.4921562,42.4379463],[11.4918328,42.4380591],[11.4915451,42.4381766],[11.4902423,42.4387263],[11.490014,42.438867],[11.4898727,42.4389505],[11.4895649,42.4391103],[11.4891602,42.4392531],[11.4888883,42.4393703],[11.4886035,42.4392212],[11.4884548,42.4391311],[11.4882453,42.4389765],[11.4881211,42.4388902],[11.4880001,42.4387984],[11.4879095,42.4387073],[11.4878308,42.4386255],[11.4875986,42.4385031],[11.4872389,42.4383194],[11.4870759,42.4382319],[11.4868491,42.438102],[11.4866975,42.4380093],[11.4864758,42.4378582],[11.4863463,42.4377519],[11.4860703,42.4375135],[11.4856062,42.4371723],[11.4853326,42.4369216],[11.4847738,42.436488],[11.4844399,42.4361913],[11.4839179,42.4358267],[11.4834593,42.4355169],[11.4830417,42.4352558],[11.4826386,42.4349853],[11.48229,42.4347587],[11.4819095,42.4344923],[11.4816539,42.4342728],[11.4813437,42.4340364],[11.4811134,42.433857],[11.4811728,42.4331468],[11.4813943,42.4323876],[11.4814381,42.4313467],[11.4811132,42.4306302],[11.4814592,42.43029],[11.4817719,42.4295665],[11.4817507,42.4291052],[11.4814171,42.4288413],[11.4813542,42.4286653],[11.4809894,42.4283032],[11.4810102,42.4277039],[11.4809304,42.4271029],[11.4813028,42.4265811],[11.481089,42.4257007],[11.4811253,42.4250084],[11.4809956,42.4248514],[11.4815324,42.4220756],[11.4815883,42.4215277],[11.4820112,42.4206977],[11.4821257,42.4199274],[11.4818682,42.4196103],[11.4813154,42.4193378],[11.4810172,42.4188149],[11.4803899,42.4182192],[11.479827,42.4178188],[11.4793679,42.4171516],[11.4788184,42.4169874],[11.4784819,42.4166752],[11.4778596,42.4162496],[11.477591,42.4159396],[11.47762,42.4156428],[11.4774902,42.4153665],[11.4773507,42.4150836],[11.4770873,42.4147447],[11.4768379,42.4141488],[11.47628,42.413059],[11.475976,42.4127177],[11.4740024,42.411513],[11.4728264,42.4113419],[11.4724528,42.4112283],[11.4707724,42.4102584],[11.4700823,42.4097968],[11.469261,42.4087843],[11.4687115,42.4082542],[11.4675072,42.4079754],[11.4669887,42.4077746],[11.4630645,42.4052362],[11.4618548,42.4044322],[11.4613527,42.4040022],[11.4610498,42.4038655],[11.4595988,42.4039835],[11.4593045,42.4039384],[11.4590366,42.4038323],[11.4566696,42.4017847],[11.456484,42.4015216],[11.4562367,42.4002468],[11.455709,42.3992685],[11.4554274,42.398817],[11.4550094,42.3984011],[11.4526232,42.3961838],[11.4521543,42.3958136],[11.4512845,42.3953727],[11.450808,42.3950471],[11.4502121,42.3945247],[11.4497752,42.3940613],[11.4495336,42.3936467],[11.4494573,42.3931695],[11.44948,42.3927461],[11.4495953,42.3922311],[11.4499121,42.3917027],[11.4506517,42.3906382],[11.4509835,42.3904096],[11.4515312,42.3901617],[11.4529568,42.389575],[11.4545305,42.3888995],[11.4549205,42.3886685],[11.4550543,42.3883796],[11.4550419,42.3881146],[11.4549288,42.3877627],[11.4532608,42.3850029],[11.4516097,42.3821224],[11.4492185,42.3779784]]],[[[12.4662554,42.3948898],[12.4674417,42.3938467],[12.4675114,42.393624],[12.4688234,42.3917789],[12.472678,42.3893075],[12.4749484,42.3884372],[12.4753955,42.3884642],[12.4857526,42.3936464],[12.4883018,42.3971615],[12.4880545,42.3986752],[12.4876938,42.3986719],[12.487217,42.398754],[12.4871197,42.3993557],[12.4867549,42.3993623],[12.4865327,42.3994231],[12.4862938,42.399633],[12.4855367,42.4003449],[12.4831326,42.4027412],[12.4813616,42.4041637],[12.4803226,42.4040512],[12.4797487,42.403821],[12.4783692,42.4036469],[12.4772134,42.40325],[12.4762731,42.4029271],[12.4755609,42.4027642],[12.4748807,42.4024786],[12.4743283,42.4023063],[12.4735877,42.4019731],[12.4730213,42.4016031],[12.4725871,42.4012336],[12.471184,42.4004252],[12.4703566,42.3998515],[12.4690097,42.3986407],[12.4681151,42.3976053],[12.4676049,42.3966842],[12.4673957,42.39647],[12.4673845,42.3961011],[12.4666399,42.3959121],[12.4664204,42.3956486],[12.4663268,42.3952597],[12.4662554,42.3948898]]]],\"type\":\"MultiPolygon\"},\"properties\":{\"id\":\"8a94721a-d19e-47ab-a84f-33a0c9452993\"}}]}"
        var geo = JSON.parse(poly);

        var geoJsonLayer = L.geoJSON(geo, {
            style: style
        }).addTo(AppMap.Map.map);

        geoJsonLayer.on('click', function (e) {
            console.log(e, 'click')
            AppMap.Map.ListenerClick = false;
        });

        /// var myLayer = L.geoJSON().addTo(map);
        //  myLayer.addData(geojsonFeature);
    },

};
