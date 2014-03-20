'use strict';

angular.module('crunchinatorApp.controllers')
.controller('AboutCtrl',  [
    '$scope', 'Browser', 'Analytics',
    function AboutCtrl($scope, Browser, Analytics) {
        var section = angular.element('#about');
        var body = angular.element('body');

        $scope.showPage = 'about';
        $scope.isMobile = Browser.isMobile.any();
        $scope.Analytics = Analytics;

        $scope.navigate = function(page) {
            Analytics.event('Navigation', 'Click', page);
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
