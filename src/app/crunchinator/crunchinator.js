angular.module( 'ngBoilerplate.crunchinator', [
  'ui.state',
  'ui.bootstrap',
  'plusOne',
  'configuration'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'crunchinator', {
    url: '/crunchinator',
    views: {
      "main": {
        controller: 'CrunchinatorCtrl',
        templateUrl: 'crunchinator/crunchinator.tpl.html'
      }
    },
    data:{ pageTitle: 'Crunchinator Angularjs + D3js Demo by Cloudspace' }
  });
})

// CrunchinatorCtrl = function($scope) {
.controller( 'CrunchinatorCtrl', [ '$scope', '$http', 'ENV', function CrunchinatorCtrl( $scope, $http, ENV ) {
  $scope.environment = ENV;

  $scope.updateSelectedItem = function(item) {
    $scope.selectedItem = item;
  };

  $http.get('/companies').success(function(response) { $scope.companies = response; });
  $http.get('/categories').success(function(response) { $scope.categories = response; });
  $http.get('/investors').success(function(response) { $scope.investors = response; });
}]);
