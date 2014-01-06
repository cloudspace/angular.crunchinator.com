'use strict';

angular.module('crunchinatorApp.controllers')

.config(function config($stateProvider) {
    $stateProvider.state('crunchinator', {
        url: '/crunchinator',
        views: {
            main: {
                controller: 'CrunchinatorCtrl',
                templateUrl: 'views/main.tpl.html'
            }
        },
        data:{ pageTitle: 'Crunchinator Angularjs + D3js Demo by Cloudspace' }
    });
})

.controller('CrunchinatorCtrl', function CrunchinatorCtrl($scope, $http, ENV, CompanyModel, CategoryModel, InvestorModel) {
    $scope.environment = ENV;

    $scope.filteredCompaniesList = [];
    $scope.filteredCategoriesList = [];
    $scope.filteredInvestorsList = [];

    $scope.geoJsonData = _.memoize(function(filteredCompanies) {
        var geojson = {
            'type': 'FeatureCollection',
            'features': []
        };
        if (!filteredCompanies || !filteredCompanies.length) { return geojson; }

        _.each(filteredCompanies, function(company) {
            if(company.latitude && company.longitude) {
                geojson.features.push({
                    'type': 'Feature',
                    'geometry': {'type': 'Point', 'coordinates': [company.longitude, company.latitude]},
                    'properties': 0
                });
            }

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
                label: '$'+i+' - $'+((i === 1 ? 0 : i)+1) + 'M',
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

    $scope.resetSelection = function() {
        $scope.selectedCompanies = [];
        $scope.selectedCategories = [];
        $scope.selectedInvestors = [];

        $scope.filteredCompanies();
        $scope.filteredCategories();
        $scope.filteredInvestors();
    };

    var cat_ids = [];
    var company_ids = [];
    var inv_ids = [];
    $scope.toggleSelected = function(selectedItems, item) {
        $scope.selectedItem = item;
        var ind = selectedItems.indexOf(item);
        if (ind > -1) {
            //Remove item if its already selected
            selectedItems.splice(ind, 1);
        } else {
            //Add item if its not already selected
            selectedItems.push(item);
        }

        cat_ids = _.pluck($scope.selectedCategories, 'id');
        company_ids = _.pluck($scope.selectedCompanies, 'id');
        inv_ids = _.pluck($scope.selectedInvestors, 'id');

        $scope.filteredCompanies();
        $scope.filteredCategories();
        $scope.filteredInvestors();

        $scope.selectedCompanies = _.intersection($scope.selectedCompanies, $scope.filteredCompaniesList);
        $scope.selectedCategories = _.intersection($scope.selectedCategories, $scope.filteredCategoriesList);
        $scope.selectedInvestors = _.intersection($scope.selectedInvestors, $scope.filteredInvestorsList);
    };

    var crossCompanies;
    var companiesDimension;
    var companiesById;
    $scope.filteredCompanies = function() {
        if(crossCompanies) {
            companiesDimension.filterAll(); //clear filter
            companiesDimension.filter(function(c){ return ( cat_ids.length === 0 || cat_ids.indexOf(c.category_id) > -1) && (inv_ids.length === 0 || _.intersection(c.investor_ids, inv_ids).length > 0); });

            $scope.filteredCompaniesList = companiesById.bottom(100);
        }
    };

    var crossInvestors;
    var investorsDimension;
    var investorsById;
    $scope.filteredInvestors = function() {
        if(crossInvestors) {
            investorsDimension.filterAll();
            investorsDimension.filter(function(i){ return (cat_ids.length === 0 || _.intersection(i.invested_category_ids, cat_ids).length > 0) && (company_ids.length === 0 || _.intersection(i.invested_company_ids, company_ids).length > 0); });

            $scope.filteredInvestorsList = investorsById.bottom(100);
        }
    };

    var crossCategories;
    var categoriesDimension;
    var categoriesById;
    $scope.filteredCategories = function() {
        if(crossCategories) {
            categoriesDimension.filterAll();
            categoriesDimension.filter(function(c){ return (company_ids.length === 0 || _.intersection(company_ids, c.company_ids).length > 0) && (inv_ids.length === 0 || _.intersection(inv_ids, c.investor_ids).length > 0); });

            $scope.filteredCategoriesList = categoriesById.bottom(100);
        }
    };

    $scope.companies = CompanyModel;
    $scope.categories = CategoryModel;
    $scope.investors = InvestorModel;

    CompanyModel.fetch().then(function(){
        crossCompanies = crossfilter(CompanyModel.all());
        companiesDimension = crossCompanies.dimension(function(company) { return company; });
        companiesById = crossCompanies.dimension(function(company) {return company.id;});
        $scope.filteredCompanies();
    });
    InvestorModel.fetch().then(function(){
        crossInvestors = crossfilter(InvestorModel.all());
        investorsDimension = crossInvestors.dimension(function(investor) { return investor; });
        investorsById = crossInvestors.dimension(function(investor) {return investor.id;});
        $scope.filteredInvestors();
    });
    CategoryModel.fetch().then(function(){
        crossCategories = crossfilter(CategoryModel.all());
        categoriesDimension = crossCategories.dimension(function(category) { return category; });
        categoriesById = crossCategories.dimension(function(category) {return category.id;});
        $scope.filteredCategories();
    });

    $scope.resetSelection();

});
