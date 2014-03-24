'use strict';

angular.module('crunchinatorApp.directives').directive('crWaitThenScroll', function ($window, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            shouldScroll: '=',
        },
        controller: function($scope) {
            $scope.isScrolling = false;
            $scope.jQuery = $window.jQuery;
        },
        link: function postLink(scope, element, iAttrs) {
            scope.$watch('shouldScroll', function(shouldScroll) {
                if (shouldScroll && !scope.isScrolling) {
                    var scrollSpeed = iAttrs.scrollSpeed || 1500;
                    scope.isScrolling = true;
                    scope.jQuery('#splash').animate({
                        height: 0,
                        'margin-bottom': 0
                    }, scrollSpeed, function() {
                        scope.isScrolling = false;
                        $rootScope.$broadcast('scrollFinish');
                    });
                }
            });
        }
    };
});
