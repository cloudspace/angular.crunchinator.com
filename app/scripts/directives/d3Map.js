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
                function blendColors(c0, c1, p) {
                    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,
                        G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
                    return '#'+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*
                        0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
                }
                scope.selected_states = [];
                var centered;
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
                                return blendColors('#4682b4', '#ffffff', per);
                            }
                            else {
                                return blendColors('#818181', '#ffffff', per);
                            }
                        }
                        else {
                            return blendColors('#4682b4', '#ffffff', per);
                        }
                    };
                };

                var select = function(d) {
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

                var zoom = function(d) {
                  var x, y, k;

                  if (d && centered !== d) {
                    var centroid = path.centroid(d);
                    x = centroid[0];
                    y = centroid[1];
                    k = 3;
                    centered = d;
                  } else {
                    x = width / 2;
                    y = height / 2;
                    k = 1;
                    centered = null;
                  }

                  g.selectAll("path")
                      .classed("active", centered && function(d) { return d === centered; });

                  g.transition()
                      .duration(750)
                      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                      .style("stroke-width", 1.5 / k + "px");
                }

                d3.json('/data/us.json', function(error, us) {
                    g.selectAll('.state')
                        .data(topojson.feature(us, us.objects.states).features)
                        .enter().append('path')
                        .attr('fill', fillFunction(scope.data))
                        .attr('class', 'state')
                        .on('click.zoom', zoom)
                        //.on('click.select', select)
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
                    g.selectAll('.state')
                        .transition().duration(1000)
                        .attr('fill', fill);
                };
            }
        };
    }
]);