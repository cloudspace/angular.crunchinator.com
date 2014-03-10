'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'affix', [ '$window',
    function ( $window ) {
        return {
            restrict: 'A',
            controller: function($scope) {
                $scope.jQuery = $window.jQuery;
            },
            scope: {
                parent: '@',
                bottom: '@'
            },
            link: function (scope, element) {
                var top, bottom;
                var setAffixPoints = function(){
                    top = scope.jQuery(scope.parent).offset().top;
                    if(scope.bottom) {
                        bottom = scope.jQuery(scope.bottom).offset().top - scope.jQuery(window).height();
                    }
                };
                setAffixPoints();

                scope.$watch(function(){return scope.jQuery(document).height(); }, setAffixPoints);
                scope.$watch(function(){return scope.jQuery(window).height(); }, setAffixPoints);

                var config = {
                    offset: { top: function() { return top; } }
                };
                if(scope.bottom) {
                    config.offset.bottom = function(){
                        return scope.jQuery(scope.bottom).offset().top + scope.jQuery(window).height();
                    };
                }
                scope.jQuery(element[0]).affix(config);
            }
        };
    }
]);
