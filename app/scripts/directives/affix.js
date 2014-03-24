'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'crAffix', [
    function () {
        return {
            restrict: 'A',
            scope: {
                parent: '@',
                bottom: '@'
            },
            link: function (scope, element) {
                var top, bottom;
                var setAffixPoints = function(){
                    top = angular.element(scope.parent).offset().top;
                    if(scope.bottom) {
                        var docHeight = angular.element(document).height();
                        var botOffset = angular.element(scope.bottom).offset().top;
                        var winHeight = angular.element(window).height();
                        bottom = docHeight - botOffset + winHeight ;
                    }
                };
                setAffixPoints();

                scope.$watch(function(){ return angular.element(document).height(); }, setAffixPoints);
                scope.$watch(function(){ return angular.element(window).height(); }, setAffixPoints);

                var config = {
                    offset: { top: function() { return top; } }
                };
                if(scope.bottom) {
                    config.offset.bottom = function(){

                        return bottom;
                    };
                }

                angular.element(element[0]).affix(config);

            }
        };
    }
]);
