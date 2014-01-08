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
    $scope.lookingForList = [];

    $scope.select_investor = function() {
        if($scope.selectedInvestors.indexOf($scope.selected_investor) === -1) {
            $scope.selectedInvestors.push($scope.selected_investor);
            inv_ids = _.pluck($scope.selectedInvestors, 'id');
            $scope.filteredCompanies();

            $scope.selected_investor = '';
            $scope.clearLookingFor();
        }
    };

    $scope.select_company = function() {
        if($scope.selectedCompanies.indexOf($scope.selected_company) === -1) {
            $scope.selectedCompanies.push($scope.selected_company);
            company_ids = _.pluck($scope.selectedCompanies, 'id');
            $scope.filteredInvestors();

            $scope.selected_company = '';
            $scope.clearLookingFor();
        }
    };

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

    /*$scope.totalRaisedGraphData = _.memoize(function(filteredCompanies) {
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
    });*/

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
        $scope.clearLookingFor();

        $scope.updateLookingFor();

        $scope.selectedCompanies = _.intersection($scope.selectedCompanies, $scope.filteredCompaniesList);
        $scope.selectedCategories = _.intersection($scope.selectedCategories, $scope.filteredCategoriesList);
        $scope.selectedInvestors = _.intersection($scope.selectedInvestors, $scope.filteredInvestorsList);
    };

    var crossCompanies;
    var companiesDimension;
    var companiesByName;
    $scope.filteredCompanies = function() {
        if(crossCompanies) {
            companiesDimension.filterAll(); //clear filter
            companiesDimension.filter(function(c){ return ( cat_ids.length === 0 || cat_ids.indexOf(c.category_id) > -1) && (inv_ids.length === 0 || _.intersection(c.investor_ids[0], inv_ids).length > 0); });

            $scope.filteredCompaniesList = companiesByName.bottom(Infinity);
        }
    };

    var crossInvestors;
    var investorsDimension;
    var investorsByName;
    $scope.filteredInvestors = function() {
        if(crossInvestors) {
            investorsDimension.filterAll();
            investorsDimension.filter(function(i){ return (cat_ids.length === 0 || _.intersection(i.invested_category_ids, cat_ids).length > 0) && (company_ids.length === 0 || _.intersection(i.invested_company_ids, company_ids).length > 0); });

            $scope.filteredInvestorsList = investorsByName.bottom(Infinity);
        }
    };

    var crossCategories;
    var categoriesDimension;
    var categoriesByName;
    $scope.filteredCategories = function() {
        if(crossCategories) {
            categoriesDimension.filterAll();
            categoriesDimension.filter(function(c){ return (company_ids.length === 0 || _.intersection(company_ids, c.company_ids).length > 0) && (inv_ids.length === 0 || _.intersection(inv_ids, c.investor_ids).length > 0); });

            $scope.filteredCategoriesList = categoriesByName.bottom(Infinity);
        }
    };

    $scope.clearLookingFor = function() {
        $scope.lookingForList = [];
        $scope.updateLookingFor();
    };

    $scope.$watch('lookingFor', function(){
        $scope.clearLookingFor();
    });

    $scope.updateLookingFor = function() {
        var next_items = [];
        var current_count = $scope.lookingForList.length;
        var page_size = 100;
        if($scope.lookingFor === 'companies') {
            next_items = $scope.filteredCompaniesList.slice(current_count, current_count+page_size);
        }
        else if($scope.lookingFor === 'investors') {
            next_items = $scope.filteredInvestorsList.slice(current_count, current_count+page_size);
        }
        $scope.lookingForList = $scope.lookingForList.concat(next_items);
    };

    $scope.companies = CompanyModel;
    $scope.categories = CategoryModel;
    $scope.investors = InvestorModel;

    CompanyModel.fetch().then(function(){
        $scope.all_companies = CompanyModel.all();
        crossCompanies = crossfilter($scope.all_companies);
        companiesDimension = crossCompanies.dimension(function(company) { return company; });
        companiesByName = crossCompanies.dimension(function(company) {return company.name;});
        $scope.filteredCompanies();
    });
    InvestorModel.fetch().then(function(){
        $scope.all_investors = InvestorModel.all();
        crossInvestors = crossfilter($scope.all_investors);
        investorsDimension = crossInvestors.dimension(function(investor) { return investor; });
        investorsByName = crossInvestors.dimension(function(investor) {return investor.name;});
        $scope.filteredInvestors();
    });
    CategoryModel.fetch().then(function(){
        crossCategories = crossfilter(CategoryModel.all());
        categoriesDimension = crossCategories.dimension(function(category) { return category; });
        categoriesByName = crossCategories.dimension(function(category) {return category.name;});
        $scope.filteredCategories();
    });

    $scope.resetSelection();

});
