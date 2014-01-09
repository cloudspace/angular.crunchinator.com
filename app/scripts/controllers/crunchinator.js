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

.controller('CrunchinatorCtrl', function CrunchinatorCtrl($scope, $http, ENV, Company, Category, Investor, ComponentData) {
    $scope.environment = ENV;

    $scope.filteredCompaniesList = [];
    $scope.filteredCategoriesList = [];
    $scope.filteredInvestorsList = [];
    $scope.selectedCategories = [];

    $scope.geoJsonData = ComponentData.companyGeoJson;
    $scope.totalFunding = ComponentData.totalFunding;

    var cat_ids = [];
    var company_ids = [];
    var inv_ids = [];
    //Moves into a directive that handles how we do categories
    $scope.$on('filterAction', function() {
        cat_ids = _.pluck($scope.selectedCategories, 'id');
        company_ids = _.pluck($scope.selectedCompanies, 'id');
        inv_ids = _.pluck($scope.selectedInvestors, 'id');
        $scope.filterCompanies();
        $scope.filterCategories();
        $scope.filterInvestors();
    });

    var crossCompanies;
    var companiesDimension;
    var companiesByName;
    $scope.filterCompanies = function() {
        if(crossCompanies) {
            companiesDimension.filterAll(); //clear filter
            companiesDimension.filter(function(c){
                return (cat_ids.length === 0 || cat_ids.indexOf(c.category_id) > -1) &&
                       (inv_ids.length === 0 || _.intersection(c.investor_ids[0], inv_ids).length > 0);
            });

            $scope.filteredCompaniesList = companiesByName.bottom(Infinity);
        }
    };

    var crossInvestors;
    var investorsDimension;
    var investorsByName;
    $scope.filterInvestors = function() {
        if(crossInvestors) {
            investorsDimension.filterAll();
            investorsDimension.filter(function(i){
                return (cat_ids.length === 0 || _.intersection(i.invested_category_ids, cat_ids).length > 0) &&
                       (company_ids.length === 0 || _.intersection(i.invested_company_ids, company_ids).length > 0);
            });

            $scope.filteredInvestorsList = investorsByName.bottom(Infinity);
        }
    };

    var crossCategories;
    var categoriesDimension;
    var categoriesByName;
    $scope.filterCategories = function() {
        if(crossCategories) {
            categoriesDimension.filterAll();
            categoriesDimension.filter(function(c){
                return (company_ids.length === 0 || _.intersection(company_ids, c.company_ids).length > 0) &&
                       (inv_ids.length === 0 || _.intersection(inv_ids, c.investor_ids).length > 0);
            });

            $scope.filteredCategoriesList = categoriesByName.bottom(Infinity);
        }
    };

    $scope.companies = Company;
    $scope.categories = Category;
    $scope.investors = Investor;

    Company.fetch().then(function(){
        $scope.all_companies = Company.all();
        crossCompanies = crossfilter($scope.all_companies);
        companiesDimension = crossCompanies.dimension(function(company) { return company; });
        companiesByName = crossCompanies.dimension(function(company) {return company.name;});
        $scope.filterCompanies();
    });
    Investor.fetch().then(function(){
        $scope.all_investors = Investor.all();
        crossInvestors = crossfilter($scope.all_investors);
        investorsDimension = crossInvestors.dimension(function(investor) { return investor; });
        investorsByName = crossInvestors.dimension(function(investor) {return investor.name;});
        $scope.filterInvestors();
    });
    Category.fetch().then(function(){
        $scope.all_categories = Category.all();
        crossCategories = crossfilter($scope.all_categories);
        categoriesDimension = crossCategories.dimension(function(category) { return category; });
        categoriesByName = crossCategories.dimension(function(category) {return category.name;});
        $scope.filterCategories();
    });

});
