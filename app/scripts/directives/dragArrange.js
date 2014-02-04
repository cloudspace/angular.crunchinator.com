'use strict';

angular.module('crunchinatorApp.directives').directive('dragArrange', [function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            var jQuery = window.jQuery || {};
            jQuery(element[0]).shapeshift({
                minColumns: 3,
                handle: '.drag-handle'
            });
        }
    };
}]);