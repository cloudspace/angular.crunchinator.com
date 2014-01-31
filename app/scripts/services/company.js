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
        window._Company = this;
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
                return _.pluck(company.funding_rounds, 'funded_on');
            }),
            byFoundedOn: crossCompanies.dimension(function(company){ return company.founded_on; }),
            byFundingPerRound: crossCompanies.dimension(function(company){
                return _.pluck(company.funding_rounds, 'raised_amount');
            }),
            byMostRecentFundingRound: crossCompanies.dimension(function(company){
                return _.max(company.funding_rounds, function(round){
                    return round.funded_on ? d3.time.format('%x').parse(round.funded_on) : 0;
                }).raised_amount;
            })
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
        dataForLocationMap: [],
        dataForCategoriesList: ['byCategory'],
        dataForFundingRoundAreaChart: [],
        dataForAcquiredOnAreaChart: [],
        dataForFoundedOnAreaChart: [],
        dataForFundingPerRound: ['byFundingPerRound'],
        dataForMostRecentFundingRound: ['byMostRecentFundingRound']
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
            var ranges = this.filterData.ranges;
            this.dimensions.byTotalFunding.filter(function(funding) {
                if (ranges.length) {
                    for(var i = 0; i < ranges.length; i++) {
                        var range = ranges[i];
                        if(funding > range.start && funding < range.end) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return true;
                }
            });
        },
        byFundingPerRound: function() {
            var ranges = this.filterData.roundRanges;
            this.dimensions.byFundingPerRound.filter(function(roundFunding){
                if(ranges.length) {
                    for(var i = 0; i < ranges.length; i++) {
                        var range = ranges[i];
                        for(var j = 0; j < roundFunding.length; j++) {
                            var roundAmount = roundFunding[j];
                            if(roundAmount > range.start && roundAmount < range.end) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                else {
                    return true;
                }
            });
        },
        byMostRecentFundingRound: function() {
            var ranges = this.filterData.mostRecentRoundRanges;
            this.dimensions.byMostRecentFundingRound.filter(function(funding) {
                if (ranges.length) {
                    for(var i = 0; i < ranges.length; i++) {
                        var range = ranges[i];
                        if(funding > range.start && funding < range.end) {
                            return true;
                        }
                    }
                    return false;
                }
                else {
                    return true;
                }
            });
        }
    };

    return new Company();
});