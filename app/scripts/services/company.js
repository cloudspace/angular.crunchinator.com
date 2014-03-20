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

    Company.prototype.constructor = Company;

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
        var parse = this.format.parse;

        this.dimensions = {
            byId: crossCompanies.dimension(function(company) { return company.id; }),
            byCategory: crossCompanies.dimension(function(company) { return company.category_id; }),
            byInvestors: crossCompanies.dimension(function(company) { return company.investor_ids; }),
            byTotalFunding: crossCompanies.dimension(function(company) { return company.total_funding; }),
            byAcquiredOn: crossCompanies.dimension(function(company){
                return company.acquired_on ? parse(company.acquired_on) : null;
            }),
            byAcquiredValue: crossCompanies.dimension(function(company) { return company.acquired_value; }),
            byFundingRounds: crossCompanies.dimension(function(company){ return company.funding_rounds || []; }),
            byFoundedOn: crossCompanies.dimension(function(company){
                return company.founded_on ? parse(company.founded_on) : null;
            }),
            byMostRecentRaisedAmount: crossCompanies.dimension(function(company){
                return company.most_recent_raised_amount;
            }),
            byStatuses: crossCompanies.dimension(function(company) { return company.status; }),
            byState: crossCompanies.dimension(function(company) { return company.state_code; }),
            byIPOValue: crossCompanies.dimension(function(company) {
                return company.ipo_valuation ? company.ipo_valuation : null;
            }),
            byIPODate: crossCompanies.dimension(function(company) {
                return company.ipo_on ? parse(company.ipo_on) : null;
            })
        };

        this.byName = crossCompanies.dimension(function(company) { return company.name; });

        var allCompanies = this.all;

        var fundingValues = _.pluck(allCompanies, 'total_funding');
        var ipoValues = _.pluck(allCompanies, 'ipo_valuation');
        var acquiredValues = _.pluck(allCompanies, 'acquired_value');

        this.maxCompanyValue = parseInt(_.max(fundingValues, function(n){ return parseInt(n); }));
        this.maxRecentFundingValue = parseInt(_.max(allCompanies, function(n){
            return parseInt(n.most_recent_raised_amount);
        }).most_recent_raised_amount);
        this.maxIPOValue = parseInt(_.max(ipoValues, function(n) { return parseInt(n); }));
        this.maxAcquiredValue = parseInt(_.max(acquiredValues, function(n) { return parseInt(n); }));
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    Company.prototype.dataSets = {
        dataForCompaniesList: ['byId'],
        dataForCategoriesList: ['byCategory'],
        dataForInvestorsList: ['byInvestors'],
        dataForTotalFunding: ['byTotalFunding'],
        dataForLocationMap: ['byState'],
        dataForFundingRoundAreaChart: ['byFundingActivity'],
        dataForAcquiredOnAreaChart: ['byAcquiredDate'],
        dataForFoundedOnAreaChart: ['byFoundedDate'],
        dataForFundingPerRound: ['byFundingPerRound'],
        dataForMostRecentRaisedAmount: ['byMostRecentRaisedAmount'],
        dataForCompanyStatus: ['byStatus'],
        dataForIPOValue: ['byIPOValue'],
        dataForIPODate: ['byIPODate'],
        dataForAcquiredValue: ['byAcquiredValue'],
        dataForRoundCodesList: ['byFundingRoundCode']
    };

    /**
    * A list of functions that filter on a single dimension
    * When building datasets every filter is applied to that dataset except what's in the exclusion list
    * Adding a new filter here will apply the filter to every dataset unless its excluded
    */
    Company.prototype.filters = {
        byCategory: function() {
            var ids = this.filterData.categoryIds;

            if (ids.length > 0) {
                this.dimensions.byCategory.filter(function(categoryId) {
                    return (ids.indexOf(categoryId) > -1);
                });
            }
        },
        byInvestors: function() {
            var ids = this.filterData.investorIds;

            if (ids.length > 0) {
                this.dimensions.byInvestors.filter(function(investorIds) {
                    return (_.intersection(investorIds, ids).length > 0);
                });
            }
        },
        byId: function() {
            var ids = this.filterData.companyIds;

            if (ids.length > 0) {
                this.dimensions.byId.filter(function(id) {
                    return (ids.indexOf(id) > -1);
                });
            }
        },
        byTotalFunding: function() {
            var range = this.filterData.ranges;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byTotalFunding.filter(function(funding) {
                    return self.fallsWithinRange(funding, range);
                });
            }
        },
        byMostRecentRaisedAmount: function() {
            var range = this.filterData.mostRecentRoundRanges;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byMostRecentRaisedAmount.filter(function(funding) {
                    return self.fallsWithinRange(funding, range);
                });
            }
        },
        byStatus: function() {
            var statuses = this.filterData.statuses;

            if (statuses.length > 0) {
                this.dimensions.byStatuses.filter(function(status) {
                    return (_.contains(statuses, status));
                });
            }
        },
        byState: function() {
            var states = this.filterData.states;

            if (states.length > 0) {
                this.dimensions.byState.filter(function(state){
                    return (_.contains(states, state));
                });
            }
        },
        byAcquiredDate: function() {
            var range = this.filterData.acquiredDate;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byAcquiredOn.filter(function(acquired_on) {
                    acquired_on = acquired_on || new Date(1, 1, 1);
                    return self.fallsWithinRange(acquired_on, range);
                });
            }
        },
        byFoundedDate: function() {
            var range = this.filterData.foundedDate;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byFoundedOn.filter(function(founded_on) {
                    founded_on = founded_on || new Date(1, 1, 1);
                    return self.fallsWithinRange(founded_on, range);
                });
            }
        },
        byIPOValue: function() {
            var range = this.filterData.ipoValueRange;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byIPOValue.filter(function(ipo) {
                    return self.fallsWithinRange(ipo, range);
                });
            }
        },
        byIPODate: function() {
            var range = this.filterData.ipoDateRange;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byIPODate.filter(function(ipo_on) {
                    ipo_on = ipo_on || new Date(1, 1, 1);
                    return self.fallsWithinRange(ipo_on, range);
                });
            }
        },
        byAcquiredValue: function() {
            var range = this.filterData.acquiredValueRange;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byAcquiredValue.filter(function(acquired_value) {
                    return self.fallsWithinRange(acquired_value, range);
                });
            }
        },
        byFundingRounds: function() {
            var self = this;
            this.dimensions.byFundingRounds.filter(function(funding_rounds){
                //A company fails if none of its rounds passes filters.
                for(var i = 0; i < funding_rounds.length; i++) {
                    var round = funding_rounds[i];
                    if(self.roundPassesFilters(round, self.filterData)){
                        return true;
                    }
                }
                return false;
            });
        }
    };

    return new Company();
});
