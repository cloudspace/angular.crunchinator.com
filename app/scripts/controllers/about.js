'use strict';

angular.module('crunchinatorApp.controllers')
.controller('AboutCtrl', [
    '$scope',
    function AboutCtrl($scope) {
        $scope.showPage = 'about';
        $scope.quizPos = 0;
        $scope.incPos = function(){
            $scope.quizPos++;
        };
    }
]);