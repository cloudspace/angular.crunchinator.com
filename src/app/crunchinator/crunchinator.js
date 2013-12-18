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

  $scope.filteredCompaniesList = [];

  $scope.geoJsonData = _.memoize(function(filteredCompanies) {
    var geojson = {
      "type": "FeatureCollection",
      "features": []
    };
    if (!filteredCompanies || !filteredCompanies.length) { return geojson; }

    _.each(filteredCompanies, function(company) {
      geojson.features.push({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [company.latitude, company.longitude]},
        "properties": 0
      });

    });

    return geojson;

  }, function(filteredCompanies) {
    return _.pluck(filteredCompanies, 'id').join('');
  });

  $scope.totalRaisedGraphData = _.memoize(function(filteredCompanies) {
    if (!filteredCompanies || !filteredCompanies.length) { return; }
    var total_raised_data = [];
    for(var i = 1; i <= 10; i++){
      total_raised_data.push({
        label: "$"+i+" - $"+(i+1) + "M",
        count: 0
      });
    }

    _.each(filteredCompanies, function(company) {
      var label_index = Math.floor((company.total_funding + 1) / 1000000);
      total_raised_data[label_index].count++;
    });
    return total_raised_data;
  }, function(filteredCompanies) {
    return _.pluck(filteredCompanies, 'id').join('');
  });

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

  $scope.filteredCompanies = function() {
    $scope.filteredCompaniesList = CompanyModel._models;
    return $scope.filteredCompaniesList;
  };
  $scope.filteredInvestors = function() {
    return InvestorModel._models;
  };
  $scope.filteredCategories = function() {
    return CategoryModel._models;
  };

  $scope.companies = CompanyModel;
  $scope.categories = CategoryModel;
  $scope.investors = InvestorModel;

  CompanyModel.fetch();
  CategoryModel.fetch();
  InvestorModel.fetch();
}]);
