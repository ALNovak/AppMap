
TransferMap.Map = {
    key: "AIzaSyCdytH3I4d-vUh1Mr85YENlXO_RN4XoVfM",
    TimerId: null,
    PointCountOne: true,
    GenerateEventZoom: true,
    FitBoundsMap: true,
    BoundsChangedZoom: true,
    GlobalCenter: null,
    GlobalZoom: 0,
    TempBaloonID: '',
    InfoWindow: null,
    ListenerClick: null,
    ListenerZoom: null,
    map: null,
    SelectMarker: null,
    LeftBottom: { Latitude: 0, Longitude: 0 },
    RightTop: { Latitude: 0, Longitude: 0 },
    geocoder: null,
    marker: null,
    PointMap: [],
    FitBoundsPoint: [],
    directionsDisplay: null,
    markerCluster: null,
    Positionlocation: null,
    ElementMap: null,
    InfoWindowsOpen: null,
    SavePoints: [],
    PreservePoints: [],
    ObjPreservePoints: {},
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
        this.TimerId = setTimeout(function () { TransferMap.Fail() }, 180000);
        this.ElementMap = e;
        $.getScript("https://api-maps.yandex.ru/2.1/?lang=" + CurrentLamgCulture)
        .done(function (script, status) {
            clearTimeout(TransferMap.Map.TimerId);
            ymaps.ready(TransferMap.Map.initMap);
            // TransferMap.Map.init(TransferMap.Map.ElementMap);
            TransferMap.Map.Call_CallBack('onInit', true);
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
        TransferMap.Map.map = new ymaps.Map(TransferMap.Map.ElementMap, {
            center: [27.215556209029693, 18.45703125],
            behaviors: ['default', 'scrollZoom'],
            zoom: 3,
            controls: []
        });

        TransferMap.Map.map.events.add('actionbegin', function (event) {
            TransferMap.BoundsChangedZoom = true;
        });

        TransferMap.Map.map.options.set('minZoom', 3);
        TransferMap.Map.map.options.set('maxZoom', 22);
        TransferMap.Map.map.events.add('actionend', function (event) {
            TransferMap.Map.PointCountOne = true;
            TransferMap.BoundsChangedZoom = false;
            TransferMap.Map.Call_CallBack("CountPoint", TransferMap.Map.PointMap.length);
        });

        TransferMap.BoundsChangedZoom = TransferMap.Map.BoundsChangedZoom;
        TransferMap.Map.map.events.add('boundschange', function (event) {
            if (event.get('newCenter') != event.get('oldCenter')) {
                GlobalCenter = event.get('newCenter');
            }

            if (event.get('newZoom') != event.get('oldZoom')) {
                var newZoom = event.get('newZoom');
                TransferMap.Map.GlobalZoom = newZoom;
                if (TransferMap.Map.PointCountOne) {
                    TransferMap.Map.HideBaloon();
                }

                if (TransferMap.Map.InfoWindowsOpen == 0) {
                    TransferMap.BoundsChangedZoom = true;
                }
                if (TransferMap.Map.GenerateEventZoom) {
                    TransferMap.Map.Call_CallBack("ChangeZoom", TransferMap.Map.GlobalZoom);
                }
            }
            var bounds_ = event.get('newBounds');
            if (bounds_) {
                onBounds(bounds_[0], bounds_[1]);
                TransferMap.Map.LeftBottom.Latitude = bounds_[0][0];
                TransferMap.Map.LeftBottom.Longitude = bounds_[0][1];
                TransferMap.Map.RightTop.Latitude = bounds_[1][0];
                TransferMap.Map.RightTop.Longitude = bounds_[1][1];
                TransferMap.Map.Call_CallBack("BoundsChanged", { LeftBottom: this.LeftBottom, RightTop: this.RightTop });
            }
        });


        TransferMap.Map.EnableOnclickMap();
        //TransferMap.Map.map.events.add('click', TransferMap.Map.EnableOnclickMap);
        //  TransferMap.Map.map.behaviors.get('drag').disable();
    },


    SetPoints: function (Points) {
        //  this.PointCountOne = true;
        // $('#CountPoint').html("Load Points " + MapGeoObjectPoint.length);
        if (Points == null) {
            Points = this.PreservePoints;
        } else {
            this.SavePoints = Points;

        }
        this.PointMap = [];

        for (n = 0; n < Points.length; n++) {
            point = TransferMap.ValidationPoint(Points[n])
            if (this.ObjPreservePoints[point.ID] == null) {
                this.PreservePoints.push(point);
                this.ObjPreservePoints[point.ID] = point;
            }

            if (TransferMap.Filter[point.Type]) {
                var obj = new ymaps.GeoObject({
                    geometry: {
                        type: "Point",
                        coordinates: [point.Position.Latitude, point.Position.Longitude],
                        //  hintContent: 'Собственный значок метки'
                    },
                    // Свойства.                 
                    properties: {
                        //   hintContent: 'Собственный значок метки'
                        hintContent: point.Title
                    }
                }, {
                    // Опции.                                    
                    iconLayout: 'default#image',
                    iconImageSize: [30, 42],
                    iconImageHref: point.IconType,
                    hintContent: point.Title
                })

                obj["Point"] = point;
                obj.events.add('click', function (e) {
                    e.stopImmediatePropagation();
                    var thisPlacemark = e.get('target');
                    //TransferMap.Map.SelectMarker = thisPlacemark;
                    TransferMap.Map.Call_CallBack('PointClick', thisPlacemark.Point);
                });

                this.PointMap.push(obj);

            }
        }

        TransferMap.Map.Call_CallBack("CountPoint", TransferMap.Map.PointMap.length);

        this.markerCluster = new ymaps.Clusterer({
            clusterIcons: [{
                href: '/images/map/icon_pointgroup.png',
                size: [53, 52],
                offset: [-20, -20]
            }],
            //  clusterNumbers: [100],
            // clusterIconContentLayout: null
        }),

      this.markerCluster.options.set({
          gridSize: 80,
          clusterDisableClickZoom: true,
          minClusterSize: 3,
          groupByCoordinates: false,
          hasBalloon: false,
      });

        this.markerCluster.events.add('click', function (e) {
            var thisPlacemark = e.get('target');
            var result_point = {
                point: []
            };
            var PointMarkerClusterer = thisPlacemark.properties._data.geoObjects;
            var p = thisPlacemark.geometry._coordinates
            var coord = { Latitude: p[0], Longitude: p[1] }
            for (n = 0; n < PointMarkerClusterer.length; n++) {
                var point = PointMarkerClusterer[n].Point;
                point['ClusterPosition'] = coord;
                result_point.point.push(point);
            }
            TransferMap.Map.Call_CallBack('MarkerClusterClick', result_point);

        });


        this.markerCluster.add(this.PointMap);
        this.map.geoObjects.add(this.markerCluster);

    },

    DisableZoomChangeMap: function () {
        TransferMap.Map.GenerateEventZoom = false
    },

    EnableZoomChangeMap: function () {
        TransferMap.Map.GenerateEventZoom = true;

    },

    GetBounds: function () {
        return {
            LeftBottom: this.LeftBottom,
            RightTop: this.RightTop
        };
    },

    placeMarker: function (location) {
        c = {
            "Latitude": location[0],
            "Longitude": location[1]
        };
        this.Positionlocation = location;
        this.Call_CallBack('MapClick', c);
    },


    GetAddress: function (Latitude, Longitude) {
        latLng = [];
        latLng.push(Latitude);
        latLng.push(Longitude);
        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };
        ymaps.geocode(latLng).then(function (res) {
            var place = res.geoObjects.get(0);
            var point = TransferMap.GetDefPoint();
            point.ID = UUID.generate();
            point.Sourse = "internet";
            point.SoursePath = "yandex map";
            point.Title = place.properties._data.name;
            point.Position.Latitude = place.geometry._coordinates[0];
            point.Position.Longitude = place.geometry._coordinates[1];
            point.Description.Address = place.properties._data.description;
            result_point.point.push(point);
            TransferMap.Map.Call_CallBack('GetAddress', point);
        },
        function (err) {
            result_point.error.isError = true;
            TransferMap.Map.Call_CallBack('GetAddress', "");
        });
    },


    SearchPoint: function (text) {

        var searchControl = new ymaps.control.SearchControl({
            options: {
                provider: 'yandex#search'
            }
        });

        searchControl.search(text);

        var result_point = {
            error: {
                isError: false,
            },
            point: []
        };
        searchControl.events.add('load', function (event) {
            ss = searchControl.getResultsArray();
            c = ss.length;
            if (c > 0) {
                for (var i = 0; i < ss.length; i++) {
                    var place = ss[i];
                    var point = TransferMap.GetDefPoint();
                    point.ID = UUID.generate();
                    point.Sourse = "internet";
                    point.SoursePath = "yandex map";
                    point.Title = place.properties._data.name;
                    point.Position.Latitude = place.geometry._coordinates[0];
                    point.Position.Longitude = place.geometry._coordinates[1];
                    point.Description.Address = place.properties._data.description;
                    result_point.point.push(point);
                    result_point.error.isError = false;
                }
            }
            else {
                result_point.error.isError = true;
            }
            TransferMap.Map.Call_CallBack('SearchAddress', result_point);

        });
    },

    ClearMap: function () {
        this.map.geoObjects.removeAll();
        this.PointMap = [];
        if (this.markerCluster != null) {
            this.markerCluster.removeAll();
            // this.PointMap = [];
        };
    },

    ShowBaloon: function (html, e) {    
        $('#temp_123').remove();
        this.TempBaloonID = "#temp_123";
        html = '<div id="temp_123">' + html + '</div>';      
        this.HideBaloon();
        this.map.balloon.open([e.Latitude, e.Longitude], html, {
            offset: [0, -28],
            autoPanDuration: 900,
            autoPan: true,
            closeButton: true
        });
        this.InfoWindowsOpen = 1;

    },

    HideBaloon: function () {
        this.map.balloon.close();
    },


    FitBounds: function (e) {

        if (e == false) {
            this.GenerateEventZoom = false;
        }

        if (this.PointMap.length > 1) {
            this.map.setBounds(this.map.geoObjects.getBounds(), { checkZoomRange: false, useMapMargin: true, duration: 160, /*preciseZoom: true*/ }).then(function () { if (this.map.getZoom() > 10) this.map.setZoom(10); });
            if (this.PointMap[0].geometry._coordinates[0] == this.PointMap[1].geometry._coordinates[0]) {              

            }
        }

        if (this.PointMap.length == 1) {
            this.PointCountOne = false;
            this.map.setCenter([this.PointMap[0].geometry._coordinates[0], this.PointMap[0].geometry._coordinates[1]], 8, {
                checkZoomRange: true, useMapMargin: true, duration: 160
            });           
        }
    },


    RouteMap: function (e) {
        this.ClearMap();
        this.DisableOnclickMap();
        this.BoundsChangedZoom = false;
        this.ShowPoint(e[0]);
        this.ShowPoint(e[1]);
        this.BoundsChangedZoom = false;  
    },



    EnableOnclickMap: function (e) {
        TransferMap.Map.map.events.add("click", this.EnableOnclickMap);
        if (e != undefined) {
            var coords = e.get('coords');
            e.stopImmediatePropagation();
            TransferMap.Map.placeMarker(coords);
        }
    },


    DisableOnclickMap: function () {
        this.map.events.remove("click", this.EnableOnclickMap);
    },


    GetZoom: function () {
        return this.GlobalZoom;
    },
    ShowPoint: function (point) {
        if (this.ObjPreservePoints[point.ID] == null) {
            this.PreservePoints.push(point);
            this.ObjPreservePoints[point.ID] = point;
        }

        var obj = new ymaps.GeoObject({
            geometry: {
                type: "Point",
                coordinates: [point.Position.Latitude, point.Position.Longitude]
            },
            // Свойства.                 
            properties: {
            }
        }, {
            // Опции.                                    
            iconLayout: 'default#image',
            iconImageSize: [30, 42],
            iconImageHref: point.IconType,
        })

        this.PointMap.push(obj);
        // this.map.geoObjects.add(obj);

        if (this.markerCluster != null) {
            this.markerCluster.add(this.PointMap);
            // this.map.geoObjects.add(obj);
            this.map.geoObjects.add(this.markerCluster);
        }
        else {
            this.map.geoObjects.add(obj);
        }


        if (this.FitBoundsMap) {
            this.FitBounds(false);
        }

        obj["Point"] = point;
        obj.events.add('click', function (e) {
            e.stopImmediatePropagation();
            var thisPlacemark = e.get('target');
            TransferMap.Map.Call_CallBack('PointClick', thisPlacemark.Point);
        });
    },


};
