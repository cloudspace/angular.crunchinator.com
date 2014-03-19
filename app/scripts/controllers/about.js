'use strict';

angular.module('crunchinatorApp.controllers')
.controller('AboutCtrl',  [
    '$scope', 'Browser',
    function AboutCtrl($scope, Browser) {
        var section = angular.element('#about');
        var body = angular.element('body');

        $scope.showPage = 'about';
        $scope.isMobile = Browser.isMobile.any();

        $scope.navigate = function(page) {
            _gaq.push(['_trackEvent', 'Navigation', 'Click', page]);
            if (body.scrollTop() === section.offset().top) {
                $scope.showPage = page;
            } else {
                angular.element('body').animate({scrollTop: section.offset().top}, 'slow', function() {
                    $scope.showPage = page;
                    $scope.$digest();
                });
            }
        };
    }
]);
