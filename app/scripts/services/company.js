'use strict';

angular.module('crunchinatorApp.models').service('Company', function(Model, API_BASE_URL) {
    var Company = function() {
        this.url = API_BASE_URL + '/companies.json';
    };

    Company.prototype = Object.create(Model);

    Company.prototype.parse = function(response) {
        return response.companies;
    };

    //Sets up our list of dimensions we plan to use in the filters
    Company.prototype.setupDimensions = function() {
        var crossCompanies = crossfilter(this.all);

        this.dimensions = {
            'byId': crossCompanies.dimension(function(company) { return company.id; }),
            'byCategory': crossCompanies.dimension(function(company) { return company.category_id; }),
            'byInvestors': crossCompanies.dimension(function(company) { return company.investor_ids; })
        };

        this.companiesByName = crossCompanies.dimension(function(company) { return company.name; });
    };

    //A list of functions that set each model list.
    //Different components require different filter groups for displaying data
    Company.prototype.filterGroups = {
        //The data we use to display companies
        'dataForCompanyList': function() {
            this.resetAllDimensions();

            var exclusions = ['byId'];
            this.applyFilters(exclusions);

            this.dataForCompaniesList = this.companiesByName.bottom(Infinity);
        },
        //The data used for the total funding graph
        'dataForTotalFunding': function() {
            this.resetAllDimensions();
            this.applyFilters();
            this.dataForTotalFunding = this.companiesByName.bottom(Infinity);
        },
        //The data for the map of locations
        'dataForLocationMap': function() {
            this.resetAllDimensions();
            this.applyFilters();
            this.dataForLocationMap = this.companiesByName.bottom(Infinity);
        },
        //The company data used as part of the category list display
        dataForCategoriesList: function() {
            this.resetAllDimensions();
            var exclusions = ['byCategory'];
            this.applyFilters(exclusions);
            this.dataForCategoriesList = this.companiesByName.bottom(Infinity);
        }
    };

    //A list of functions that filter on a single dimension
    Company.prototype.filters = {
        //Filters to companies that have a category within the selected list of categoryIds
        'byCategory': function() {
            var ids = this.filterData.categoryIds;
            this.dimensions.byCategory.filter(function(categoryId) {
                return (ids.length === 0 || ids.indexOf(categoryId) > -1);
            });
        },
        //Filters to companies that include an investor within the selected list of investorIds
        'byInvestors': function() {
            var ids = this.filterData.investorIds;
            this.dimensions.byInvestors.filter(function(investorIds) {
                return (ids.length === 0 || _.intersection(investorIds, ids).length > 0);
            });
        },
        //Filters to companies that have an id within the selected list of companyIds
        'byId': function() {
            var ids = this.filterData.companyIds;
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        }
    };

    return new Company();
});
