'use strict';

angular.module('crunchinatorApp.directives').directive('d3Area', ['$rootScope',
    function() {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                title: '@',
                selected: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html',
            link: function(scope, element) {
                element = angular.element(element[0]).find('.chart');
                var margin = {top: 15, right: 20, bottom: 20, left: 20},
                width = element.width() - margin.left - margin.right,
                height = 353 - margin.top - margin.bottom;

                var parseDate = d3.time.format('%m/%Y').parse;

                var x = d3.time.scale().range([0, width]);

                var y = d3.scale.linear().range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');

                // var yAxis = d3.svg.axis()
                //     .scale(y)
                //     .orient('left');

                var area = d3.svg.area()
                    .x(function(d) { return x(d.parsed_date); })
                    .y0(height)
                    .y1(function(d) { return y(d.count); });

                var svg = d3.select(element[0]).append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                  .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                svg.append('path');

                scope.$watch('data', function(newval) {
                    return scope.render(newval);
                }, true);

                scope.render = function(data) {
                    data.forEach(function(d) {
                        d.parsed_date = parseDate(d.date);
                    });
                    data = _.sortBy(data, function(d){ return d.parsed_date; });

                    x.domain(d3.extent(data, function(d) { return d.parsed_date; }));
                    y.domain([0, d3.max(data, function(d) { return d.count; })]);

                    svg.selectAll('g').remove();
                    
                    svg.selectAll('path').datum(data)
                        .transition()
                        .duration(1000)
                        .attr('d', area)
                        .style('fill', 'steelblue');

                    svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(xAxis)
                        .style('fill', '#fff');
                };
            }
        };
    }
]);