'use strict';

angular.module('crunchinatorApp.directives').directive('d3Bars', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                title: '@',
                selected: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html',
            link: function(scope, element) {
                scope.selectedItems = [];
                scope.$parent[scope.selected] = [];
                scope.oldFilterData = {};
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');

                var margin = {top: 0, right: 10, bottom: 20, left: 0};
                var width = element.width() - margin.left - margin.right;
                var height = parent.height() - margin.top - margin.bottom - 124;

                var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
                var y = d3.scale.linear().range([height, 0]);

                
                var svg = d3.select(element[0]).append('svg')
                    .style('width', width + margin.left + margin.right + 'px')
                    .style('height', height + margin.top + margin.bottom + 'px')
                    .style('margin', '0 auto')
                    .style('display', 'block')
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
                    //svg.selectAll('*').remove();
                    if(!data) { return; }
                    var bars = svg.selectAll('.bar').data(data);
                    bars.enter().append('rect');

                    var labels = _.pluck(data, 'label');
                    var labelsToDisplay = [];
                    for(var i = 0; i < labels.length; i++) {
                        var label = labels[i];

                        if(i % 2 === 0){
                            labelsToDisplay.push(label);
                        }
                    }

                    var xAxis = d3.svg.axis().scale(x).tickValues(labelsToDisplay).orient('bottom');

                    x.domain(data.map(function(d) { return d.label; }));
                    y.domain([0, d3.max(data, function(d) { return d.count; })]);

                    svg.selectAll('g').remove();
                    svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(' + Math.floor(x.rangeBand() / 2) + ', ' + height + ')')
                        .call(xAxis);

                    svg.selectAll('text').style('fill', '#fff');


                    var fill = function (d) {
                        if(_.contains(_.pluck(scope.selectedItems, 'label'), d.label)) {
                            return 'brown';
                        } else {
                            return 'steelblue';
                        }
                    };


                    bars.attr('class', 'bar')
                        .attr('x', function(d) { return x(d.label); })
                        .attr('width', x.rangeBand())
                        .style('fill', fill)
                        .transition()
                        .duration(1000)
                        .attr('height', function(d) { return height - y(d.count); })
                        .attr('y', function(d) { return y(d.count); });
                        
                    var brush = d3.svg.brush()
                        .x(x)
                        .extent([0, width])
                        .on('brush', function() {
                            scope.selectedItems = [];

                            bars.each(function(d) {
                                var extent = brush.extent();
                                var point = x(d.label);
                                if(extent[0] <= point && point <= extent[1]) {
                                    scope.selectedItems.push(d);
                                }
                            });

                            svg.selectAll('.bar').style('fill', fill);

                            scope.$parent.$apply(function() {
                                scope.$parent[scope.selected] = scope.selectedItems.slice(0);

                                if(scope.oldFilterData !== $rootScope.filterData) {
                                    $rootScope.$broadcast('filterAction');
                                }
                            });
                        });

                    var gBrush = svg.append('g')
                        .attr('class', 'brush')
                        .call(brush);

                    gBrush.selectAll('rect')
                        .attr('height', height);

                    bars.on('click', function(d) {
                        scope.$parent.$apply(function() {
                            if(!_.contains(_.pluck(scope.selectedItems, 'label'), d.label)) {
                                scope.selectedItems.push(d);
                            } else {
                                var index = scope.selectedItems.indexOf(d);
                                scope.selectedItems.splice(index, 1);
                            }
                            svg.selectAll('.bar').style('fill', fill);
                            scope.$parent[scope.selected] = scope.selectedItems.slice(0);
                            $rootScope.$broadcast('filterAction');
                        });
                    });
                };
            }
        };
    }
]);
