'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'crFbShare', [ 'Analytics',
    function (Analytics) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function(){
                    Analytics.event('Social', 'Share', 'Facebook');
                    FB.ui({
                        method: 'feed',
                        name: 'Slice, Filter & Explore Crunchbase Data',
                        link: scope.$parent.shortUrl,
                        picture: 'http://crunchinator.com/images/logo.png',
                        caption: '',
                        description: 'With Cloudspace\'s free Crunchinator tool, you can quickly identify all ' +
                            'companies and investors based upon a variety of criteria, including geography, ' +
                            'fundraising amounts and exits.',
                        message: ''
                    });
                });
            }
        };
    }
]);
