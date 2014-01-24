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
        data:{ pageTitle: 'Crunchinator - A Cloudspace Project' }
    });
})

.controller('CrunchinatorCtrl', [
    '$scope', 'Company', 'Category', 'Investor', 'ComponentData',
    function CrunchinatorCtrl($scope, Company, Category, Investor, ComponentData) {
        //Create the initial empty filter data for every filter
        var filterData = {
            categoryIds: [],
            investorIds: [],
            companyIds: [],
            ranges: []
        };

        $scope.selectedRanges = [];

        //Bind models to the scope, so we can use the calls in the views
        $scope.companies = Company;
        $scope.investors = Investor;
        $scope.categories = Category;

        //Fetch the data for each model, then set up its dimensions and run its filters.
        var modelCount = 0;
        _.each([Company, Category], function(Model){
            Model.fetch().then(function() {
                modelCount++;
                Model.setupDimensions();
                Model.runFilters(filterData);
                if(modelCount === 2) {
                    var companiesById = _.indexBy(Company.all, 'id');
                    var categoriesById = _.indexBy(Category.all, 'id');
                    Investor.fetch().then(function(){
                        Investor.linkModels(companiesById, categoriesById);
                        Investor.setupDimensions();
                        Investor.runFilters(filterData);
                    });
                }
            });
        });

        //Bind component data services to the scope, so we can use them in the views
        $scope.geoJsonData = ComponentData.companyGeoJson;
        $scope.totalFundingData = ComponentData.totalFunding;
        $scope.categoryWordCloudData = ComponentData.categoryWordCloudData;
        $scope.fundingRoundCount = ComponentData.fundingRoundCount;
        $scope.companyStatuses = ComponentData.companyStatusData;

        //All of our filters broadcast 'filterAction' when they've been operated on
        //When a filter receives input we set up filterData and run each model's filters
        //This should automatically update all the graph displays
        $scope.$on('filterAction', function() {
            filterData.categoryIds = _.pluck($scope.selectedCategories, 'id');
            filterData.companyIds = _.pluck($scope.selectedCompanies, 'id');
            filterData.investorIds = _.pluck($scope.selectedInvestors, 'id');
            filterData.ranges = $scope.selectedRanges;

            Company.runFilters(filterData);
            Category.runFilters(filterData);
            Investor.runFilters(filterData);
        });
    }
]);
