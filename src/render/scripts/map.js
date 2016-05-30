
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

var theme_colors = ["#fcec74", "#f7df05", "#f2bd0b", "#fff030", "#95D5D2", "#1F3050"];

var MapModel = Backbone.Model.extend({});

var MapData = Backbone.Collection.extend({
    url:"/json/sample-data.json", // //data.transformap.co/raw/5d6b9d3d32097fd68322008744001eec",
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
        var map = L.map(this.$('#map-tiles')[0], { scrollWheelZoom: false }).setView ([51.1657, 10.4515], 6);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        }).addTo(map);

        this.collection.each(function(model){
            var feature = model.toJSON();
            //marker = new L.Marker(new L.LatLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]));

            var marker = L.circleMarker(new L.LatLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]), {
                color: theme_colors[(Math.floor(Math.random() * 6) + 1)],
                radius: 5,
                weight: 7,
                opacity: .5,
                fillOpacity: 1,
            });

            model.marker = marker;

            marker.bindPopup('<div class="popup-heading"><a href="' + feature.properties.url + '" target="_blank">' + feature.properties.name + '</a></div><img src="/images/gardening.jpg"><p>' + feature.properties.concept + '</p><p><strong>Tags:</strong> urban gardening, community development, circular economy</p>');

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

var subcategories = [];

var FilterView = Backbone.View.extend({
    el: '#map-filters',
    template: _.template($('#mapFiltersTemplate').html()),
    initialize: function(){
        this.listenTo(this.collection,"add", this.renderItem);
        this.collection.fetch();   
    },
    render: function () {
        this.collection.each(function(model){
            var filter = model.toJSON();
            if(filter.subclass_of.value == 'Q1234#SSEDAS_TAX_UUID') {
                this.$el.append(this.template(filter));
            }
        }, this);        
        return this;
    },
    events: {
        "click .category": "clicked"
    },
    clicked: function(e){
        e.preventDefault();
        $(e.currentTarget).find('ul').slideToggle(400);
    },
    renderItem: function(model) {
        var filter = model.toJSON();
        if(filter.subclass_of.value == 'Q1234#SSEDAS_TAX_UUID') {
            subcategories.push(filter.item.value);
            this.$el.append(this.template(filter));
        }
        for(i = 0; i < subcategories.length; i++) {
            if(filter.subclass_of.value == subcategories[i]) {
                var subCatId = '#' + subcategories[i];
                $(subCatId).append('<li class="list-group-item subcategory">' + filter.itemLabel.value + '</li>');
            }
        }
    }
});

$('.category').on('click', function () {
    $category = $(e);
    $category.find('.subcategory').slideToggle(400);
});

var filterData = new FilterData();
var filterView = new FilterView({ collection: filterData });
filterView.render();