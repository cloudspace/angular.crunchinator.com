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

  $scope.updateSelectedCategory = function(item) {
    var selectedCompanyList = [];
    var selectedInvestorList = [];
    console.log(item);
    for (var i = 0; i < item.company_ids.length; i++) {
      selectedCompanyList.push(companies[item.company_ids[i]]);
    }

    for (var j = 0; j < item.investor_ids.length; j++) {
      selectedInvestorList.push(investors[item.investor_ids[j]]);
    }

    $scope.selectedItem = item;
    $scope.companies = selectedCompanyList;
    $scope.investors = selectedInvestorList;
  };

  $scope.updateSelectedInvestor = function(item) {
    var selectedCategoryList = [];
    var selectedCompanyList = [];

    for (var i = 0; i < item.invested_company_ids.length; i++) {
      selectedCompanyList.push(companies[item.invested_company_ids[i]]);
    }

    for (var j = 0; j < item.invested_category_ids.length; j++) {
      selectedCategoryList.push(categories[item.invested_category_ids[j]]);
    }

    $scope.selectedItem = item;
    $scope.categories = selectedCategoryList;
    $scope.companies = selectedCompanyList;
  };

  $scope.companies = CompanyModel;
  $scope.categories = CategoryModel;
  $scope.investors = InvestorModel;

  CompanyModel.fetch();
  CategoryModel.fetch();
  InvestorModel.fetch();
}]);
