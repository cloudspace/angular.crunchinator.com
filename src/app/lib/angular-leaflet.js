angular.module('ngBoilerplate.crunchinator')
  .directive('leafCluster', function() {
    return {
      restrict: 'EA',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        var cloudmade = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 15,
            zoom: 5,
            key: 'BC9A493B41014CAABB98F0471D759707'
          });
        var map = L.map(element[0]).addLayer(cloudmade);
        var markers = null;

        window.onresize = function() {
          scope.$apply();
        };

        scope.$watch("data", function(newval, oldval) {
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

          markers = L.markerClusterGroup();
          var geoJsonLayer = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
              layer.bindPopup(feature.properties.address);
            }
          });
          markers.addLayer(geoJsonLayer);


          map.addLayer(markers);
          map.fitBounds(markers.getBounds());
        };
      }
    };
  });