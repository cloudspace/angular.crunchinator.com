'use strict';

angular.module('crunchinatorApp.models').service('Company', function(Model, API_BASE_URL) {
    var Company = function() {
        this.url = API_BASE_URL + '/companies.json';
    };

    Company.prototype = Object.create(Model);

    Company.prototype.parse = function(response) {
        return response.companies;
    };

    Company.prototype.setupDimensions = function() {
        var crossCompanies = crossfilter(this.all);

        this.dimensions = {
            'byId': crossCompanies.dimension(function(company) { return company.id; }),
            'byCategory': crossCompanies.dimension(function(company) { return company.category_id; }),
            'byInvestors': crossCompanies.dimension(function(company) { return company.investor_ids; })
        };

        this.companiesByName = crossCompanies.dimension(function(company) { return company.name; });
    };

    Company.prototype.filterGroups = {
        'dataForCompanyList': function() {
            this.resetAllDimensions();
 
            var exclusions = ['byId'];
            this.applyFilters(exclusions);

            this.dataForCompaniesList = this.companiesByName.bottom(Infinity);
            console.log(this.dataForCompaniesList);
        },
        'dataForTotalFunding': function() {
            this.resetAllDimensions();
            this.applyFilters();
            this.dataForTotalFunding = this.companiesByName.bottom(Infinity);
        },
        'dataForLocationMap': function() {
            this.resetAllDimensions();
            this.applyFilters();
            this.dataForLocationMap = this.companiesByName.bottom(Infinity);
        }
    };

    Company.prototype.filters = {
        'byCategory': function() {
            var ids = this.filterData.categoryIds;
            this.dimensions.byCategory.filter(function(categoryId) {
                return (ids.length === 0 || ids.indexOf(categoryId) > -1);
            });
        },
        'byInvestors': function() {
            var ids = this.filterData.investorIds;
            this.dimensions.byInvestors.filter(function(investorIds) {
                return (ids.length === 0 || _.intersection(investorIds[0], ids).length > 0);
            });
        },
        'byId': function() {
            var ids = this.filterData.companyIds;
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        }
    };

    return new Company();
});
