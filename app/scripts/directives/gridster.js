'use strict';

angular.module('crunchinatorApp.directives').directive('gridster', [function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            var jQuery = window.jQuery || {};
            jQuery(element[0]).gridster({
                widget_margins: [10, 10],
                widget_base_dimensions: [265, 95],
                draggable: {
                    handle: '.drag-handle'
                }
            });
        }
    };
}]);