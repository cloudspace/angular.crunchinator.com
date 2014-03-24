'use strict';

angular.module('crunchinatorApp.directives').directive('crPlaceholder',
    function() {
        return {
            restrict: 'EA',
            scope: {
                chartTitle: '@',
                placeholderText: '@'
            },
            templateUrl: 'views/d3-chart.tpl.html'
        };
    }
);
