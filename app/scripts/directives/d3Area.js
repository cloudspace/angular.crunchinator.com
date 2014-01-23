'use strict';

angular.module('crunchinatorApp.directives').directive('d3Area', ['$rootScope',
    function() {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                title: '@',
                selected: '@'
            },
            templateUrl: 'views/d3-area.tpl.html',
            link: function() {
                
            }
        };
    }
]);