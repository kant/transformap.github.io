
/*var map = L.map('map-embed', {
    center: [30, -25],
    zoom: 3,
    scrollWheelZoom: false
});

var theme_colors = ["#fcec74", "#f7df05", "#f2bd0b", "#fff030", "#95D5D2", "#1F3050"];

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

var geojsonLayer = new L.layerGroup();

$.getJSON("//data.transformap.co/raw/5d6b9d3d32097fd68322008744001eec", function(data) {
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            var marker = L.circleMarker(latlng, {
                color: theme_colors[(Math.floor(Math.random() * 6) + 1)],
                radius: 5,
                weight: 7,
                opacity: .5,
                fillOpacity: 1,
            });
            return marker;
        },
        onEachFeature: createLayers
        });
    });

function createLayers(feature, featureLayer) {
	featureLayer.bindPopup('<div class="popup-heading"><a href="' + feature.properties.url + '" target="_blank">' + feature.properties.name + '</a></div><img src="/images/gardening.jpg"><p>' + feature.properties.concept + '</p><p><strong>Tags:</strong> urban gardening, community development, circular economy</p>' );
    geojsonLayer.addLayer(featureLayer);
}

geojsonLayer.addTo(map);*/

var MapModel = Backbone.Model.extend({});

var MapData = Backbone.Collection.extend({
    url:"//data.transformap.co/raw/5d6b9d3d32097fd68322008744001eec",
    parse: function(response){
        return response.features;
    },
    toJSON : function() {
      return this.map(function(model){ return model.toJSON(); });
    }
 });

var MapView = Backbone.View.extend({
    el: '#map-template',
    template: _.template($('#mapTemplate').html()),
    initialize: function(){
        this.$el.html(this.template());
        this.listenTo(this.collection, 'reset add change remove', this.render);
        this.collection.fetch();
    },
    render: function () {

        var map = L.map(this.$('#map-tiles')[0]).setView ([30, -25], 3);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        }).addTo(map);

        this.collection.each(function(model){
            var feature = model.toJSON();
            marker = new L.Marker(new L.LatLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]));     
            model.marker = marker;
            map.addLayer(marker);
        }, this); 
        
        return this;
    },
});

var mapData = new MapData();
var mapView = new MapView({ collection: mapData });


var FilterData = Backbone.Collection.extend({
    url:"/json/susy-taxonomy.json",
    parse: function(response){
        return response.results.bindings;
    },
    toJSON : function() {
      return this.map(function(model){ return model.toJSON(); });
    }
 });

var FilterView = Backbone.View.extend({
    el: '#map-filters',
    template: _.template($('#mapFiltersTemplate').html()),
    initialize: function(){
        this.listenTo(this.collection,"add", this.renderItem);
        this.collection.fetch();   
    },
    render: function () {
        this.collection.each(function(model){
             var filterItem = this.template(model.toJSON());
             this.$el.append(filterItem);
        }, this);        
        return this;
    },
    renderItem: function(model) {
         var filters = this.template(model.toJSON());
         console.log(model.toJSON().itemLabel.value);
         this.$el.append(filters);        
    }
});

var filterData = new FilterData();
var filterView = new FilterView({ collection: filterData });
filterView.render();