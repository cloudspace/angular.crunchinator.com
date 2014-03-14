'use strict';

angular.module('crunchinatorApp.controllers')
.controller('AboutCtrl', [
    '$scope',
    function AboutCtrl($scope) {
        var section = angular.element('#about');
        var body = angular.element('body');

        $scope.showPage = 'about';

        $scope.navigate = function(page) {
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
