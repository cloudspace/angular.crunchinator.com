'use strict';

angular.module('crunchinatorApp.directives').directive('crListSelect', ['$rootScope', function($rootScope) {
    return {
        restrict: 'EA',
        scope: {
            items: '=',
            chartTitle: '@',
            selected: '@',
            total: '=',
            link: '=',
            count: '=',
            showSearch: '=',
            filterProperty: '@'
        },
        templateUrl: 'views/list-select.tpl.html',
        link: function(scope, element) {
            var parent = angular.element(element[0]).parent();
            element = angular.element(element[0]).find('.dataset');
            element.height(parent.height() - (scope.showSearch ? 120 : 65));

            scope.items = scope.items || [];
            scope.scrollItems = [];
            scope.selectedItems = [];
            scope.selectedShownItems = _.intersection(scope.selectedItems, scope.items);

            var set_initially = false;
            scope.$watch('items', function(){
                if(!set_initially && scope.items.length > 0) {

                    scope.selectedItems = _.filter(scope.items, function(item){
                        return _.include(scope.$parent.filterData[scope.selected], item.id);
                    });
                    set_initially = true;
                }

                scope.scrollItems = [];
                scope.selectedShownItems = _.intersection(scope.selectedItems, scope.items);
                //scope.$parent.filterData[scope.selected] = _.pluck(scope.selectedItems, 'id');
                scope.updateScrollItems();
            });

            scope.$parent.$watch('filterData.' + scope.filterProperty, function(newval) {
                if(newval.length === 0) {
                    scope.selectedItems = [];
                    scope.selectedShownItems = [];
                }
            });

            scope.selectItem = function(selectedItem) {
                selectedItem = selectedItem ? selectedItem : scope.selectedItem;
                if(!_.contains(scope.selectedItems, selectedItem)) {
                    scope.selectedItems.push(selectedItem);
                    element[0].scrollTop = 0;
                    scope.selectedItem = '';
                }

                scope.selectedShownItems = _.intersection(scope.selectedItems, scope.items);
                scope.$parent.filterData[scope.selected] = _.pluck(scope.selectedItems, 'id');
                $rootScope.$broadcast('filterAction');
            };

            scope.removeItem = function(item) {
                scope.selectedItems = _.without(scope.selectedItems, item);
                scope.selectedShownItems = _.intersection(scope.selectedItems, scope.items);
                scope.$parent.filterData[scope.selected] = _.pluck(scope.selectedItems, 'id');
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
