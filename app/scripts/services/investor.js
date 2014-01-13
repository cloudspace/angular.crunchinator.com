'use strict';

angular.module('crunchinatorApp.models').service('Investor', function(Model, API_BASE_URL) {
    var self;
    var Investor = function() {
        this.url = API_BASE_URL + '/investors.json';
        self = this;
    };

    Investor.prototype = Object.create(Model);

    Investor.prototype.parse = function(response) {
        return response.investors;
    };

    Investor.prototype.setupDimensions = function() {
        var crossInvestors = crossfilter(this.all);

        this.dimensions = {
            'byId': crossInvestors.dimension(function(investor) { return investor.id; }),
            'byCompanies': crossInvestors.dimension(function(investor) { return investor.invested_company_ids; }),
            'byCategories': crossInvestors.dimension(function(investor) { return investor.invested_category_ids; })
        };

        this.investorsByName = crossInvestors.dimension(function(investor) { return investor.name; });
    };

    Investor.prototype.filterGroups = {
        'dataForInvestorList': function() {
            this.resetAllDimensions();

            var exclusions = ['byId'];
            this.applyFilters(exclusions);

            this.dataForInvestorsList = this.investorsByName.bottom(Infinity);
        }
    };

    Investor.prototype.filters = {
        'byCompanies': function() {
            var ids = this.filterData.companyIds;
            this.dimensions.byCompanies.filter(function(companyIds) {
                return (ids.length === 0 || _.intersection(companyIds, ids).length > 0);
            });
        },
        'byCategories': function() {
            var ids = this.filterData.categoryIds;
            this.dimensions.byCategories.filter(function(categoryIds) {
                return (ids.length === 0 || _.intersection(categoryIds, ids).length > 0);
            });
        },
        'byId': function() {
            var ids = this.filterData.investorIds;
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        }
    };

    return new Investor();
});
