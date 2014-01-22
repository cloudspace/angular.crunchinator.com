'use strict';

angular.module('crunchinatorApp.directives').directive('listSelect', ['$rootScope', function($rootScope) {
    return {
        restrict: 'EA',
        scope: {
            items: '=',
            title: '@',
            selected: '@',
            total: '=',
            link: '='
        },
        templateUrl: 'views/list-select.tpl.html',
        link: function(scope) {
            scope.items = scope.items || [];
            scope.selectedItems = [];
            scope.scrollItems = [];

            scope.$watch('items', function(){
                scope.scrollItems = [];
                scope.updateScrollItems();
            });

            scope.selectItem = function(selectedItem) {
                selectedItem = selectedItem ? selectedItem : scope.selectedItem;
                if(!_.contains(scope.selectedItems, selectedItem)) {
                    scope.selectedItems.push(selectedItem);
                    scope.selectedItem = '';
                }

                scope.$parent[scope.selected] = scope.selectedItems;
                $rootScope.$broadcast('filterAction');
            };

            scope.removeItem = function(item) {
                scope.selectedItems = _.without(scope.selectedItems, item);
                scope.$parent[scope.selected] = scope.selectedItems.slice(0);
                $rootScope.$broadcast('filterAction');
            };

            scope.updateScrollItems = function() {
                var next_items = [];
                var current_count = scope.scrollItems.length;
                var page_size = 100;
                next_items = scope.items.slice(current_count, current_count+page_size);
                scope.scrollItems = scope.scrollItems.concat(next_items);
            };

        }
    };
}]);