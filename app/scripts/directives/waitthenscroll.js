'use strict';

angular.module('crunchinatorApp.directives').directive('waitThenScroll', function ($window) {
    return {
        restrict: 'A',
        scope: {
            shouldScroll: '=',
            scrollTo: '@'
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
                    scope.jQuery('html, body').animate({
                        scrollTop: scope.scrollTo //$(element[0]).offset().top
                    }, scrollSpeed, function() {
                        scope.isScrolling = false;
                    });
                }
            });
        }
    };
});
