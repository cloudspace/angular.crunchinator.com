'use strict';

angular.module('crunchinatorApp.directives').directive('listToggle', function() {
    return {
        restrict: 'EA',
        scope: {
            items: '=',
            title: '@',
            total: '=',
            selected: '@'
        },
        templateUrl: 'views/list-toggle.tpl.html',
        link: function(scope) {
            scope.selectedItems = [];

            scope.toggleSelected = function(item) {
                var item_selected = _.contains(scope.selectedItems, item);
                if(item_selected) {
                    scope.selectedItems = _.without(scope.selectedItems, item);
                }
                else {
                    scope.selectedItems.push(item);
                }

                scope.$parent[scope.selected] = scope.selectedItems.slice(0);
            };
        }
    };
});