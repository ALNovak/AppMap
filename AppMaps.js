///<reference path="~/Scripts/google.maps.js" />
//<reference path="~/Scripts/baidu.maps.js" />
//<reference path="~/Scripts/ya.maps.js" />
var TransferMap = {
    Map: {},
    clickHandler: null,
    Filter:{
        hotel:true,
        airport:true,
        internet: true,
        trainstation: true,
        seaport: true,
        city: true,
        bus: true,
        parking: true,
    },
    pointFROM: null,
    pointTO: null,
    departureDateTimeTraffic:null,
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
        if (map == "horse") {
            mjs = "/Scripts/leaflet.maps.js";
        };
        if (mjs != "") {
            this.LoadMap(mjs);
        }
    },
    LoadMap: function (js) {
        $.getScript(js)
            .done(function (script, status) {
                TransferMap.Map.Set('onInit', function (e) { TransferMap.Call_CallBack("onInit", e); });
                TransferMap.Map.Set('MapClick', function (e) { TransferMap.Call_CallBack("MapClick", e); });
                TransferMap.Map.Set('MapClickPlaceId', function (e) { TransferMap.Call_CallBack("MapClickPlaceId", e); });
                TransferMap.Map.Set('GetAddress', function (e) { TransferMap.Call_CallBack("GetAddress", e); });
                TransferMap.Map.Set('ChangeZoom', function (e) { TransferMap.Call_CallBack("ChangeZoom", e); });
                TransferMap.Map.Set('CountPoint', function (e) { TransferMap.Call_CallBack("CountPoint", e); });
                TransferMap.Map.Set('Fail', function (e) { TransferMap.Call_CallBack("Fail", e); });
                TransferMap.Map.Set('BoundsChanged', function () { TransferMap.Call_CallBack("BoundsChanged"); });
                TransferMap.Map.Set('PointClick', function (e) { TransferMap.Call_CallBack("PointClick", e); });
                TransferMap.Map.Set('SearchAddress', function (e) { TransferMap.Call_CallBack("SearchAddress", e); });
                TransferMap.Map.Set('MarkerClusterClick', function (e) { TransferMap.Call_CallBack("MarkerClusterClick", e); });
                TransferMap.Map.Set('MarkerClusterPoint', function (e) { TransferMap.Call_CallBack("MarkerClusterPoint", e); });
                TransferMap.Map.Set('InfoRoute', function (e) { TransferMap.Call_CallBack("InfoRoute", e); });
                TransferMap.Map.Set('OpenBallon', function () { TransferMap.Call_CallBack("OpenBallon"); });
                TransferMap.Map.Set('ErrorMap', function (e) { TransferMap.Call_CallBack("ErrorMap", e); });
                TransferMap.Map.Set('SetDetailsPoint', function (e) { TransferMap.Call_CallBack("SetDetailsPoint", e); });
                TransferMap.Map.Set('SetDetailsPointLocation', function (e) { TransferMap.Call_CallBack("SetDetailsPointLocation", e); });
                TransferMap.Map.Init(TransferMap.MapScreen);               
            })
            .fail(function (jqxhr, settings, exception) {
                TransferMap.Call_CallBack("onInit", false);
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
    GetBaloonID:function(){
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
    ShowBaloon: function (e,d,g) {
        this.Map.ShowBaloon(e,d,g);
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
    
    GetDetailsPointAutocomplete: function (e,d) {
        this.Map.GetDetailsPointAutocomplete(e,d);
    },
   
    Bounds_Changed: function () {
        this.Map.Bounds_Changed();
    },

    EnableZoomChangeMap: function () {
        this.Map.EnableZoomChangeMap();
    },

    FitBounds: function (e,center) {
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
    ShowPoint: function (e, d, f, center, selected) {
        this.Map.ShowPoint(e, d, f, center, selected);
    },
    SearchPoint: function (e,d) {
        this.Map.SearchPoint(e,d);
    },
    SearchResult: function (e,d,f) {
        this.Map.SearchResult(e,d,f);
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

    RouteMap: function (e,d,f) {
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

    DrawingShapes: function (e, type) {
        this.Map.DrawingShapes(e, type);
    },

    GeoJsonBoundary: function (e) {
        this.Map.GeoJsonBoundary(e);
    },

    //PointDistance: function (e) {
    //    this.Map.GeoJsonBoundary(e);
    //},


}