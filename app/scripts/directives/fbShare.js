'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'fbShare', [
    function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function(){
                    FB.ui({
                        method: 'feed',
                        name: 'Slice, Filter & Explore Crunchbase Data',
                        link: scope.$parent.shortUrl,
                        picture: 'http://staging.crunchinator.com/images/burner.jpg',
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
