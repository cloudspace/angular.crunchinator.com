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
                            name: 'Slice, Filter & Explore Crunchbase Data',
                            link: response.data,
                            picture: 'http://staging.crunchinator.com/images/burner.jpg',
                            caption: '',
                            description: 'With Cloudspace\'s free Crunchinator tool, you can quickly identify all' +
                                'companies and investors based upon a variety of criteria, including geography, ' +
                                'fundraising amounts and exits.',
                            message: ''
                        });
                    });
                });
            }
        };
    }
]);
