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
                
                var top = scope.jQuery(scope.parent).offset().top;
                if(scope.bottom) {
                    var bottom = scope.jQuery(scope.bottom).offset().top - scope.jQuery(window).height();
                }

                scope.jQuery(window).resize(function() {
                    top = scope.jQuery(scope.parent).offset().top;
                    if(scope.bottom) {
                        bottom = scope.jQuery(scope.bottom).offset().top - scope.jQuery(window).height();
                    }
                });

                var config = {
                    offset: { top: function() { return top; } }
                };
                if(scope.bottom) {
                    config.offset.bottom = function(){
                        // var windowHeight = scope.jQuery(window).height();
                        // var bottomHeight = scope.jQuery(scope.bottom).offset.top();
                        return scope.jQuery(scope.bottom).offset().top;
                    };
                }

                // config = {
                //     offset: {
                //         top: 400,
                //         bottom: 2000
                //     }
                // }

                scope.jQuery(element[0]).affix(config);
            }
        };
    }
]);
