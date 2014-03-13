'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'popOpen', [ '$window',
    function ($window) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var $element = angular.element(element);
                angular.element($window).bind('scroll', function(){
                    var elementOffset = $element.offset().top;
                    var pageOffset = this.pageYOffset;

                    var activeZoneTop = elementOffset - 500;
                    if(pageOffset > activeZoneTop){
                        $element.addClass('active');
                    }
                });
            }
        };
    }
]);
