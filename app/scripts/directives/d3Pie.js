'use strict';

angular.module('crunchinatorApp.directives').directive('crD3Pie', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                chartTitle: '@',
                selected: '@',
                filterProperty: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html',
            link: function(scope, element) {
                scope.selectedItems = scope.$parent.filterData[scope.selected].slice(0);
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');

                var width = element[0].clientWidth;
                var height = parent.height() - 70;
                var radius = (Math.min(width, height) / 2) - 20;
                var color = function(slice){
                    return {
                        deadpooled: '#caeafc',
                        acquired: '#36b0f1',
                        IPOed: '#0096ed',
                        alive: '#8acff7'
                    }[slice];
                };
                var path, ticks, labels;

                var arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.count; });

                var svg = d3.select(element[0])
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

                var fill = function (d) {
                    if(scope.selectedItems.length === 0 || _.contains(scope.selectedItems, d.data.label)) {
                        return color(d.data.label);
                    } else {
                        return '#666';
                    }
                };

                window.onresize = function() {
                    scope.$apply();
                    $rootScope.$broadcast('filterAction');
                };

                var initial_load = true;
                scope.$parent.$watch('filterData.' + scope.filterProperty, function(newval) {
                    if(newval.length === 0 && !initial_load) {
                        scope.selectedItems = [];
                        svg.selectAll('path').style('fill', fill);
                    } else if (newval.length > 0 && initial_load) {
                        scope.selectedItems = scope.$parent.filterData[scope.selected].slice(0);
                        svg.selectAll('path').style('fill', fill);
                        initial_load = false;
                    }
                });

                scope.$watch('data', function(data) {
                    if(!path && data.length > 0) {
                        path = svg.selectAll('path')
                            .data(pie(data))
                            .enter().append('path')
                            .attr('fill', function(d) { return fill(d); })
                            .attr('d', arc)
                            .each(function(d) { this._current = d; });

                        path.on('click', function(d) {
                            d = d.data;
                            scope.$parent.$apply(function() {
                                if(!_.contains(scope.selectedItems, d.label)) {
                                    scope.selectedItems.push(d.label);
                                } else {
                                    var index = scope.selectedItems.indexOf(d.label);
                                    scope.selectedItems.splice(index, 1);
                                }
                                svg.selectAll('path').style('fill', fill);
                                scope.$parent.filterData[scope.selected] = scope.selectedItems.slice(0);
                                $rootScope.$broadcast('filterAction');
                            });
                        });

                        ticks = svg.selectAll('line').data(pie(data)).enter().append('line');

                        ticks.attr('x1', 0)
                            .attr('x2', 0)
                            .attr('y1', -radius + 4)
                            .attr('y2', -radius - 2)
                            .attr('stroke', 'gray')
                            .attr('transform', function(d) {
                                return 'rotate(' + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ')';
                            });

                        labels = svg.selectAll('text').data(pie(data)).enter().append('text');

                        labels.attr('class', 'value')
                            .attr('transform', function(d) {
                                var dist = radius + 15;
                                var winkel = (d.startAngle + d.endAngle) / 2;
                                var x = dist * Math.sin(winkel);
                                var y = -dist * Math.cos(winkel);
                                return 'translate(' + x + ',' + y + ')';
                            })
                            .attr('dy', '0.35em')
                            .attr('text-anchor', 'middle')
                            .text(function(d){
                                // this needs to be removed when 'alive' is changed to 'active' on the backend.
                                return d.data.label === 'alive' ? 'active' : d.data.label;
                            })
                            .style('fill', '#fff');
                    } else {
                        return scope.render(data);
                    }
                }, true);

                scope.render = function(data) {
                    if(!data || data.length === 0) { return; }
                    path = path.data(pie(data));

                    path.transition().duration(1000).attrTween('d', function(a) {
                        var i = d3.interpolate(this._current, a);
                        var k = d3.interpolate(arc.outerRadius()(), radius - 10);

                        this._current = i(0);
                        return function(t) {
                            return arc.outerRadius(k(t))(i(t));
                        };
                    });

                    ticks = ticks.data(pie(data));

                    // If a tick does not have an associated value with it, hide it.
                    ticks.classed('hidden', function(d) { return (d.value === 0 ); });

                    ticks.transition().duration(1000)
                        .attr('transform', function(d) {
                            return 'rotate(' + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ')';
                        });

                    labels = labels.data(pie(data));

                    // If a label does not have an associated value with it, hide it.
                    labels.classed('hidden', function(d) { return (d.value === 0 ); });

                    labels.transition().duration(1000)
                        .attr('transform', function(d) {
                            var dist = radius + 15;
                            var val = (d.startAngle + d.endAngle) / 2;
                            var x = dist * Math.sin(val);
                            var y = -dist * Math.cos(val);
                            return 'translate(' + x + ',' + y + ')';
                        });
                };
            }
        };
    }
]);
