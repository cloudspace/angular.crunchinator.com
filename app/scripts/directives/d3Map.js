'use strict';

angular.module('crunchinatorApp.directives').directive('d3Map', ['$rootScope',
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
                function shadeColor(color, percent) {
                    var f=parseInt(color.slice(1),16),t=percent<0?0:255,
                        p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
                    return '#'+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+
                        (Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
                }
                scope.selected_states = [];
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.chart');

                var width = element[0].clientWidth;
                var height = parent.height() - 130;



                var projection = d3.geo.albersUsa()
                    .scale(width*1.4)
                    .translate([width / 2, height / 2]);

                var path = d3.geo.path()
                    .projection(projection);

                var svg = d3.select(element[0]).append('svg')
                    .attr('width', width)
                    .attr('height', height);

                var g = svg.append('g');

                // var colors = d3.scale.category20b();
                var fillFunction = function (countByCode) {
                    var max = _.max(countByCode, function(v) { return v; });
                    var scale = d3.scale.log();
                    scale.domain([1, max + 1]);

                    return function(d) {
                        var curr_count = countByCode[d.properties.postal] ? countByCode[d.properties.postal] + 1 : 1;
                        var per = 1 - scale(curr_count);
                        if(scope.selected_states.length > 0) {
                            if(_.contains(scope.selected_states, d.properties.postal)){
                                return shadeColor('#4682b4', per);
                            }
                            else {
                                return '#666';
                            }
                        }
                        else {
                            return shadeColor('#4682b4', per);
                        }
                    };
                };

                var clicked = function(d) {
                    scope.$parent.$apply(function(){
                        var state = d.properties.postal;
                        var state_selected = _.contains(scope.selected_states, state);
                        if(state_selected) {
                            scope.selected_states = _.without(scope.selected_states, state);
                        }
                        else {
                            scope.selected_states.push(state);
                        }
                        
                        scope.$parent[scope.selected] = scope.selected_states.slice(0);
                        g.selectAll('.state').attr('fill', fillFunction(scope.data));
                        $rootScope.$broadcast('filterAction');
                    });
                };

                d3.json('/data/us.json', function(error, us) {
                    g.selectAll('.state')
                        .data(topojson.feature(us, us.objects.states).features)
                        .enter().append('path')
                        .attr('fill', fillFunction(scope.data))
                        .attr('class', 'state')
                        .on('click', clicked)
                        .attr('d', path);

                    g.append('path')
                        .datum(topojson.mesh(us, us.objects.states))
                        .attr('d', path)
                        .attr('class', 'state-boundary');
                });


                scope.$watch('data', function(newval) {
                    return scope.render(newval);
                }, true);

                scope.render = function(countByStateCode) {
                    var fill = fillFunction(countByStateCode);
                    g.selectAll('.state').transition().duration(1000).attr('fill', fill);
                };
            }
        };
    }
]);