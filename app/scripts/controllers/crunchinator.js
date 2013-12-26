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

.controller('CrunchinatorCtrl', function CrunchinatorCtrl($scope, $http, ENV, CompanyModel, CategoryModel, InvestorModel, Auth) {
    $scope.environment = ENV;

    $scope.filteredCompaniesList = [];
    $scope.filteredCategoriesList = [];
    $scope.filteredInvestorsList = [];
    $scope.mapboundary = 'Hello';
    $scope.$watch('mapBoundary', function(){
    });

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
                    'geometry': {'type': 'Point', 'coordinates': [company.latitude, company.longitude]},
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
    };
    $scope.resetSelection();

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

        $scope.selectedCompanies = _.intersection($scope.selectedCompanies, $scope.filteredCompaniesList);
        $scope.selectedCategories = _.intersection($scope.selectedCategories, $scope.filteredCategoriesList);
        $scope.selectedInvestors = _.intersection($scope.selectedInvestors, $scope.filteredInvestorsList);
    };

    var crossCompanies;
    var companiesByCategory;
    var companiesByInvestors;
    var companiesById;
    $scope.filteredCompanies = function() {
        if(crossCompanies && companiesByCategory) {
            var cat_ids = _.pluck($scope.selectedCategories, 'id');
            var inv_ids = _.pluck($scope.selectedInvestors, 'id');
            companiesByCategory.filterAll(); //clear filter
            companiesByInvestors.filterAll(); //clear filter
            if(cat_ids.length > 0) {
                companiesByCategory.filter(function(c) { return cat_ids.indexOf(c) > -1; });
            }
            if(inv_ids.length > 0) {
                companiesByInvestors.filter(function(invs) { return _.intersection(invs, inv_ids).length > 0;});
            }

            $scope.filteredCompaniesList = companiesById.bottom(Infinity);
        }

        return $scope.filteredCompaniesList;
    };

    var crossInvestors;
    var investorsByCategories;
    var investorsByCompanies;
    var investorsById;
    $scope.filteredInvestors = function() {
        if(crossInvestors) {
            var cat_ids = _.pluck($scope.selectedCategories, 'id');
            var company_ids = _.pluck($scope.selectedCompanies, 'id');

            investorsByCategories.filterAll();
            investorsByCompanies.filterAll();

            if(cat_ids.length > 0) {
                investorsByCategories.filter(function(d){ return _.intersection(d, cat_ids).length > 0;});
            }
            if(company_ids.length > 0) {
                investorsByCompanies.filter(function(d){ return _.intersection(d, company_ids).length > 0;});
            }
            $scope.filteredInvestorsList = investorsById.bottom(Infinity);
        }
        return $scope.filteredInvestorsList;
    };

    var crossCategories;
    var categoriesByInvestors;
    var categoriesByCompanies;
    var categoriesById;
    $scope.filteredCategories = function() {
        if(crossCategories) {
            var company_ids = _.pluck($scope.selectedCompanies, 'id');
            var inv_ids = _.pluck($scope.selectedInvestors, 'id');

            categoriesByInvestors.filterAll();
            categoriesByCompanies.filterAll();

            if(company_ids.length > 0) {
                categoriesByCompanies.filter(function(d){ return _.intersection(d, company_ids).length > 0;});
            }
            if(inv_ids.length > 0) {
                categoriesByInvestors.filter(function(invs) { return _.intersection(invs, inv_ids).length > 0;});
            }
            $scope.filteredCategoriesList = categoriesById.bottom(Infinity);
        }
        return $scope.filteredCategoriesList;
    };

    $scope.companies = CompanyModel;
    $scope.categories = CategoryModel;
    $scope.investors = InvestorModel;

    CompanyModel.fetch().then(function(){
        crossCompanies = crossfilter(CompanyModel.all());
        companiesByCategory = crossCompanies.dimension(function(company) { return company.category_id; });
        companiesByInvestors = crossCompanies.dimension(function(company) { return company.investor_ids; });
        companiesById = crossCompanies.dimension(function(company) {return company.id;});
    });
    InvestorModel.fetch().then(function(){
        crossInvestors = crossfilter(InvestorModel.all());
        investorsByCategories = crossInvestors.dimension(function(investor) { return investor.invested_category_ids; });
        investorsByCompanies = crossInvestors.dimension(function(investor) { return investor.invested_company_ids; });
        investorsById = crossInvestors.dimension(function(investor) {return investor.id;});
    });
    CategoryModel.fetch().then(function(){
        crossCategories = crossfilter(CategoryModel.all());
        categoriesByInvestors = crossCategories.dimension(function(category) { return category.investor_ids; });
        categoriesByCompanies = crossCategories.dimension(function(category) { return category.company_ids; });
        categoriesById = crossCategories.dimension(function(category) {return category.id;});
    });
});
