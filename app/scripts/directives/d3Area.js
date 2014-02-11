'use strict';

angular.module('crunchinatorApp.directives').directive('d3Area', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                title: '@',
                extent: '@',
                selected: '@',
                format: '@',
                ranges: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html',
            link: function(scope, element) {
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');
                scope.format = scope.format || '%m/%Y';

                var area_fore, area_back;
                var margin = {top: 15, right: 20, bottom: 20, left: 20},
                width = element.width() - margin.left - margin.right,
                height = parent.height() - margin.top - margin.bottom - 130;

                var formatDate = d3.time.format(scope.format);

                var parseDate = formatDate.parse;
                var full_extent = [parseDate(scope.extent), new Date()];
                var x = d3.time.scale().range([0, width]);

                var y = d3.scale.linear().range([height, 0]);

                var time = scope.title.replace(/\s+/g, '-');

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');

                var area = d3.svg.area()
                    .x(function(d) { return x(d.parsed_date); })
                    .y0(height)
                    .y1(function(d) { return y(d.count); });

                var svg = d3.select(element[0]).append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                  .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                svg.append('clipPath')
                    .attr('id', 'clip-' + time)
                    .append('rect')
                    .attr('width', width)
                    .attr('height', height);

                svg.append('path')
                    .attr('class', 'background area');

                svg.append('path')
                    .attr('class', 'foreground area');

                scope.$watch('data', function(newval) {
                    if(newval) {
                        return scope.render(newval);
                    }
                }, true);

                function set_min_max(extent) {
                    var formatDate = function(date) {
                        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                    };

                    scope.min = formatDate(extent[0]);
                    scope.max = formatDate(extent[1]);
                }

                x.domain(full_extent);
                var brush = d3.svg.brush()
                    .x(x)
                    .extent(full_extent)
                    .on('brush', function() {
                        var extent = brush.extent();

                        svg.selectAll('#clip-' + time + ' rect')
                            .attr('x', x(extent[0]))
                            .attr('width', x(extent[1]) - x(extent[0]));

                        scope.$parent.$apply(function (){
                            set_min_max(extent);
                        });
                    })
                    .on('brushend', function(){
                        var extent = brush.extent();
                        if (extent[0].getTime() !== full_extent[0].getTime() || extent[1].getTime() !== full_extent[1].getTime()) {
                            scope.selectedItems = [extent[0], extent[1]];
                        } else {
                            scope.selectedItems = [];
                        }

                        scope.$parent.$apply(function() {
                            scope.$parent[scope.selected] = scope.selectedItems;
                            $rootScope.$broadcast('filterAction');
                        });
                    });


                var gBrush = svg.append('g')
                    .attr('class', 'brush')
                    .call(brush);

                gBrush.selectAll('rect')
                    .attr('height', height);

                gBrush.selectAll('.resize').append('path').attr('d', function(d) {
                    var e = +(d === 'e'),
                        x = e ? 1 : -1,
                        y = height / 3;
                    return 'M' + (0.5 * x) + ',' + y +
                        'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) +
                        'V' + (2 * y - 6) +
                        'A6,6 0 0 ' + e + ' ' + (0.5 * x) + ',' + (2 * y) +
                        'Z' +
                        'M' + (2.5 * x) + ',' + (y + 8) +
                        'V' + (2 * y - 8) +
                        'M' + (4.5 * x) + ',' + (y + 8) +
                        'V' + (2 * y - 8);
                });

                scope.render = function(data) {
                    data.forEach(function(d) {
                        d.parsed_date = parseDate(d.date);
                    });
                    data = _.sortBy(data, function(d){ return d.parsed_date; });

                    
                    y.domain([0, d3.max(data, function(d) { return d.count; })]);
                    

                    //svg.selectAll('g').remove();
                    
                    area_back = svg.selectAll('.background.area').datum(data)
                        .transition()
                        .duration(1000)
                        .attr('d', area)
                        .style('fill', '#ccc');

                    area_fore = svg.selectAll('.foreground.area').datum(data)
                        .transition()
                        .duration(1000)
                        .attr('d', area)
                        .style('fill', 'steelBlue');

                    svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(xAxis)
                        .style('fill', '#fff');

                    area_fore.attr('clip-path', 'url(#clip-' + time + ')');

                    set_min_max(brush.extent());
                };
            }
        };
    }
]);