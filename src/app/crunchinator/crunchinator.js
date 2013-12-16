angular.module( 'ngBoilerplate.crunchinator', [
  'ui.state',
  'ui.bootstrap',
  'plusOne',
  'configuration',
  'ngBoilerplate.model'
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

// CompanyModel = function(Model)
.factory('CompanyModel', ['Model', function(Model) {
    m = Model.extend({
        url: '/companies',
        _attributes: {
            id: -1,
            name: '',
            category: '',
            zipcode: 0,
            funding_rounds: [],
            // funding_rounds: {
            // amount_raised: 0,
            // start: new Date(),
            // end: new Date()
            // investors: [],
            // },
            total_funding: 0
        }
    });

    return m;
}])

// CategoryModel = function(Model)
.factory('CategoryModel', ['Model', function(Model) {
    m = Model.extend({
        url: '/categories',
        _attributes: {
            name: ''
        }
    });

    return m;
}])

// CompanyModel = function(Model)
.factory('InvestorModel', ['Model', function(Model) {
    m = Model.extend({
        url: '/investors',
        _attributes: {
            id: -1,
            name: ''
        }
    });

    return m;
}])

// CrunchinatorCtrl = function($scope) {
.controller( 'CrunchinatorCtrl', [ '$scope', '$http', 'ENV', 'CompanyModel', 'CategoryModel', 'InvestorModel', function CrunchinatorCtrl( $scope, $http, ENV, CompanyModel, CategoryModel, InvestorModel ) {
  $scope.environment = ENV;

  $scope.updateSelectedItem = function(item) {
    $scope.selectedItem = item;
  };

  $scope.companies = CompanyModel;
  $scope.categories = CategoryModel;
  $scope.investors = InvestorModel;

  CompanyModel.fetch();
  CategoryModel.fetch();
  InvestorModel.fetch();
}]);
