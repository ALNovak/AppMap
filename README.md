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
| Init  ()                       | принимает в качестве аргумента селектор  и тип карты                     |    AppMaps.Init("map","googl");                                                |
| ClearMap  ()                   | -                                                                        |    AppMaps.Map.ClearMap(); |
| SetPoints  ()                  | принимает в качестве аргумента массив точек                              |    ShowBaloon  (html,'coord')                                                 |
| ShowBaloon  (html,'coord')                 | принимает в качестве аргументов шаблон html  и объект Latitude Longitude                        |      


#### `.Init(selector)`

Инициализация карты

```javascript
AppMaps.Init('map') //принимает в качестве аргумента селектор
```
#### `.ClearMap()`

Удалить все маркеры с карты

```javascript
AppMaps.ClearMap.Init() //
```
