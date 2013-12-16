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

  $scope.totalRaisedGraphData = [];

  $scope.$watch('companies', function() {
    var total_raised_data = [];
    for(var i = 1; i <= 10000000; i+= 1000000){
      total_raised_data.push({
        label: "$"+i+" - $"+(i+999999),
        count: 0
      });
    }
    if($scope.companies) {
      $scope.companies.forEach(function(company) {
        var label_index = Math.floor((company.total_funding + 1) / 1000000);
        total_raised_data[label_index].count++;
      });
    }
    $scope.totalRaisedGraphData = total_raised_data;
  });
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

  $http.get('/companies').success(function(response) { companies = $scope.companies = response; });
  $http.get('/categories').success(function(response) { categories = $scope.categories = response; });
  $http.get('/investors').success(function(response) { investors = $scope.investors = response; });
}]);
