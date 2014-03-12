'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'twitterShare', ['$window',
    function ($window) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.on('click', function(){
                    var shortened = encodeURIComponent(scope.$parent.shortUrl);
                    var url = 'https://twitter.com/share?url='+shortened;
                    $window.open(url, 'Twitter', 'width=575,height=400');
                });
            }
        };
    }
]);
