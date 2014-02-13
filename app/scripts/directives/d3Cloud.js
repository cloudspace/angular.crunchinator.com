'use strict';

angular.module('crunchinatorApp.directives').directive('d3Cloud', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                chartTitle: '@',
                selected: '@',
                total: '='
            },
            templateUrl: 'views/d3-cloud.tpl.html',
            link: function(scope, element) {
                var parent = angular.element(element[0]).parent();
                element = angular.element(element[0]).find('.cloud');
                var w = element.width();
                var h = parent.height() - 100;
                scope.selectedItems = [];

                var svg = d3.select(element[0]).append('svg').attr('width', w).attr('height', h);
                var background = svg.append('g');
                var vis = svg.append('g').attr('transform', 'translate(' + [w/2, h/2] + ')');

                window.onresize = function() {
                    scope.$apply();
                };

                scope.$watch('data', function() {
                    scope.selectedItems = _.select(scope.data, function(item){
                        return _.contains(_.pluck(scope.selectedItems, 'id'), item.id);
                    });
                    scope.$parent[scope.selected] = scope.selectedItems.slice(0);
                    return scope.render(scope.data);
                }, true);

                scope.render = function(categoryWordCloud) {
                    if(categoryWordCloud) {
                        var lowest_item = _.min(categoryWordCloud, function(c){
                            return c.count;
                        });
                        var lowest = lowest_item.count ? lowest_item.count : 0;
                        var highest_item = _.max(categoryWordCloud, function(c){
                            return c.count;
                        });
                        var highest = highest_item.count ? highest_item.count : 1;
                        if(highest === lowest) {lowest=0;}

                        d3.layout.cloud().size([w, h])
                            .words(categoryWordCloud.map(function(c) {
                                return {
                                    size: 14 + (50 * (c.count - lowest) / (highest - lowest)),
                                    text: c.display,
                                    obj: c
                                };
                            }))
                            .rotate(function() { return 0; })
                            .font('Impact')
                            .fontSize(function(d) { return d.size; })
                            .on('end', draw)
                            .start();
                    }
                };

                scope.toggleSelected = function(d) {
                    scope.$parent.$apply(function(){
                        var item = d.obj;
                        var item_selected = _.contains(scope.selectedItems, item);
                        if(item_selected) {
                            scope.selectedItems = _.without(scope.selectedItems, item);
                        }
                        else {
                            scope.selectedItems.push(item);
                        }

                        scope.$parent[scope.selected] = scope.selectedItems.slice(0);
                        $rootScope.$broadcast('filterAction');

                        vis.selectAll('text').style('fill', fill);
                    });
                };

                var colorfill = d3.scale.category20b();
                function fill(d){
                    if(scope.selectedItems.length === 0 || _.contains(_.pluck(scope.selectedItems, 'id'), d.obj.id)) {
                        return colorfill(d.text.toLowerCase());
                    }
                    else {
                        return '#666';
                    }
                }

                function draw(data) {
                    var words = data;
                    var text = vis.selectAll('text')
                        .data(words, function(d) { return d.text.toLowerCase(); });

                    text.transition()
                        .duration(1000)
                        .attr('transform', function(d) {
                            return 'translate(' + [d.x, d.y] + ')';
                        })
                        .style('font-size', function(d) { return d.size + 'px'; });

                    text.enter().append('text')
                        .attr('text-anchor', 'middle')
                        .attr('transform', function(d) {
                            return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
                        })
                        .style('font-size', function(d) { return d.size + 'px'; })
                        .style('opacity', 1e-6)
                        .on('click', scope.toggleSelected)
                        .transition()
                        .duration(1000)
                        .style('opacity', 1);

                    text.style('font-family', function(d) { return d.font; })
                        .style('fill', fill)
                        .style('cursor', 'pointer')
                        .text(function(d) { return d.text; });

                    var exitGroup = background.append('g')
                        .attr('transform', vis.attr('transform'));
                    var exitGroupNode = exitGroup.node();
                    text.exit().each(function() {
                        exitGroupNode.appendChild(this);
                    });
                    exitGroup.transition()
                        .duration(1000)
                        .style('opacity', 1e-6)
                        .remove();
                    vis.transition()
                        .delay(1000)
                        .duration(750)
                        .attr('transform', 'translate(' + [w/2, h/2] + ')');
                }
            }
        };
    }
]);