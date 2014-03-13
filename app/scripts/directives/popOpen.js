'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'popOpen', [ '$window',
    function ($window) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var $element = angular.element(element);
                angular.element($window).bind('scroll', function(){
                    var elementOffset = $element.offset().top;
                    var viewable = this.pageYOffset + 375;
                    if(viewable >= elementOffset && viewable <= elementOffset + 250){
                        $element.removeClass('active').addClass('active');
                    }
                    else {
                        $element.removeClass('active');
                    }
                });
            }
        };
    }
]);
