'use strict';

angular.module('crunchinatorApp.directives').directive('listSelect', ['$rootScope', function($rootScope) {
    return {
        restrict: 'EA',
        scope: {
            items: '=',
            title: '@',
            selected: '@'
        },
        templateUrl: 'views/list-select.tpl.html',
        link: function(scope) {
            scope.selectedItems = [];

            scope.selectItem = function() {
                if(!_.contains(scope.selectedItems, scope.selectedItem)) {
                    scope.selectedItems.push(scope.selectedItem);
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

        }
    };
}]);