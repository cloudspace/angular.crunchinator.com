'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'fbShare', [ '$location', 'Bitly',
    function ($location, Bitly) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function(){
                    Bitly.shorten(encodeURIComponent($location.absUrl())).then(function(response){
                        FB.ui({
                            method: 'feed',
                            name: 'This is the name field',
                            link: response.data,
                            picture: 'http://staging.crunchinator.com/images/burner.jpg',
                            caption: 'This is the caption',
                            description: 'A description',
                            message: 'The message goes here.'
                        });
                    });
                });
            }
        };
    }
]);
