angular.module('crunchinatorApp')
  .directive('d3Bars', function() {
    return {
      restrict: 'EA',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        var margin = 20;
        var barHeight = 20;
        var barPadding = 1;

        var svg = d3.select(element[0])
          .append("svg")
          .attr('width', '100%');

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
          svg.selectAll('*').remove();

          if(!data) { return; }

          var width = d3.select(element[0])[0][0].offsetWidth - margin;
          var height = scope.data.length * (barHeight + barPadding);
          var max = d3.max(data, function(d) { return d.count; });

          svg.attr('height', height);

          svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function(d, i) {
              return i * (barHeight + barPadding);
            })
            .attr('y', function(d, i) {
              var calculatedOutput = Math.round((d.count / max) * 100);
              return !isNaN(calculatedOutput) ? height - calculatedOutput : 0;
            })
            .attr('width', barHeight)
            .attr('height', function(d, i) {
              var calculatedOutput = Math.round((d.count / max) * 100);
              return !isNaN(calculatedOutput) ? calculatedOutput : 0;
            })
            .attr('fill', 'teal');

          svg.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .text(function(d) {
              return d.count;
            })
            .attr('text-anchor', 'middle')
            .attr('x', function(d, i) {
              console.log(i * (barHeight + barPadding));
              return i * (barHeight + barPadding) + 10;
            })
            .attr('y', function(d, i) {
              var calculatedOutput = Math.round((d.count / max) * 100);
              return height - calculatedOutput + 13;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr('fill', 'white');
        };
      }
    };
  });
