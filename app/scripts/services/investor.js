'use strict';

angular.module('crunchinatorApp.models').service('Investor', function(Model, API_BASE_URL) {
    /**
     * Creates an instance of Investor.
     *
     * @constructor
     * @this {Investor}
     */
    var Investor = function() {
        this.url = API_BASE_URL + '/investors.json';
    };

    Investor.prototype = Object.create(Model);

    /**
     * A function called on the response object that returns the raw model data
     * This is overridden for each subclass of model for different paths to the data
     *
     * @override
     * @param {object} response The response returned from the API
     * @return {array} A list of investors extracted from the response
     */
    Investor.prototype.parse = function(response) {
        return response.investors;
    };

    /**
     * This links companies and categories to the investors object so that when filtering
     * by investors we have access to the companies and categories it contains
     *
     * @param {object} companiesById An object/hash of all companies keyed by their IDs
     * @param {object} categoriesById An object/hash of all categories keyed by their IDs
     */
    Investor.prototype.linkModels = function(companiesById, categoriesById) {
        _.each(this.all, function(investor){
            investor.invested_companies = [];
            investor.invested_categories = [];
            _.each(investor.invested_company_ids, function(companyId){
                investor.invested_companies.push(companiesById[companyId]);
            });
            _.each(investor.invested_category_ids, function(categoryId){
                investor.invested_categories.push(categoriesById[categoryId]);
            });
            investor.invested_companies = _.compact(investor.invested_companies);
            investor.invested_categories = _.compact(investor.invested_categories);
        });
    };

    /**
     * Sets up a crossfilter object on all of the model's data
     * Sets up a list of named dimensions used in the filter list to filter datasets
     */
    Investor.prototype.setupDimensions = function() {
        var crossInvestors = crossfilter(this.all);

        this.dimensions = {
            byId: crossInvestors.dimension(function(investor) { return investor.id; }),
            byCompanies: crossInvestors.dimension(function(investor) { return investor.invested_company_ids; }),
            byCategories: crossInvestors.dimension(function(investor) { return investor.invested_category_ids; }),
            byTotalFunding: crossInvestors.dimension(function(investor) {
                return _.pluck(investor.invested_companies, 'total_funding');
            }),
            byFundingPerRound: crossInvestors.dimension(function(investor){
                return _.pluck(_.flatten(_.pluck(investor.invested_companies, 'funding_rounds')), 'raised_amount');
            }),
            byMostRecentFundingRound: crossInvestors.dimension(function(investor){
                return _.map(investor.invested_companies, function(company){
                    return _.max(company.funding_rounds, function(round){
                        return round.funded_on ? d3.time.format('%x').parse(round.funded_on) : 0;
                    }).raised_amount;
                });
            }),
            byStatuses: crossInvestors.dimension(function(investor) {
                return _.pluck(investor.invested_companies, 'status');
            })
        };

        this.byName = crossInvestors.dimension(function(investor) { return investor.name; });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    Investor.prototype.dataSets = {
        dataForInvestorsList: ['byId']
    };

    /**
    * A list of functions that filter on a single dimension
    * When building datasets every filter is applied to that dataset except what's in the exclusion list
    * Adding a new filter here will apply the filter to every dataset unless its excluded
    */
    Investor.prototype.filters = {
        byCompanies: function() {
            var ids = this.filterData.companyIds;
            this.dimensions.byCompanies.filter(function(companyIds) {
                return (ids.length === 0 || _.intersection(companyIds, ids).length > 0);
            });
        },
        byCategories: function() {
            var ids = this.filterData.categoryIds;
            this.dimensions.byCategories.filter(function(categoryIds) {
                return (ids.length === 0 || _.intersection(categoryIds, ids).length > 0);
            });
        },
        byId: function() {
            var ids = this.filterData.investorIds;
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        },
        byTotalFunding: function() {
            var range = this.filterData.ranges;
            this.dimensions.byTotalFunding.filter(function(company_funding) {
                return fallsWithinRange(company_funding, range);
            });
        },
        byFundingPerRound: function() {
            var range = this.filterData.ranges;
            this.dimensions.byFundingPerRound.filter(function(company_funding) {
                return fallsWithinRange(company_funding, range);
            });
        },
        byMostRecentFundingRound: function() {
            var range = this.filterData.mostRecentRoundRanges;
            this.dimensions.byMostRecentFundingRound.filter(function(company_funding) {
                return fallsWithinRange(company_funding, range);
            });
        },
        byStatus: function() {
            var statuses = this.filterData.statuses;
            this.dimensions.byStatuses.filter(function(company_statuses) {
                if(statuses.length === 0) { return true; }

                for(var i = 0; i < company_statuses.length; i++) {
                    var company_status = company_statuses[i];
                    return _.contains(statuses, company_status);
                }
            });
        }
    };

    function fallsWithinRange(items, range) {
        if(items.length === 0) { return false; }
        if(range.length === 0) { return true; }


        for(var i = 0; i < items.length; i++) {
            var item = items[i];

            if(item >= range[0] && item <= range[1]) {
                return true;
            }
        }

        return false;
    }
    return new Investor();
});