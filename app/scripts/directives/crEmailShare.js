'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'crEmailShare', [ 'Analytics',
    function (Analytics) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function(){
                    Analytics.event('Social', 'Share', 'Email');
                    var shortened = encodeURIComponent(scope.$parent.shortUrl);
                    var link = 'mailto:?body='+shortened;
                    window.location.href = link;
                });
            }
        };
    }
]);
