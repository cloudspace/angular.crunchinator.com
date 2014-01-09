'use strict';

angular.module('crunchinatorApp.directives').directive('leafCluster', function() {
    return {
        restrict: 'EA',
        scope: {
            data: '='
        },
        link: function(scope, element) {
            L.Icon.Default.imagePath = '/vendor/leaflet-dist/images';
            var cloudmade = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 15,
                zoom: 5
            });
            var map = L.map(element[0]).addLayer(cloudmade);
            var markers = null;

            window.onresize = function() {
                scope.$apply();
            };

            scope.$watch('data', function(newval) {
                return scope.render(newval);
            }, true);


            scope.$watch(function() {
                return angular.element(window)[0].innerWidth;
            }, function() {
                scope.render(scope.data);
            });

            scope.render = function(data) {
                if(markers) {
                    map.removeLayer(markers);
                }

                markers = L.markerClusterGroup({
                    showCoverageOnHover: false,
                    iconCreateFunction: function(cluster){
                        return new L.DivIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster marker-cluster-small', iconSize: new L.Point(40, 40) });
                    }
                });
                var geoJsonLayer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup(feature.properties.address);
                    }
                });
                markers.addLayer(geoJsonLayer);
                map.addLayer(markers);

                if(data.features.length > 0) {
                    map.fitBounds(markers.getBounds());
                }
            };
        }
    };
});
