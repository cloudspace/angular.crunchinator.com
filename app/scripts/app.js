'use strict';

angular.module('crunchinatorApp.models', []);
angular.module('crunchinatorApp.directives', []);
angular.module('crunchinatorApp.controllers', [
    'ui.state',
    'ui.bootstrap',
    'configuration',
    'crunchinatorApp.models',
    'crunchinatorApp.directives',
    'ui.select2'
]);

angular.module('crunchinatorApp', [
    'ui.state',
    'ui.route',
    'crunchinatorApp.controllers'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise( '/crunchinator' );
})

.run(function run() {
})

.controller('AppCtrl', function AppCtrl($scope) {
    $scope.$on('$stateChangeSuccess', function(event, toState){
        if (angular.isDefined(toState.data.pageTitle)) {
            $scope.pageTitle = toState.data.pageTitle;
        }
    });
});
