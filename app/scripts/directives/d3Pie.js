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
            templateUrl: 'views/d3-bars.tpl.html',
            link: function(scope, element) {
            	element = angular.element(element[0]).find('.pie');

            	var width = element[0].clientWidth;
            	var height = 320;
            	var radius = Math.min(width, height) / 2;

            	scope.selectedItems = [];

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
                };

                scope.$watch('data', function(newval) {
                    return scope.render(newval);
                }, true);

                scope.render = function(data) {

                };
            }
        };
    }
]);
