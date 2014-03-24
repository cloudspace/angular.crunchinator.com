'use strict';

angular.module('crunchinatorApp.directives').directive('crD3Area', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                chartTitle: '@',
                extent: '@',
                selected: '@',
                format: '@',
                ranges: '@',
                filterProperty: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html',
            link: function(scope, element) {
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');
                scope.format = scope.format || '%m/%Y';

                var area_fore, area_back;
                var margin = {top: 10, right: 42, bottom: 20, left: 42},
                width = element.width() - margin.left - margin.right,
                height = parent.height() - margin.top - margin.bottom - 70;

                var formatDate = d3.time.format(scope.format);

                var parseDate = formatDate.parse;
                var full_extent = [parseDate(scope.extent), new Date()];
                var x = d3.time.scale().range([0, width]);
                var y = d3.scale.linear().range([height, 0]);

                var time = Math.floor(Math.random()*1e10);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .tickFormat(d3.time.format('\'%y'))
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

                svg.append('g')
                    .attr('class', 'x axis');

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

                    svg.selectAll('.resize.e').selectAll('.range_text').text(scope.max);
                    svg.selectAll('.resize.w').selectAll('.range_text').text(scope.min);

                    // gBrush.selectAll('.resize.e .range').attr('transform', 'translate(-74,30)');
                    // gBrush.selectAll('.resize.w .range').attr('transform', 'translate(0,30)');
                }

                x.domain(full_extent);
                var initial_extent = full_extent;
                if(scope.$parent.filterData[scope.selected].length > 0) {
                    initial_extent = scope.$parent.filterData[scope.selected];

                    svg.selectAll('#clip-' + time + ' rect')
                            .attr('x', x(initial_extent[0]))
                            .attr('width', x(initial_extent[1]) - x(initial_extent[0]));
                }
                var brush = d3.svg.brush()
                    .x(x)
                    .extent(initial_extent)
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
                        if(!_.isEqual(extent, lastExtent)){
                            if (!_.isEqual(extent, full_extent)) {
                                scope.selectedItems = [extent[0], extent[1]];
                            } else {
                                scope.selectedItems = [];
                            }

                            scope.$parent.$apply(function() {
                                scope.$parent.filterData[scope.selected] = scope.selectedItems;
                                $rootScope.$broadcast('filterAction');
                            });
                        }

                        lastExtent = extent;
                    });

                var lastExtent = brush.extent();
                var gBrush = svg.append('g')
                    .attr('class', 'brush')
                    .call(brush);

                gBrush.selectAll('rect')
                    .attr('height', height);

                //Blue lines on left and right of range selection
                gBrush.selectAll('.resize').append('rect')
                    .attr('class', 'limit')
                    .attr('height', height - 35)
                    .attr('transform', 'translate(0,35)')
                    .attr('width', 1);

                //Boxes surrounding range selection text
                gBrush.selectAll('.resize').append('rect')
                    .attr('class', 'range')
                    .attr('height', 20).attr('width', 74)
                    .attr('transform', 'translate(-37,30)')
                    .attr('rx', 5).attr('ry', 5);


                //Range selection text showing current selection
                gBrush.selectAll('.resize').append('text')
                    .attr('class', 'range_text')
                    .attr('transform', 'translate(0,45)');

                //Circles used as selection handles
                gBrush.selectAll('.resize').append('circle')
                    .attr('class', 'handle')
                    .attr('transform', 'translate(0,' + height + ')')
                    .attr('r', 5);

                scope.render = function(data) {
                    data.forEach(function(d) {
                        d.parsed_date = parseDate(d.date);
                    });
                    data = _.sortBy(data, function(d){ return d.parsed_date; });


                    y.domain([0, d3.max(data, function(d) { return d.count; })]);

                    area_back = svg.selectAll('.background.area').datum(data)
                        .transition()
                        .duration(1000)
                        .attr('d', area)
                        .style('fill', '#374D5D');

                    area_fore = svg.selectAll('.foreground.area').datum(data)
                        .transition()
                        .duration(1000)
                        .attr('d', area)
                        .style('fill', '#67BEFD');

                    svg.selectAll('.x.axis')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(xAxis)
                        .style('fill', '#fff');

                    area_fore.attr('clip-path', 'url(#clip-' + time + ')');

                    set_min_max(brush.extent());
                };

                var initial_load = true;
                scope.$parent.$watch('filterData.' + scope.filterProperty, function(newval) {
                    if (newval.length === 0 && !initial_load) {
                        svg.selectAll('#clip-' + time + ' rect')
                            .attr('x', x(full_extent[0]))
                            .attr('width', x(full_extent[1]) - x(full_extent[0]));

                        brush.extent(full_extent);
                        gBrush.call(brush);
                        set_min_max(brush.extent());
                        lastExtent = full_extent;
                    } else if (initial_load && newval.length > 0) {
                        var extent = scope.$parent.filterData[scope.selected];
                        svg.selectAll('#clip-' + time + ' rect')
                            .attr('x', x(extent[0]))
                            .attr('width', x(extent[1]) - x(extent[0]));

                        brush.extent(extent);
                        gBrush.call(brush);
                        set_min_max(brush.extent());
                        lastExtent = extent;
                        initial_load = false;
                    }
                });
            }
        };
    }
]);
