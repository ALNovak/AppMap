# AppMap (Google Map)

> A simple plugin.

```text
├── AppMaps.js
├── google.maps.js
└── MarkerClustererPlus.js
└── Infobox.js
```
### Install

```shell
npm install @AlNovak/AppMap
```

Include files:

```html
<script src="/AppMaps.js"></script>
<link  href="/AppMaps.css" rel="stylesheet">
<script src="/Google.js"></script>
<script src="/MarkerClustererPlus.js"></script>
<script src="/InfoBox.js"></script>

```
### Usage


```javascript
AppMaps.Init('map');
```
### Function

| Operator                       | Description  |                Example |
|:-------------                  |:---------------------------:|-------------:|
| Init  ()                       | принимает в качестве аргумента селектор  и тип карты                     |    AppMaps.Init("map","google");                                               |
| ClearMap  ()                   | -                                                                        |    AppMaps.Map.ClearMap();                                                    |
| SetPoints  (Array)                  | принимает в качестве аргумента массив точек                              |    AppMaps.Map.SetPoints  (Array)                                                 |
| ShowBaloon  (html,'coord')     | принимает в качестве аргументов шаблон html  и объект Latitude Longitude |    AppMaps.Map.ShowBaloon  (html,'coord')                                                                |
| RouteMap  (bool,'start, end')     | принимает в качестве аргументов шаблон bool отображать ли на карте маршрут  start объект Latitude Longitude  end объект Latitude Longitude |    AppMaps.Map.RouteMap  (bool,'start, end')                                                                |
| SetZoomMin  ()     | Установить минимальный zoom карты |    AppMaps.Map.SetZoomMin  ()                                                                |
| GetDetailsPoint  ()     | Получить подробную информацию о точке, принимает Google PlaceId |    AppMaps.Map.GetDetailsPoint (placeId)                                                                |
| GetDetailsPointAutocomplete  ()     | Получить подробную информацию о точке, |    AppMaps.Map.GetDetailsPointAutocomplete (point, type)                                                                |





#### `.Init(selector)`

Инициализация карты

```javascript
AppMaps.Init('map') //принимает в качестве аргумента селектор
```
#### `.ClearMap()`

Удалить все маркеры с карты

```javascript
AppMaps.Map.ClearMap.Init() //
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
### `.HideBaloon()`

Закрыть информационное окно

```javascript
AppMaps.Map.HideBaloon() // Принимает массив точек
```
### `.FitBounds()`

Закрыть информационное окно

```javascript
AppMaps.Map.FitBounds() // Масштабирует карту таким образом что-бы все добавленнеы точки были видны на карте
```
### `.RouteMap()`

Отобразить маршрут на карте

```javascript
AppMaps.Map.RouteMap(bool, start, end) // Построить и отобразить маршрут на карте от начальной до конечной точки
```
### `.RouteMap()`

Отобразить маршрут на карте

```javascript
AppMaps.Map.RouteMap(bool, start, end) // Построить и отобразить маршрут на карте от начальной до конечной точки
```
### `.SetZoomMin()`

Отобразить маршрут на карте

```javascript
AppMaps.Map.SetZoomMin() // Установить минимальный зоом
```
### `.MapDefOption()`

Выставить настройки карты по умолчанию

```javascript
AppMaps.Map.MapDefOption() // 
```
### `.GetDetailsPoint()`

Получить детальную информацию по точке на основе Google PlaceID

```javascript
AppMaps.Map.GetDetailsPoint(placeID) // принимает Google placeID
```

#### `.GetDetailsPointAutocomplete(point,type)`
