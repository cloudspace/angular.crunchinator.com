'use strict';

angular.module('crunchinatorApp.directives').directive('listDisplay', function() {
    return {
        restrict: 'EA',
        scope: {
            data: '=',
            title: '@',
            total: '='
        },
        templateUrl: 'views/list-display.tpl.html',
        link: function(scope) {
            scope.data = scope.data || [];
            scope.scrollItems = [];
            scope.$watch('data', function(){
                scope.filteredItems = scope.data;
                scope.scrollItems = [];
                scope.updateScrollItems();
            });

            scope.updateScrollItems = function() {
                var next_items = [];
                var current_count = scope.scrollItems.length;
                var page_size = 100;
                next_items = scope.filteredItems.slice(current_count, current_count+page_size);
                scope.scrollItems = scope.scrollItems.concat(next_items);
            };
        }
    };
});
