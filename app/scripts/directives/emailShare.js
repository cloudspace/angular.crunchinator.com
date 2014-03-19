'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'emailShare', [
    function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function(){
                    ga('send', 'event', 'Social', 'Share', 'Email');
                    var shortened = encodeURIComponent(scope.$parent.shortUrl);
                    var link = 'mailto:?body='+shortened;
                    window.location.href = link;
                });
            }
        };
    }
]);
