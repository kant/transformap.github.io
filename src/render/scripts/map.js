var map = L.map('map', {
    center: [30, -25],
    zoom: 3,
    scrollWheelZoom: false
});

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

var geojsonLayer = new L.layerGroup();

$.getJSON("//data.transformap.co/raw/5d6b9d3d32097fd68322008744001eec", function(data) {
	console.log(data);
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            var marker = L.marker(latlng);
            console.log(latlng);
            return marker;
        },
        onEachFeature: createLayers
        });
    });

function createLayers(feature, featureLayer) {
	featureLayer.bindPopup('<strong>' + feature.properties.name + '</strong><p>' + feature.properties.concept + '</p><a href="' + feature.properties.url + '"">' + feature.properties.url + '</a>' );
    geojsonLayer.addLayer(featureLayer);
}

geojsonLayer.addTo(map);