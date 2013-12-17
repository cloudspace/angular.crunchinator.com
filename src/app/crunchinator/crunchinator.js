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
  function resetSelection() {
    $scope.selectedCompany = $scope.selectedCategory = $scope.selectedInvestor = '';
  }
  resetSelection();

  $scope.updateSelectedCompany = function(company) {
    resetSelection();
    $scope.selectedCompany = company;
  };

  $scope.updateSelectedCategory = function(category) {
    resetSelection();
    $scope.selectedCategory = category;
  };

  $scope.updateSelectedInvestor = function(investor) {
    resetSelection();
    $scope.selectedInvestor = investor;
  };

  $scope.filterCompanies = function(company) {
    if ($scope.selectedCompany && $scope.selectedCompany !== company) {
      return false;
    } else if ($scope.selectedInvestor) {
      return _.contains($scope.selectedInvestor.invested_company_ids, company.id);
    } else if ($scope.selectedCategory) {
      return _.contains($scope.selectedCategory.company_ids, company.id);
    }
    return true;
  };

  $scope.filterCategories = function(category) {
    if ($scope.selectedCategory && $scope.selectedCategory !== category) {
      return false;
    } else if ($scope.selectedInvestor) {
      return _.contains($scope.selectedInvestor.invested_category_ids, category.id);
    } else if ($scope.selectedCompany) {
      return $scope.selectedCompany.category_code.id === category.id;
    }
    return true;
  };

  $scope.filterInvestors = function(investor) {
    if ($scope.selectedInvestor && $scope.selectedInvestor !== investor) {
      return false;
    } else if ($scope.selectedCompany) {
      return _.contains(investor.invested_company_ids, $scope.selectedCompany.id);
    } else if ($scope.selectedCategory) {
      return _.contains(investor.invested_category_ids, $scope.selectedCategory.id);
    }
    return true;
  };

  $scope.companies = CompanyModel;
  $scope.categories = CategoryModel;
  $scope.investors = InvestorModel;

  CompanyModel.fetch();
  CategoryModel.fetch();
  InvestorModel.fetch();
}]);
