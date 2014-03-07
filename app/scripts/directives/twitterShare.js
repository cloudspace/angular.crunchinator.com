'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'twitterShare', [ '$location', '$window', 'Bitly',
    function ($location, $window, Bitly) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function(){
                    Bitly.shorten(encodeURIComponent($location.absUrl())).then(function(response){
                        var text = encodeURIComponent(
                            'Slice, filter & explore CrunchBase data with Crunchinator - A Cloudspace project.'
                        );
                        var shortened = encodeURIComponent(response.data);
                        var url = 'https://twitter.com/share?text='+text+'&url='+shortened;
                        $window.open(url, 'Twitter', 'width=575,height=400');
                    });
                });
            }
        };
    }
]);
