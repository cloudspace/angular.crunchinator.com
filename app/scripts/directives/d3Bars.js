'use strict';

// We need to discuss moving these 'utility' functions to a depedency we can inject
// since they are needed across services and directives.
function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ['', 'K', 'M', 'B','T'];
        var suffixNum = Math.floor( ((''+value).length -1)/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum !== 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 3) { break; }
        }

        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
}

function labelfy(num) {
    return '$' + abbreviateNumber(num);
}

angular.module('crunchinatorApp.directives').directive('d3Bars', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                title: '@',
                selected: '@',
                ranges: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html',
            link: function(scope, element) {
                scope.selectedItems = [];
                scope.$parent[scope.selected] = [];
                scope.oldFilterData = {};
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');

                var bars_fore, bars_back, range;
                var margin = {top: 0, right: 10, bottom: 20, left: 0};
                var width = element.width() - margin.left - margin.right;
                var height = parent.height() - margin.top - margin.bottom - 124;

                var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
                var y = d3.scale.linear().range([height, 0]);
                var id = scope.title.replace(/\s+/g, '-');
                
                var svg = d3.select(element[0]).append('svg')
                    .style('width', width + margin.left + margin.right + 'px')
                    .style('height', height + margin.top + margin.bottom + 'px')
                    .style('margin', '0 auto')
                    .style('display', 'block')
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                svg.append('clipPath')
                    .attr('id', 'clip-' + id)
                    .append('rect')
                    .attr('width', width)
                    .attr('height', height);

                var set_min_max = function(extent) {
                    range = [Infinity, -Infinity];

                    bars_fore.each(function(d) {
                        var point = x(d.label);
                        if(extent[0] <= point && point <= extent[1]) {
                            if (d.start < range[0]) {
                                range[0] = d.start;
                            }

                            if (d.end > range[1]) {
                                range[1] = d.end;
                            }
                        }
                    });

                    scope.min = labelfy(range[0]);
                    scope.max = labelfy(range[1]);
                }

                var brush = d3.svg.brush()
                    .x(x)
                    .extent([10, width])
                    .on('brush', function() {
                        var extent = brush.extent();

                        svg.selectAll('#clip-' + id + ' rect')
                            .attr('x', extent[0])
                            .attr('width', extent[1] - extent[0]);

                        scope.$parent.$apply(function() {
                            set_min_max(extent);
                        });
                    })
                    .on('brushend', function() {
                        scope.selectedItems = range;

                        scope.$parent.$apply(function() {
                            if(scope.oldFilterData !== $rootScope.filterData) {
                                scope.$parent[scope.selected] = scope.selectedItems;
                                $rootScope.$broadcast('filterAction');
                            }
                        });
                    });

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
                    if(!data) { return; }

                    bars_back = svg.selectAll('.background.bar').data(data);
                    bars_back.enter().append('rect');

                    bars_fore = svg.selectAll('.foreground.bar').data(data);
                    bars_fore.enter().append('rect');

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

                    bars_fore.attr('class', 'foreground bar')
                        .attr('x', function(d) { return x(d.label); })
                        .attr('width', x.rangeBand())
                        .style('fill', 'steelBlue')
                        .transition()
                        .duration(1000)
                        .attr('height', function(d) { return height - y(d.count); })
                        .attr('y', function(d) { return y(d.count); });

                    bars_back.attr('class', 'background bar')
                        .attr('x', function(d) { return x(d.label); })
                        .attr('width', x.rangeBand())
                        .style('fill', '#ccc')
                        .transition()
                        .duration(1000)
                        .attr('height', function(d) { return height - y(d.count); })
                        .attr('y', function(d) { return y(d.count); });

                    bars_fore.attr('clip-path', 'url(#clip-' + id + ')');

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

                    set_min_max(brush.extent());
                };
            }
        };
    }
]);
