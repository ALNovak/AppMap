# AppMap (Google,Yandex, Baidu, Leaflet)

> A simple plugin.

```text
├── AppMaps.js
├── google.js
└── yandex.js
└── baidu.js
└── leaftlet.js
```
Include files:

```html
<script src="/AppMaps.js"></script>
<link  href="/AppMaps.css" rel="stylesheet">
<script src="/google.js"></script>
<script src="/baidu.js"></script>
<script src="/leaftlet.js"></script>
<script src="/yandex.js"></script>
```
### Usage


```javascript
AppMap.Init('map','google');
AppMap.Init('map','yandex');
AppMap.Init('map','baidu');
AppMap.Init('map','leaftlet');
```
### Function


#### `.Init(selector)`

Инициализация карты

```javascript
AppMap.Init('map','google'); //принимает в качестве аргумента селектор и название карты
```
#### `Callback`
```javascript
    AppMap.Set("onInit",function(e){CallbackMapInit(e)});
    AppMap.Set("GetAddress",function(e){CallbackMapGetAddress(e)});
    AppMap.Set("ChangeZoom",function(e){CallbackMapChangeZoom(e);});
    AppMap.Set("MapClick",function(e){CallbackMapClick(e.Latitude,e.Longitude)});
    AppMap.Set("MapClickPlaceId",function(e){CallbackMapClickPlaceId(e)});
    AppMap.Set("BoundsChanged",function(){CallbackBoundsChanged();});
    AppMap.Set("PointClick",function(e,d){CallbackPointClick(e);});
    AppMap.Set("SearchAddress",function(e){CallbackMapSearchResult(e);});
    AppMap.Set("InfoRoute",function(e){CallbackInfoRoute(e);});
    AppMap.Set("ErrorMap",function(e){CallbackErrorMap(e);});
    AppMap.Set("CountPoint",function(e){CallbackCountPoint(e);});
    AppMap.Set("SetDetailsPoint",function(e){CallbackSetDetailsPoint(e);});
    AppMap.Set("SetDetailsPointLocation", function (e) { CallbackSetDetailsPointLocation(e); });
    AppMap.Set("OpenBallon", function (e) { CallbackOpenBallon(); });
```
#### `.ClearMap()`

Удалить все маркеры с карты

```javascript
AppMaps.Map.ClearMap() //
```
#### `.SetPoints()`

Вывести маркеры на карте

```javascript
AppMaps.Map.SetPoints.(Array) // Принимает массив точек
```

#### `.ShowBaloon()`

Показать информационное окно на карте

```javascript
var html = '<div><span></span></div>'	
var coord = {
	Latitude : 55.670505
	Longitude: 37.60845589999997
    }
    
AppMaps.Map.SetPoints(html,coord) // Принимает шаблон html и объект с координатами
```
#### `.HideBaloon()`

Закрыть информационное окно

```javascript
AppMaps.Map.HideBaloon() //
```
#### `.FitBounds()`

Закрыть информационное окно

```javascript
AppMaps.Map.FitBounds() // Масштабирует карту таким образом что-бы все добавленнеы точки были видны на карте
```
#### `.RouteMap()`

Отобразить маршрут на карте

```javascript
AppMaps.Map.RouteMap(bool, start, end) // Построить и отобразить маршрут на карте от начальной до конечной точки
```
#### `.SetZoomMin()`

Установить минимальный зоом карты

```javascript
AppMaps.Map.SetZoomMin() // Установить минимальный зоом
```
#### `.MapDefOption()`

Выставить настройки карты по умолчанию

```javascript
AppMaps.Map.MapDefOption() // 
```
#### `.GetDetailsPoint(placeId)`

Получить детальную информацию по точке на основе Google PlaceID

```javascript
AppMaps.Map.GetDetailsPoint(placeID) // принимает Google placeID
```

#### `.GetDetailsPointAutocomplete(point,type)`
Получить детальную информацию по точке на основе Google PlaceID
```javascript
AppMaps.Map.GetDetailsPointAutocomplete(point,type) // принимает объект point и тип
```

#### `.GetZoom(point,type)`
Получить текущий зум карты
```javascript
AppMaps.Map.GetZoom() // возвращает текущий зум карты
```

#### `.ShowPoint(point, d, cluster)`
Показать точку на карте
```javascript
AppMaps.Map.ShowPoint() // принимает объект point, bool (отобразить маркер в границах карты, bool (добавть точку в кластер))
```

#### `.SearchPoint(text, location)`
Поиск по карте (AutocompleteService)
```javascript
AppMaps.Map.SearchPoint() // принимает string произвольный текст поиска, и объект с координатами (если нужно ограничить поиск по карте в радиусе от начальной точки), возвращает заполненый объект point
```

#### `.GetBaloonID()`
Получить id информационного окна
```javascript
AppMaps.Map.GetBaloonID() // 
```
#### `.SetZoomMin()`
Выставить минимальный зоом карты
```javascript
AppMaps.Map.SetZoomMin() // 
```

#### `.SetZoomMax()`
Выставить максимальный зоом карты
```javascript
AppMaps.Map.SetZoomMax() // 
```

#### `.GetBounds()`
Получить координаты границы карты
```javascript
AppMaps.Map.GetBounds() // возвращает координаты границы карты
```
#### `.EnableOnclickMap()`
Вкл событие клика на карте
```javascript
AppMaps.Map.EnableOnclickMap() // 
```

#### `.DisableZoomChangeMap()`
Выкл передавать параметры zoom на карте
```javascript
AppMaps.Map.DisableZoomChangeMap() // т 
```

#### `.Distance()`
Рассчитать вхождение точек от начальной точки (радиус)
```javascript
AppMaps.Distance() // 
```

#### `.BelongingPolygon()`
Рассчитать вхождение точек от начальной точки (в полигон)
```javascript
AppMaps.Distance() // 
```

#### `.AddSetPoints()`
Сохранить точки в массив (неудаляемые точки)
```javascript
AppMaps.Map.BelongingPolygon() // 
```

#### `.MarkerClusterPoint()`
Получить информацию о точках в кластере
```javascript
AppMaps.Map.MarkerClusterPoint() // возвращает массив точек в выбраном кластере
```
#### `.Resize()`
Измененить границы блока карты
```javascript
AppMaps.Map.Resize() // 
```

#### `.VisibleMarker(bool)`
Показывать/Скрывать точки на карте
```javascript
AppMaps.Map.VisibleMarker() // 
```

#### `.Fail()`
Вывод ошибок карты 
```javascript
AppMaps.Map.Fail() // 
```

#### `.TransitLayer()`
Отобразить транзитный слой на карте
```javascript
AppMaps.Map.TransitLayer() // 
```
#### `.TrafficLayer()`
Отобразить пробки на карте
```javascript
AppMaps.Map.TrafficLayer() // 
```

#### `.ShowRadius()`
Показать радиус на карте
```javascript
AppMaps.Map.ShowRadius() // 
```
#### `.HideRadius()`
Скрыть радиус на карте
```javascript
AppMaps.Map.HideRadius() // 
```

#### `.DrawingShapes(coord, type)`
Отобразить на карте circle, polyne
```javascript
var coord = {
	Latitude : 55.670505
	Longitude: 37.60845589999997
    }

AppMaps.Map.DrawingShapes(coord, 'polyne') // 
```

