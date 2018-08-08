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
| Init  ()                       | принимает в качестве аргумента селектор                       |    AppMaps.Init('map') |
| ClearMap  ()                   | -                                                             |    AppMaps.ClearMap() |


#### `.Init(selector)`

Инициализация карты

```javascript
AppMaps.Init('map') //принимает в качестве аргумента селектор
```
#### `.ClearMap(selector)`

Удалить все маркеры с карты

```javascript
AppMaps.ClearMap.Init() //
```
