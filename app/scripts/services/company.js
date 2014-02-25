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
        window._companies = this;
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
            byFundingRoundMonth: crossCompanies.dimension(function(company){
                return _.map(company.funding_rounds, function(company){
                    return company.funded_on ? parse(company.funded_on) : null;
                });
            }),
            byFoundedOn: crossCompanies.dimension(function(company){
                return company.founded_on ? parse(company.founded_on) : null;
            }),
            byFundingPerRound: crossCompanies.dimension(function(company){
                return _.pluck(company.funding_rounds, 'raised_amount');
            }),
            byFundingRoundCode: crossCompanies.dimension(function(company){
                return _.pluck(company.funding_rounds, 'round_code');
            }),
            byMostRecentFundingRound: crossCompanies.dimension(function(company){
                return _.max(company.funding_rounds, function(round){
                    return round.funded_on ? parse(round.funded_on) : 0;
                }).raised_amount;
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
        var allFundingValues = _.pluck(_.flatten(_.pluck(allCompanies, 'funding_rounds')), 'raised_amount');
        var fundingValues = _.pluck(allCompanies, 'total_funding');
        var recentRounds = _.map(allCompanies, function(company){
            return _.max(company.funding_rounds, function(round){
                return round.funded_on ? parse(round.funded_on) : 0;
            }).raised_amount;
        });
        var ipoValues = _.pluck(allCompanies, 'ipo_valuation');
        var acquiredValues = _.pluck(allCompanies, 'acquired_value');

        this.maxFundingValue = parseInt(_.max(allFundingValues, function(n){ return parseInt(n); }));
        this.maxCompanyValue = parseInt(_.max(fundingValues, function(n){ return parseInt(n); }));
        this.maxRecentFundingValue = parseInt(_.max(recentRounds, function(n){ return parseInt(n); }));
        this.maxIPOValue = parseInt(_.max(ipoValues, function(n) { return parseInt(n); }));
        this.maxAcquiredValue = parseInt(_.max(acquiredValues, function(n) { return parseInt(n); }));
        this.fundingSeries = _.unique(_.pluck(_.flatten(_.pluck(allCompanies, 'funding_rounds')), 'round_code'));
        console.log(this.fundingSeries);
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    Company.prototype.dataSets = {
        dataForCompaniesList: ['byId'],
        //dataForCategoriesList: ['byCategory'],
        //dataForInvestorsList: ['byInvestors'],
        dataForTotalFunding: ['byTotalFunding'],
        dataForLocationMap: ['byState'],
        dataForFundingRoundAreaChart: ['byFundingActivity'],
        dataForAcquiredOnAreaChart: ['byAcquiredDate'],
        dataForFoundedOnAreaChart: ['byFoundedDate'],
        dataForFundingPerRound: ['byFundingPerRound'],
        dataForMostRecentFundingRound: ['byMostRecentFundingRound'],
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
        byFundingPerRound: function() {
            var range = this.filterData.roundRanges;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byFundingPerRound.filter(function(funding) {
                    return self.anyItemFallsWithinRange(funding, range);
                });
            }
        },
        byFundingRoundCode: function() {
            var codes = this.filterData.roundCodes;

            if (codes.length > 0) {
                this.dimensions.byFundingRoundCode.filter(function(round_codes) {
                    return (_.intersection(round_codes, codes).length > 0);
                });
            }
        },
        byMostRecentFundingRound: function() {
            var range = this.filterData.mostRecentRoundRanges;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byMostRecentFundingRound.filter(function(funding) {
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
        byFundingActivity: function() {
            var range = this.filterData.fundingActivity;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byFundingRoundMonth.filter(function(round_dates) {
                    return self.anyItemFallsWithinRange(round_dates, range);
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
        }
    };

    return new Company();
});