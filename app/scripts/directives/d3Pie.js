'use strict';

angular.module('crunchinatorApp.directives').directive('d3Pie', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                title: '@',
                selected: '@'
            },
            templateUrl: 'views/d3-pie.tpl.html',
            link: function(scope, element) {
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.pie');

                var width = element[0].clientWidth;
                var height = parent.height() - 124;
                var radius = (Math.min(width, height) / 2) - 20;
                var color = d3.scale.category20b();
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

                window.onresize = function() {
                    scope.$apply();
                    $rootScope.$broadcast('filterAction');
                };

                scope.$watch('data', function(data) {
                    if(!path) {
                        path = svg.selectAll('path')
                            .data(pie(data))
                            .enter().append('path')
                            .attr('fill', function(d) { return color(d.data.label); })
                            .attr('d', arc)
                            .each(function(d) { this._current = d; });


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
                                return d.data.label;
                            })
                            .style('fill', '#fff');
                    } else {
                        return scope.render(data);
                    }
                }, true);

                scope.render = function(data) {
                    if(!data) { return; }

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

                    ticks.transition().duration(1000)
                        .attr('transform', function(d) {
                            return 'rotate(' + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ')';
                        });

                    labels = labels.data(pie(data));

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
