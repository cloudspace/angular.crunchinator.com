'use strict';

angular.module('crunchinatorApp.models').service('Company', function(Model, API_BASE_URL) {
    /**
     * Creates an instance of Company.
     *
     * @constructor
     * @this {Company}
     */
    var Company = function() {
        this.url = API_BASE_URL + '/companies.json';
    };

    Company.prototype = Object.create(Model);

    /**
     * A function called on the response object that returns the raw model data
     * This is overridden for each subclass of model for different paths to the data
     *
     * @override
     * @param {object} response The response returned from the API
     * @return {array} A list of companies extracted from the response
     */
    Company.prototype.parse = function(response) {
        return response.companies;
    };

    /**
     * Sets up a crossfilter object on all of the model's data
     * Sets up a list of named dimensions used in the filter list to filter datasets
     */
    Company.prototype.setupDimensions = function() {
        var crossCompanies = crossfilter(this.all);

        this.dimensions = {
            byId: crossCompanies.dimension(function(company) { return company.id; }),
            byCategory: crossCompanies.dimension(function(company) { return company.category_id; }),
            byInvestors: crossCompanies.dimension(function(company) { return company.investor_ids; }),
            byTotalFunding: crossCompanies.dimension(function(company) { return company.total_funding; }),
            byAcquiredOn: crossCompanies.dimension(function(company){ return company.acquired_on; }),
            byFundingRoundMonth: crossCompanies.dimension(function(company){
                return _.compact(_.pluck(company.funding_rounds, 'funded_on'));
            }),
            byFoundedOn: crossCompanies.dimension(function(company){ return company.founded_on; }),
            byFundingPerRound: crossCompanies.dimension(function(company){
                return _.pluck(company.funding_rounds, 'raised_amount');
            }),
            byMostRecentFundingRound: crossCompanies.dimension(function(company){
                return _.max(company.funding_rounds, function(round){
                    return round.funded_on ? d3.time.format('%x').parse(round.funded_on) : 0;
                }).raised_amount;
            }),
            byStatuses: crossCompanies.dimension(function(company) { return company.status; }),
            byState: crossCompanies.dimension(function(company) { return company.state_code; })
        };

        this.byName = crossCompanies.dimension(function(company) { return company.name; });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    Company.prototype.dataSets = {
        dataForCompaniesList: ['byId'],
        dataForTotalFunding: ['byTotalFunding'],
        dataForLocationMap: ['byState'],
        dataForCategoriesList: ['byCategory'],
        dataForFundingRoundAreaChart: ['byFundingActivity'],
        dataForAcquiredOnAreaChart: ['byAcquiredDate'],
        dataForFoundedOnAreaChart: ['byFoundedDate'],
        dataForFundingPerRound: ['byFundingPerRound'],
        dataForMostRecentFundingRound: ['byMostRecentFundingRound'],
        dataForCompanyStatus: ['byStatus']
    };

    /**
    * A list of functions that filter on a single dimension
    * When building datasets every filter is applied to that dataset except what's in the exclusion list
    * Adding a new filter here will apply the filter to every dataset unless its excluded
    */
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
        },
        byTotalFunding: function() {
            var range = this.filterData.ranges;
            this.dimensions.byTotalFunding.filter(function(funding) {
                return (range.length === 0 || (funding >= range[0] && funding <= range[1]));
            });
        },
        byFundingPerRound: function() {
            var range = this.filterData.roundRanges;
            this.dimensions.byFundingPerRound.filter(function(funding) {
                return (range.length === 0 || (funding >= range[0] && funding <= range[1]));
            });
        },
        byMostRecentFundingRound: function() {
            var range = this.filterData.mostRecentRoundRanges;
            this.dimensions.byMostRecentFundingRound.filter(function(funding) {
                return (range.length === 0 || (funding >= range[0] && funding <= range[1]));
            });
        },
        byStatus: function() {
            var statuses = this.filterData.statuses;
            this.dimensions.byStatuses.filter(function(status) {
                return (statuses.length === 0 || _.contains(statuses, status));
            });
        },
        byState: function() {
            var states = this.filterData.states;
            this.dimensions.byState.filter(function(state){
                return (states.length === 0 || _.contains(states, state));
            });
        },
        byFundingActivity: function() {
            var range = this.filterData.fundingActivity;
            var self = this;
            this.dimensions.byFundingRoundMonth.filter(function(round_dates) {
                return fallsWithinRange(_.map(round_dates, self.format.parse), range);
            });
        },
        byAcquiredDate: function() {
            var range = this.filterData.acquiredDate;
            var self = this;
            this.dimensions.byAcquiredOn.filter(function(acquired_on) {
                acquired_on = acquired_on ? self.format.parse(acquired_on) : new Date(1, 1, 1);
                return (range.length === 0 || (acquired_on >= range[0] && acquired_on <= range[1]));
            });
        },
        byFoundedDate: function() {
            var range = this.filterData.foundedDate;
            var self = this;
            this.dimensions.byFoundedOn.filter(function(founded_on) {
                founded_on = founded_on ? self.format.parse(founded_on) : new Date(1, 1, 1);
                return (range.length === 0 || (founded_on >= range[0] && founded_on <= range[1]));
            });
        }
    };

    function fallsWithinRange(items, range) {
        if(range.length === 0) { return true; }
        if(items.length === 0) { return false; }


        for(var i = 0; i < items.length; i++) {
            var item = items[i];

            if(item >= range[0] && item <= range[1]) {
                return true;
            }
        }

        return false;
    }

    return new Company();
});