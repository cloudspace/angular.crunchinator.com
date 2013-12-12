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
  var categories, investors, companies;

  $scope.updateSelectedCompany = function(item) {
    var selectedItemInvestorList = [];

    for (var i = 0; i < item.funding_rounds.length; i++) {
      var fundingRoundInvestors = item.funding_rounds[i].investors;

      for (var j = 0; j < fundingRoundInvestors.length; j++) {
        selectedItemInvestorList.push(fundingRoundInvestors[j]);
      }
    }

    $scope.selectedItem = item;
    $scope.categories = [item.category_code];
    $scope.investors = selectedItemInvestorList;
  };

  $http.get('/companies').success(function(response) { companies = $scope.companies = response; });
  $http.get('/categories').success(function(response) { categories = $scope.categories = response; });
  $http.get('/investors').success(function(response) { investors = $scope.investors = response; });
}]);
