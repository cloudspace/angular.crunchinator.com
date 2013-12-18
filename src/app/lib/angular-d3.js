angular.module('ngBoilerplate.crunchinator')
  .directive('d3Bars', function() {
    return {
      restrict: 'EA',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        var margin = { top: 20, right: 20, bottom: 15, left: 40 };
        var width = 470 - margin.left - margin.right;
        var height = 353 - margin.top - margin.bottom;

        var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis().scale(x).orient('bottom');
        var yAxis = d3.svg.axis().scale(y).orient('left').ticks(10, '%');

        var svg = d3.select(element[0]).append('svg')
                    .style('width', width + margin.left + margin.right + 'px')
                    .style('height', height + margin.top + margin.bottom + 'px')
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        
        window.onresize = function() {
          scope.$apply();
        };

        scope.$watch('data', function(newval, oldval) {
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

          x.domain(data.map(function(d) { return d.label; }));
          y.domain([0, d3.max(data, function(d) { return d.count; })]);

          var hoverVal, hoverLabel;

          svg.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) { return x(d.label); })
            .attr('width', x.rangeBand())
            .attr('y', function(d) { return y(d.count); })
            .attr('height', function(d) { return height - y(d.count); })
            .attr('fill', 'teal')
            // instead of using mouseenter/mouseout we should change this to use mousemove
            // and computationally figure out whether we're in a bar and show that value.
            .on('mouseenter', function(d) {
              if (hoverVal !== undefined) { hoverVal.remove(); hoverLabel.remove(); }
              hoverVal = svg.append('text')
                          .text(d.count)
                          .attr('text-anchor', 'middle')
                          .attr('x', x(d.label) + 17)
                          .attr('y', y(d.count) + 20)
                          .attr('fill', 'white');

              hoverLabel = svg.append('text')
                          .text(d.label)
                          .attr('text-anchor', 'middle')
                          .attr('x', x(d.label) + 17)
                          .attr('y', height + (margin.bottom * 0.85))
                          .style('font-size', '9px')
                          .attr('fill', 'teal');
            })
            .on('mouseout', function() {
              if (hoverVal !== undefined) {
                hoverVal.remove();
                hoverVal = undefined;
                hoverLabel.remove();
                hoverLabel = undefined;
              }
            });
        };
      }
    };
  });
