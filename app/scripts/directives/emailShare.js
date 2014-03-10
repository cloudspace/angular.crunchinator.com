'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'emailShare', [ '$location', 'Bitly',
    function ($location, Bitly) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function(){

                    Bitly.shorten(encodeURIComponent($location.absUrl())).then(function(response){
                        var shortened = encodeURIComponent(response.data);
                        var link = 'mailto:?body='+shortened;
                        window.location.href = link;
                    });
                });
            }
        };
    }
]);
