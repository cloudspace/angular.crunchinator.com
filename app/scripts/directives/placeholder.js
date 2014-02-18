'use strict';

angular.module('crunchinatorApp.directives').directive('placeholder', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'EA',
            scope: {
                chartTitle: '@',
                placeholderText: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html'
        };
    }
]);