'use strict';

angular.module('crunchinatorApp.models').service('Company', function(Model, API_BASE_URL) {
    var Company = function() {
        this.url = API_BASE_URL + '/companies.json';
    };

    Company.prototype = Object.create(Model);

    //A function called on the response object that returns the raw model data
    //This is overridden for each subclass of model for different paths to the data
    Company.prototype.parse = function(response) {
        return response.companies;
    };

    //Sets up a crossfilter object on all of the model's data
    //Sets up a list of named dimensions used in the filter list to filter datasets
    Company.prototype.setupDimensions = function() {
        var crossCompanies = crossfilter(this.all);

        this.dimensions = {
            byId: crossCompanies.dimension(function(company) { return company.id; }),
            byCategory: crossCompanies.dimension(function(company) { return company.category_id; }),
            byInvestors: crossCompanies.dimension(function(company) { return company.investor_ids; })
        };

        this.byName = crossCompanies.dimension(function(company) { return company.name; });
    };

    //A mapping of dataset names to the exclusions used when building the dataset
    //A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
    Company.prototype.dataSets = {
        dataForCompaniesList: ['byId'],
        dataForTotalFunding: [],
        dataForLocationMap: [],
        dataForCategoriesList: ['byCategory']
    };

    //A list of functions that filter on a single dimension
    //When building datasets every filter is applied to that dataset except what's in the exclusion list
    //Adding a new filter here will apply the filter to every dataset unless its excluded
    Company.prototype.filters = {
        byCategory: function() {
            var ids = this.filterData.categoryIds;
            this.dimensions.byCategory.filter(function(categoryId) {
                return (ids.length === 0 || ids.indexOf(categoryId) > -1);
            });
        },
        byInvestors: function() {
            var ids = this.filterData.investorIds;
            this.dimensions.byInvestors.filter(function(investorIds) {
                return (ids.length === 0 || _.intersection(investorIds, ids).length > 0);
            });
        },
        byId: function() {
            var ids = this.filterData.companyIds;
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        }
    };

    return new Company();
});