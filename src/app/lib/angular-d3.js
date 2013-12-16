angular.module('ngBoilerplate.crunchinator')
  .directive('d3Bars', function() {
    return {
      restrict: 'EA',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        var svg = d3.select(element[0]).append("svg").style('width', '100%');
        
        window.onresize = function() {
          scope.apply();
        };

        scope.$watch(function() {
          return angular.element(window)[0].innerWidth;
        }, function() {
          scope.render(scope.data);
        });

        scope.render = function(data) {
          console.log(data);
        };
      }
    };
  });
