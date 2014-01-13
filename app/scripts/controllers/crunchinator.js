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
    var filterData = {
        categoryIds: [],
        investorIds: [],
        companyIds: []
    };

    $scope.companies = Company;
    $scope.investors = Investor;
    $scope.categories = Category;

    Company.fetch().then(function() {
        Company.setupDimensions();
        Company.runFilters(filterData);
    });

    Category.fetch().then(function() {
        Category.setupDimensions();
        Category.runFilters(filterData);
    });

    Investor.fetch().then(function() {
        Investor.setupDimensions();
        Investor.runFilters(filterData);
    });

    $scope.geoJsonData = ComponentData.companyGeoJson;
    $scope.totalFunding = ComponentData.totalFunding;
    $scope.categoryWordCloudData = ComponentData.categoryWordCloudData;

    //Moves into a directive that handles how we do categories
    $scope.$on('filterAction', function() {
        filterData.categoryIds = _.pluck($scope.selectedCategories, 'id');
        filterData.companyIds = _.pluck($scope.selectedCompanies, 'id');
        filterData.investorIds = _.pluck($scope.selectedInvestors, 'id');

        Company.runFilters(filterData);
        Category.runFilters(filterData);
        Investor.runFilters(filterData);
    });
});
