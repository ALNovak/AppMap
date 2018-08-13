
TransferMap.Map = {
    key: "fq2Bg4g7X0NVFZyRVsFpkxOjBGiIl9QA",
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
        try {
            this.TimerId = setTimeout(function () { TransferMap.Fail() }, 180000);
            this.ElementMap = e;
            $.getScript("http://api.map.baidu.com/api?v=2.0&ak=fq2Bg4g7X0NVFZyRVsFpkxOjBGiIl9QA&callback=TransferMap.Map.initMap(TransferMap.Map.ElementMap)")
        .done(function (script, status) {
            if (typeof BMap !== "undefined") {
                clearTimeout(TransferMap.Map.TimerId);
                TransferMap.Map.Call_CallBack('onInit', true);
            }
        })
        .fail(function (jqxhr, settings, exception) {
            TransferMap.Map.Call_CallBack('onInit', false);
            TransferMap.Fail();
        });
        } catch (err) {
            console.log(err)
        }
    },

    Fail: function () {
        TransferMap.Map.Call_CallBack("Fail", TransferMap.Map.ElementMap);
    },

    initMap: function (e) {
        $.getScript("/scripts/MarkerClusterer_Baidu.js", function (data, textStatus, jqxhr) {
        });
        this.map = new BMap.Map(e, {
            minZoom: 3,
            enableMapClick: true,
            enableAutoResize: false
        });
        //{lat: 37.292098, lng: 55.60315}   
        //lng,lat
        this.map.centerAndZoom(new BMap.Point(18.45703125, 27.215556209029693), 4);
        this.map.enableScrollWheelZoom(true);
        this.map.disableDoubleClickZoom(false);
        //  this.map.enableMapClick(true);
        this.map.setDefaultCursor('');
        //  this.map.getDefaultCursor();
        // this.map.disableDragging(false);




        /*    var myStyleJson = [
            {
                  "featureType": "water",
                  "elementType": "geometry",
                  "stylers": {
                      "color": "#b5cbe4",
                     // "hue": "#efefef",
                      "weight": "1",
                      "lightness": 1,
                      "saturation": 1,
                      "visibility": "on"
                  }
              }
            ]
          
           
            this.map.setMapStyle({ styleJson: myStyleJson });
    
            */

        TransferMap.BoundsChangedZoom = TransferMap.Map.BoundsChangedZoom;
        this.map.addEventListener("zoomend", function () {
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

        //zoomstart

        this.map.addEventListener("dragend", function () {
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

        });

        this.map.addEventListener("moveend", function () {
            TransferMap.Map.Call_CallBack("CountPoint", TransferMap.Map.PointMap.length);
        });

        this.geocoder = new BMap.Geocoder();
        this.map.addEventListener("click", function (event) {
            //  event.domEvent.stopPropagation();
            if (TransferMap.Map.GlobalZoom > 8) {
                TransferMap.Map.fitBoundsOn = false;
                //     console.log(event)
                // if (event.target.Oh.MAP_CLICK_POI)
                // if(!$.isEmptyObject(DistanceRoute)){  
                // if (typeof event.target.Oh.MAP_CLICK_POI !== "undefined") {
                if (event != undefined) {
                    var coords = event.point;
                    TransferMap.Map.placeMarker(coords);
                }
                if (event && event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    window.event.cancelBubble = true;
                }
                // }
                // else {
                //if (event.bb.map.Fh.MAP_CLICK_POI != null) {
                //    console.log(event.bb.map.Fh.MAP_CLICK_POI)
                // }

                // }
            }
        });

        // this.EnableOnclickMap();
    },

    placeMarker: function (location) {
        //   console.log('placeMarker')
        c = {
            "Latitude": location.lat,
            "Longitude": location.lng
        };
        this.Positionlocation = location;
        this.Call_CallBack('MapClick', c);
    },


    Bounds_Changed: function () {
        var bounds_ = TransferMap.Map.map.getBounds();
        if (bounds_) {
            var leftBottom = [bounds_.getSouthWest().lat, bounds_.getSouthWest().lng]
            var rightTop = [bounds_.getNorthEast().lat, bounds_.getNorthEast().lng]
            TransferMap.Map.LeftBottom.Latitude = leftBottom[0];
            TransferMap.Map.LeftBottom.Longitude = leftBottom[1];
            TransferMap.Map.RightTop.Latitude = rightTop[0];
            TransferMap.Map.RightTop.Longitude = rightTop[1];
            TransferMap.Map.Call_CallBack("BoundsChanged", { LeftBottom: this.LeftBottom, RightTop: this.RightTop });
            TransferMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
        }
    },

    GetAddress: function (Latitude, Longitude) {
        var latLng = new BMap.Point(Longitude, Latitude)

        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };

        this.geocoder = new BMap.Geocoder();
        this.geocoder.getLocation(latLng, function (place) {
            //   console.log(place, 'PLACE')
            var point = TransferMap.GetDefPoint();
            var address = place.addressComponents;
            point.Address.City.Title = address.city;
            point.Address.City.Type = 'city';
            point.Address.District.Title = address.district;
            point.Address.District.Type = 'district';
            point.Address.District.Title = address.province;
            point.Address.District.Type = 'district';
            point.Address.Street = address.street;
            point.Address.House = address.streetNumber;
            point.VisiblePoint = true;
            var title = address.city + ' ' + address.district + ' ' + address.province + ' ' + address.street + ' ' + address.streetNumber;
            point.ID = UUID.generate();
            point.Type = 'internet';
            point.Source.Source = "internet";
            point.Source.SourcePath = "baidu map";
           // point.Type = "internet";
            //  console.log('place.address', place.address)
            // .address
            // if (place.address != "") {
            //   point.Title = place.address;
            //  point.Address.raw = place.address;
            //  }
            // else {
            point.Title = title;
            point.Address.raw = title;
            // }             
            point.Position.Latitude = place.point.lat;
            point.Position.Longitude = place.point.lng;
            result_point.error.isError = false;
            result_point.point.push(point);
            TransferMap.Map.Call_CallBack('GetAddress', result_point);
        });

    },

    SetPoints: function (Points) {
        if (Points == null) {
            Points = this.PreservePoints;
        } else {
            this.SavePoints = Points;

        }

        this.PointMap = [];
        TransferMap.Map.ClearMap();
        var Cont = this.PointMap.concat(this.GPSPoint);
        this.PointMap = Cont;
        for (n = 0; n < Points.length; n++) {
            point = TransferMap.ValidationPoint(Points[n])
            if (this.ObjPreservePoints[point.ID] == null) {
                this.PreservePoints.push(point);
                this.ObjPreservePoints[point.ID] = point;
            }

            var icon = new BMap.Icon(point.IconType, new BMap.Size(60, 60));
            if (TransferMap.Filter[point.Type]) {
                var obj = new BMap.Marker(new BMap.Point(point.Position.Longitude, point.Position.Latitude), {
                    icon: icon,
                    title: point.Title,
                });

                obj["Point"] = point;
                obj.addEventListener('click', function (e) {
                    e.domEvent.stopPropagation();
                    TransferMap.Map.SelectMarker = this;
                    TransferMap.Map.Call_CallBack('PointClick', this.Point);
                });
                // this.map.addOverlay(obj);
                this.PointMap.push(obj);
            }

        }

        var mcOptions = [{
            url: '/images/map/icon_pointgroup.png',
            size: new BMap.Size(44, 44),
            textColor: 'black',
            offset: new BMap.Size(1.5, 1),
            //textSize: 12,           
        }];

        // this.map.addOverlay(this.PointMap);

        this.markerCluster = new BMapLib.MarkerClusterer(this.map);
        this.markerCluster.setStyles(mcOptions);
        this.markerCluster.addMarkers(this.PointMap);
        // this.markerCluster.setStyles(mcOptions);
        this.markerCluster.setGridSize(80);
        this.markerCluster.setMinClusterSize(2)

        //  this.markerCluster.setMaxZoom(18);

        TransferMap.Map.Call_CallBack("CountPoint", this.PointMap.length);
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

    ShowBaloon: function (html, e, type) {
        this.HideBaloon();
        this.InfoWindow = new BMapLib.InfoBox(this.map, html, {
            offset: new BMap.Size(-100, 27),
            enableAutoPan: true
        });
        this.InfoWindow.open(new BMap.Point(e.Longitude, e.Latitude));

        if (type == 'internet') {
            TransferMap.Map.Call_CallBack('OpenBallon');
        }
        this.InfoWindowsOpen = true;
        this.BoundsChangedZoom = false;

        this.InfoWindow.addEventListener("open", function (e) {

        });

    },

    HideBaloon: function () {
        if (this.InfoWindow != null) {
            this.InfoWindow.close();
            this.InfoWindowsOpen = false;
        }
    },

    ClearMap: function () {
        this.map.clearOverlays();
        if (this.markerCluster != null) {
            this.markerCluster.clearMarkers();
        };
        this.PointMap = [];
    },
    GetZoom: function () {
        return this.GlobalZoom;
    },

    ShowPoint: function (point, d, cluster, center) {
        // console.log('ShowPoint',d)
        try {
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
                    var icon = new BMap.Icon(point.IconType, new BMap.Size(60, 60));
                    var obj = new BMap.Marker(new BMap.Point(point.Position.Longitude, point.Position.Latitude), {
                        icon: icon,
                        title: point.Title,
                    });

                    this.PointMap.push(obj);
                    this.map.addOverlay(obj);

                    // if (this.markerCluster != null) {
                    //   this.markerCluster.addMarkers(this.PointMap);
                    //  }
                    // else {
                    //     this.map.addOverlay(obj);
                    // }

                    if (cluster) {
                        if (this.markerCluster != null) {
                            // this.markerCluster.addMarker(obj, d);
                        }
                    }

                    if (d) {
                        this.FitBounds(d, center);
                    }

                    //if (this.FitBoundsMap) {
                    //    this.FitBounds(false);
                    //}
                    obj["Point"] = point;
                    if (this.GPSPointID[obj.Point.ID] == null) {
                        if (obj.Point.Type == 'internet') {
                            this.GPSPoint.push(obj);
                            this.GPSPointID[obj.Point.ID] = obj;
                        }
                    }
                    obj.addEventListener('click', function (e) {
                        TransferMap.Map.HideBaloon();
                        e.domEvent.stopPropagation();
                        TransferMap.Map.SelectMarker = this;
                        TransferMap.Map.Call_CallBack('PointClick', this.Point);
                    });
                }
            }

        } catch (error) {

        }
    },


    SearchPoint: function (text) {
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };
        var options = {
            onSearchComplete: function (results) {
                //  console.log(results, 'RESULTS')
                if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                    //  console.log('Done', local.getStatus())
                    for (var i = 0; i < results.getCurrentNumPois() ; i++) {
                        var point = TransferMap.GetDefPoint();
                        //  console.log(results.getPoi(i), 'ELEMENT')
                        var place = results.getPoi(i);
                        point.Address.City.Title = place.city;
                        point.Address.City.Type = 'city';
                        point.Address.District.Title = place.province;
                        point.Address.District.Type = 'district';
                        if (typeof place.postcode !== 'undefined') {
                            point.Address.PostCode = place.postcode;
                        }
                        point.Address.raw = place.address;
                        point.ID = place.uid;
                        point.Title = place.title;
                        point.Position.Latitude = place.point.lat;
                        point.Position.Longitude = place.point.lng;
                        point.VisiblePoint = true;
                        point.Source.Source = "internet";
                        point.Source.SourcePath = "baidu map";
                        point.Type = "internet";
                        point.SubType = 'none';
                        result_point.point.push(point);
                    }
                    result_point.error.isError = false;
                    TransferMap.Map.Call_CallBack('SearchAddress', result_point);
                }
                else {
                    // console.log('Error')
                    result_point.error.isError = true;
                    TransferMap.Map.Call_CallBack('SearchAddress', result_point);
                }
            }
        };
        var local = new BMap.LocalSearch(TransferMap.Map.map, options);
        local.search(text);
    },

    FitBounds: function (e, center) {
        try {
            var bounds = new BMap.Bounds();
            //  console.log(bounds,"BOUNDS")
            for (var i = 0; i < this.PointMap.length; i++) {
                bounds.extend(this.PointMap[i].getPosition());
            }
            if (this.PointMap.length > 1) {
                if (TransferMap.Map.fitBoundsOn) {
                    this.map.setViewport(bounds);
                    // this.map.panToBounds(bounds);

                }
            }
            if (center) {
                if (this.PointMap.length == 1) {
                    this.map.centerAndZoom(new BMap.Point(this.PointMap[0].point.lng, this.PointMap[0].point.lat), 16);
                }
            }
            else {
                if (this.PointMap.length == 1) {
                    this.map.centerAndZoom(new BMap.Point(this.PointMap[0].point.lng, this.PointMap[0].point.lat), TransferMap.Map.GlobalZoom);
                }
            }
        } catch (err) {
            console.log(err)
        }
    },


    RouteMap: function (e, start, end) {
        try {
            this.ShowPoint(start, true, false, false);
            this.ShowPoint(end, true, false, false);
            var start = new BMap.Point(start.Position.Longitude, start.Position.Latitude);
            var end = new BMap.Point(end.Position.Longitude, end.Position.Latitude);
            if (e) {
                TransferMap.Map.directionsDisplay = new BMap.DrivingRoute(TransferMap.Map.map, {
                    onSearchComplete: function (res) {
                        if (TransferMap.Map.directionsDisplay.getStatus() == BMAP_STATUS_SUCCESS) {
                            //     console.log(res, "RES")

                            //    console.log(TransferMap.Map.directionsDisplay.getStatus(), 'status')
                            var arrPois = res.getPlan(0).getRoute(0).getPath();
                            TransferMap.Map.map.addOverlay(new BMap.Polyline(arrPois, {
                                strokeColor: '#007bff',
                                strokeOpacity: 0.9,
                                strokeWeight: 5
                            }));
                            TransferMap.Map.map.setViewport(arrPois);

                            var info = res.getPlan(0);                        
                            RouteInfo = {
                                Time: info.getDuration(true),
                                TimeValue: info.Sq,
                                Distance: info.getDistance(true),
                                DistanceValue: info.cg,
                                // TimeTraffic: result['routes'][0].legs[0].duration_in_traffic.text,
                                // TimeValueTraffic: result['routes'][0].legs[0].duration_in_traffic.value,
                                // StaticMapUrl: 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=roadmap&path=enc:" + path + "&" + markers',
                            }
                            TransferMap.Map.Call_CallBack('InfoRoute', RouteInfo);
                        }
                    }
                });

                TransferMap.Map.directionsDisplay.search(start, end);
            }

        } catch (err) {
            console.log(err)
        }
    },


    MapDefOption: function (e) {
        var coords = { lat: 27.215556209029693, lng: 18.45703125 };
        this.map.centerAndZoom(new BMap.Point(coords.lat, coords.lng), 3);

    },

    Resize: function (e) {
        try {
            var zoom = this.map.getZoom();
            var center = this.map.getCenter();
            if (e == true) {
                // BMapLib.EventWrapper.trigger(this.map, 'resize');                
                // TransferMap.Map.map.setZoom(10);
                // this.map.panTo(center);
                TransferMap.Map.map.panTo(center);
                TransferMap.FitBounds(true);
                TransferMap.Map.map.checkResize();
                TransferMap.Map.map.setCenter(center);
                //TransferMap.Map.map.panTo(center);
            }
            else {
                // BMapLib.EventWrapper.trigger(this.map, 'resize');               
                // TransferMap.Map.map.setZoom(zoom);
                TransferMap.Map.map.panTo(center);
                TransferMap.FitBounds(true);
                TransferMap.Map.map.checkResize();
                TransferMap.Map.map.setCenter(center);
            }
        } catch (error) {

        }
    },


};
