var AppMap = {
    Map: {},
    clickHandler: null,
    Filter: {
        hotel: true,
        airport: true,
        internet: true,
        trainstation: true,
        seaport: true,
        city: true,
        bus: true,
        parking: true,
    },
    pointFROM: null,
    pointTO: null,
    departureDateTimeTraffic: null,
    InputSearch: { pointFROM: null, pointTO: null },
    SelectPointRoute: { pointFROM: null, pointTO: null },
    MapScreen: null,
    Ini: {
        'point': {},
    },
    ValidationPoint: function (p) { return p },
    CallBack: {
        'MapClick': function (Lat, Lon) { },
        'MapClickPlaceId': function (e) { },
        'onInit': function (status) { },
        'MarkerClusterClick': function (e) { },
        'MarkerClusterPoint': function (e) { },
        'InfoRoute': function (e) { },
        'OpenBaloon': function () { },
        'CloseBaloon': function () { },
        'EventIdle': function () { },
        'FitBounds': function () { },
        'RouteMap': function () { },
        'ErrorMap': function () { },
        'CountVisibleMarker': function (e) { },

    },
    Set: function (cb, fn) {
        this.CallBack[cb] = fn;
    },
    Call_CallBack: function (e, p) {
        if (e in this.CallBack) {
            this.CallBack[e](p);
        }
    },
    Init: function (e, map) {
        var mjs = "";
        this.MapScreen = e;
        if (map == "baidu") {
            mjs = "/Scripts/baidu.maps.js";
        };
        if (map == "yandex") {
            mjs = "/Scripts/ya.maps.js";
        };
        if (map == "google") {
            mjs = "/Scripts/google.maps.js";
        };
        if (map == "leaflet") {
            mjs = "/Scripts/leaflet.maps.js";         
        };
        if (mjs != "") {
            this.LoadMap(mjs);
        }
    },
    LoadMap: function (js) {
        $.getScript(js)
            .done(function (script, status) {
                AppMap.Map.Set('onInit', function (e) { AppMap.Call_CallBack("onInit", e); });
                AppMap.Map.Set('MapClick', function (e) { AppMap.Call_CallBack("MapClick", e); });
                AppMap.Map.Set('MapClickPlaceId', function (e) { AppMap.Call_CallBack("MapClickPlaceId", e); });
                AppMap.Map.Set('GetAddress', function (e) { AppMap.Call_CallBack("GetAddress", e); });
                AppMap.Map.Set('ChangeZoom', function (e) { AppMap.Call_CallBack("ChangeZoom", e); });
                AppMap.Map.Set('CountPoint', function (e) { AppMap.Call_CallBack("CountPoint", e); });
                AppMap.Map.Set('Fail', function (e) { AppMap.Call_CallBack("Fail", e); });
                AppMap.Map.Set('BoundsChanged', function () { AppMap.Call_CallBack("BoundsChanged"); });
                AppMap.Map.Set('PointClick', function (e) { AppMap.Call_CallBack("PointClick", e); });
                AppMap.Map.Set('SearchAddress', function (e) { AppMap.Call_CallBack("SearchAddress", e); });
                AppMap.Map.Set('MarkerClusterClick', function (e) { AppMap.Call_CallBack("MarkerClusterClick", e); });
                AppMap.Map.Set('MarkerClusterPoint', function (e) { AppMap.Call_CallBack("MarkerClusterPoint", e); });
                AppMap.Map.Set('InfoRoute', function (e) { AppMap.Call_CallBack("InfoRoute", e); });
                AppMap.Map.Set('OpenBallon', function () { AppMap.Call_CallBack("OpenBallon"); });
                AppMap.Map.Set('ErrorMap', function (e) { AppMap.Call_CallBack("ErrorMap", e); });
                AppMap.Map.Set('SetDetailsPoint', function (e) { AppMap.Call_CallBack("SetDetailsPoint", e); });
                AppMap.Map.Set('SetDetailsPointLocation', function (e) { AppMap.Call_CallBack("SetDetailsPointLocation", e); });
                AppMap.Map.Init(AppMap.MapScreen);
            })
            .fail(function (jqxhr, settings, exception) {
                AppMap.Call_CallBack("onInit", false);
            });
    },
    ClearMap: function (e) {
        this.Map.ClearMap(e);
    },
    SetPoints: function (e) {
        this.Map.SetPoints(e);
    },
    GetAddress: function (Latitude, Longitude) {
        this.Map.GetAddress(Latitude, Longitude);
    },
    GetZoom: function () {
        return this.Map.GetZoom();
    },

    GettZoom: function (e) {
        return this.Map.GettZoom(e);
    },
    GetBaloonID: function () {
        return this.Map.TempBaloonID;
    },

    SetZoomMin: function (e) {
        this.Map.SetZoomMin(e);
    },

    SetZoomMax: function (e) {
        this.Map.SetZoomMax(e);
    },

    MapDefOption: function () {
        this.Map.MapDefOption();
    },

    GetBounds: function () {
        return this.Map.GetBounds();
    },
    ShowBaloon: function (e, d, t) {
        this.Map.ShowBaloon(e, d, t);
    },
    HideBaloon: function (e) {
        this.Map.HideBaloon(e);
    },
    EnableOnclickMap: function () {
        this.Map.EnableOnclickMap();
    },

    DisableZoomChangeMap: function () {
        this.Map.DisableZoomChangeMap();
    },

    ClickEventsOverlay: function () {
        this.Map.ClickEventsOverlay();
    },
    GetDetailsPoint: function (e) {
        this.Map.GetDetailsPoint(e);
    },

    GetDetailsPointAutocomplete: function (e, d) {
        this.Map.GetDetailsPointAutocomplete(e, d);
    },

    Bounds_Changed: function () {
        this.Map.Bounds_Changed();
    },

    EnableZoomChangeMap: function () {
        this.Map.EnableZoomChangeMap();
    },

    FitBounds: function (e) {
        this.Map.FitBounds(e);
    },
    Distance: function (lat1, lon1, lat2, lon2) {
        var radLat1 = lat1 * (Math.PI / 180);
        var radLon1 = lon1 * (Math.PI / 180);
        var radLat2 = lat2 * (Math.PI / 180);
        var radLon2 = lon2 * (Math.PI / 180);

       var earthRadius = 6372.795;
        var radLonDif = radLon2 - radLon1;
        var atan2top = Math.sqrt(Math.pow(Math.cos(radLat2) * Math.sin(radLonDif), 2) + Math.pow(Math.cos(radLat1) * Math.sin(radLat2) - Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(radLonDif), 2));
        var atan2bottom = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radLonDif);
        var deltaAngle = Math.atan2(atan2top, atan2bottom);
        var l = earthRadius * deltaAngle;
        return l;
    },
    Inclusion: function (bounds, point) {
        var ret = false;
        if ((point.Latitude > bounds.SW.Latitude) && (point.Latitude < bounds.NE.Latitude)) {
            if ((point.Longitude > bounds.SW.Longitude) && (point.Longitude < bounds.NE.Longitude)) {
                ret = true;
            }
        }
        return ret;
    },

    BelongingPolygon: function (coord, xp, yp) {
        var x = coord.Latitude;
        var y = coord.Longitude;

        npol = xp.length;
        j = npol - 1;
        var c = 0;
        for (i = 0; i < npol; i++) {
            if ((((yp[i] <= y) && (y < yp[j])) || ((yp[j] <= y) && (y < yp[i]))) &&
            (x > (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i])) {
                c = !c
            }
            j = i;
        }
        return c;
    },

    SetDefPoint: function (point) {
        this.Ini["point"] = point;
    },
    GetDefPoint: function (point) {
        var o = JSON.stringify(this.Ini["point"]);
        return JSON.parse(o);
    },
    ShowPoint: function (e, d, f) {
        this.Map.ShowPoint(e, d, f);
    },
    SearchPoint: function (e, d) {
        this.Map.SearchPoint(e, d);
    },
    SearchResult: function (e, d, f) {
        this.Map.SearchResult(e, d, f);
    },

    SearchResultGetAddress: function (e, d, f) {
        this.Map.SearchResultGetAddress(e, d, f);
    },

    AddSetPoints: function (e) {
        this.Map.AddSetPoints(e);
    },

    InfoWindowEvents: function () {
        this.Map.InfoWindowEvents();
    },
    SavedPoints: function (e) {
        this.Map.SavedPoints(e);
    },
    MarkerClusterPoint: function () {
        this.Map.MarkerClusterPoint();
    },

    Fail: function () {
        this.Map.Fail();
    },

    RouteMap: function (e, d, f) {
        this.Map.RouteMap(e, d, f);
    },

    Resize: function (e) {
        this.Map.Resize(e);
    },

    VisibleMarker: function (e) {
        this.Map.VisibleMarker(e);
    },
    VisibleMarkerClusterer: function (e) {
        this.Map.VisibleMarkerClusterer(e);
    },
    TransitLayer: function (e) {
        this.Map.TransitLayer(e);
    },

    TrafficLayer: function (e) {
        this.Map.TrafficLayer(e);
    },

    ShowRadius: function (e) {
        this.Map.ShowRadius(e);
    },

    HideRadius: function (e) {
        this.Map.HideRadius(e);
    },

    DrawingShapes: function (e, type) {
        this.Map.DrawingShapes(e, type);
    },


    VisiblePoint: function (e) {
        this.Map.VisiblePoint(e);
    },
}
