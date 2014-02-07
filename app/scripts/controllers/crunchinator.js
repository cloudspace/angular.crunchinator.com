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
    '$scope', '$q', 'Company', 'Category', 'Investor', 'ComponentData',
    function CrunchinatorCtrl($scope, $q, Company, Category, Investor, ComponentData) {
        $scope.loading = true;
        //Create the initial empty filter data for every filter
        var filterData = {
            categoryIds: [],
            investorIds: [],
            companyIds: [],
            ranges: [],
            roundRanges: [],
            mostRecentRoundRanges: [],
            statuses: [],
            states: [],
            fundingActivity: [],
            acquiredDate: [],
            foundedDate: []
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
                        $scope.loading = false;
                    });
                }
            });
        });

        //Bind component data services to the scope, so we can use them in the views
        $scope.ComponentData = ComponentData;

        //All of our filters broadcast 'filterAction' when they've been operated on
        //When a filter receives input we set up filterData and run each model's filters
        //This should automatically update all the graph displays
        $scope.$on('filterAction', function() {
            var deferred = $q.defer();


            function applyFilters() {
                _.delay(function(){
                    $scope.$apply(function() {
                        Company.runFilters(filterData);
                        Category.runFilters(filterData);
                        Investor.runFilters(filterData);

                        deferred.resolve('Finished filters');
                    });
                }, 300);

                return deferred.promise;
            }

            $scope.loading = true;
            filterData.categoryIds = _.pluck($scope.selectedCategories, 'id');
            filterData.companyIds = _.pluck($scope.selectedCompanies, 'id');
            filterData.investorIds = _.pluck($scope.selectedInvestors, 'id');
            filterData.ranges = $scope.selectedRanges || [];
            filterData.roundRanges = $scope.selectedRoundRanges || [];
            filterData.mostRecentRoundRanges = $scope.selectedRecentRoundRanges || [];
            filterData.statuses = $scope.selectedStatuses || [];
            filterData.states = $scope.selectedStates || [];
            filterData.fundingActivity = $scope.selectedFundingActivity || [];
            filterData.acquiredDate = $scope.selectedAquiredDate || [];
            filterData.foundedDate = $scope.selectedFoundedDate || [];

            applyFilters().then(function(){
                $scope.loading = false;
            });
        });
    }
]);
