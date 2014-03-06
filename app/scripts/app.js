'use strict';

angular.module('crunchinatorApp.models', []);
angular.module('crunchinatorApp.directives', []);
angular.module('crunchinatorApp.services', []);
angular.module('crunchinatorApp.controllers', [
    'ui.state',
    'configuration',
    'crunchinatorApp.models',
    'crunchinatorApp.directives',
    'crunchinatorApp.services',
    'infinite-scroll'
]).config(function config($stateProvider) {
    $stateProvider.state('crunchinator', {
        url: '/crunchinator',
        views: {
            main: {
                controller: 'CrunchinatorCtrl',
                templateUrl: 'views/main.tpl.html'
            },
            about: {
                controller: 'AboutCtrl',
                templateUrl: 'views/about.tpl.html'
            }
        },
        data:{ pageTitle: 'Crunchinator - A Cloudspace Project' }
    });
});

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
