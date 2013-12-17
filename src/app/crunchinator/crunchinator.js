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

  $scope.filteredCompanies = [];
  $scope.filteredCategories = [];
  $scope.filteredInvestors = [];

  $scope.totalRaisedGraphData = function(filteredCompanies) {
      console.log('run', filteredCompanies && filteredCompanies.length);
      if (!filteredCompanies || !$scope.filteredCompanies.length) { return; }
      var total_raised_data = [];
      for(var i = 1; i <= 10000000; i+= 1000000){
          total_raised_data.push({
              label: "$"+i+" - $"+(i+999999),
              count: 0
          });
      }

      _.each(filteredCompanies, function(company) {
          var label_index = Math.floor((company.total_funding + 1) / 1000000);
          total_raised_data[label_index].count++;
      });
      return total_raised_data;
  };

  function resetSelection() {
    $scope.selectedCompany = $scope.selectedCategory = $scope.selectedInvestor = '';
  }
  resetSelection();

  $scope.updateSelectedCompany = function(company) {
    resetSelection();
    $scope.selectedItem = company;
    $scope.selectedCompany = company;
  };

  $scope.updateSelectedCategory = function(category) {
    resetSelection();
    $scope.selectedItem = category;
    $scope.selectedCategory = category;
  };

  $scope.updateSelectedInvestor = function(investor) {
    resetSelection();
    $scope.selectedItem = investor;
    $scope.selectedInvestor = investor;
  };

  function filterWithFunctions(functions) {
    return function(item) {
      var shouldInclude = true;
      for (var i = 0, l = functions.length; i < l; i++) {
        if (!functions[i](item)) { shouldInclude = false; break; }
      }
      return shouldInclude;
    };
  }

  $scope.filterCompanies = filterWithFunctions([
    function filterCompanyBySelectedCompany(company) {
      if ($scope.selectedCompany && $scope.selectedCompany !== company) {
        return false;
      }
      return true;
    },
    function filterCompanyBySelectedCategory(company) {
      if ($scope.selectedCategory) {
        return _.contains($scope.selectedCategory.company_ids, company.id);
      }
      return true;
    },
    function filterCompanyBySelectedInvestor(company) {
      if ($scope.selectedInvestor) {
        return _.contains($scope.selectedInvestor.invested_company_ids, company.id);
      }
      return true;
    }
  ]);

  $scope.filterCategories = filterWithFunctions([
    function filterCategoryWithSelectedCategory(category) {
      if ($scope.selectedCategory && $scope.selectedCategory !== category) {
        return false;
      }
      return true;
    },
    function filterCategoryWithSelectedInvestor(category) {
      if ($scope.selectedInvestor) {
        return _.contains($scope.selectedInvestor.invested_category_ids, category.id);
      }
      return true;
    },
    function filterCategoryWithSelectedCompany(category) {
      if ($scope.selectedCompany) {
        return $scope.selectedCompany.category_code.id === category.id;
      }
      return true;
    }
  ]);

  $scope.filterInvestors = filterWithFunctions([
    function filterInvestorWithSelectedInvestor(investor) {
      if ($scope.selectedInvestor && $scope.selectedInvestor !== investor) {
        return false;
      }
      return true;
    },
    function filterInvestorWithSelectedCompany(investor) {
      if ($scope.selectedCompany) {
        return _.contains(investor.invested_company_ids, $scope.selectedCompany.id);
      }
      return true;
    },
    function filterInvestorWithSelectedCategory(investor) {
      if ($scope.selectedCategory) {
        return _.contains(investor.invested_category_ids, $scope.selectedCategory.id);
      }
      return true;
    }
  ]);

  $scope.companies = CompanyModel;
  $scope.categories = CategoryModel;
  $scope.investors = InvestorModel;

  CompanyModel.fetch();
  CategoryModel.fetch();
  InvestorModel.fetch();
}]);
