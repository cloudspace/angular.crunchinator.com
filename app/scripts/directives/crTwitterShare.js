'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'crTwitterShare', ['$window', 'Analytics',
    function ($window, Analytics) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.on('click', function(){
                    Analytics.event('Social', 'Share', 'Twitter');
                    var shortened = encodeURIComponent(scope.$parent.shortUrl);
                    var url = 'https://twitter.com/share?url='+shortened;
                    $window.open(url, 'Twitter', 'width=575,height=400');
                });
            }
        };
    }
]);
