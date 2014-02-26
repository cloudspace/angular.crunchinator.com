'use strict';

angular.module('crunchinatorApp.models').service('FundingRound', function(Model, API_BASE_URL) {
    /**
     * Creates an instance of FundingRound.
     *
     * @constructor
     * @this {FundingRound}
     */
    var FundingRound = function() {
        this.url = API_BASE_URL + '/funding_round.json';
    };

    FundingRound.prototype = Object.create(Model);


    FundingRound.prototype.parse = function(response) {
        return response.funding_rounds;
    };

    /**
     * This links companies and investors to the round object so that when filtering
     * we have access to the other models it contians
     *
     * @param {object} companiesById An object/hash of all companies keyed by their IDs
     * @param {object} investorsById An object/hash of all categories keyed by their IDs
     */
    FundingRound.prototype.linkModels = function(companiesById, investorsById, categoriesById) {
        _.each(this.all, function(fundingRound){
            //Add funding round to company
            var company = companiesById[fundingRound.company_id];
            company.funding_rounds = company.funding_rounds || [];
            company.funding_rounds.push(fundingRound);

            //Add company to funding round
            fundingRound.company = company;

            //Add category to funding round
            fundingRound.category = categoriesById[company.category_id];

            //Add funding round to category
            fundingRound.category.funding_rounds = fundingRound.category.funding_rounds || [];
            fundingRound.category.funding_rounds.push(fundingRound);

            fundingRound.investors = [];
            _.each(fundingRound.investor_ids, function(investorId){
                var investor = investorsById[investorId];
                investor.funding_rounds = [];
                if(investor) {
                    //Add investors to funding rounds
                    fundingRound.investors.push(investor);

                    //Add funding rounds to investor
                    investor.funding_rounds.push(fundingRound);
                }
            });
        });
    };

    /**
     * Sets up a crossfilter object on all of the model's data
     * Sets up a list of named dimensions used in the filter list to filter datasets
     */
    FundingRound.prototype.setupDimensions = function() {
        var crossFundingRounds = crossfilter(this.all);
        var parse = this.format.parse;

        this.dimensions = {
            byCompanies: crossFundingRounds.dimension(function(round) { return round.companies; }),
            byFundedOn: crossFundingRounds.dimension(function(round){
                return round.funded_on ? parse(round.funded_on) : null;
            }),
            byFundingAmount: crossFundingRounds.dimension(function(round){ return round.raised_amount; }),
            byRoundCode: crossFundingRounds.dimension(function(round){ return round.round_code; })
        };

        this.byName = crossFundingRounds.dimension(function(round) {
            return round.round_code.length > 1 ? round.round_code : 'Series ' + round.round_code;
        });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    FundingRound.prototype.dataSets = {
        dataForInvestments: ['byFundedOn'],
        dataForFundingAmount: ['byFundingAmount'],
        dataForRoundName: ['byRoundCode']
    };

    /**
    * A list of functions that filter on a single dimension
    * When building datasets every filter is applied to that dataset except what's in the exclusion list
    * Adding a new filter here will apply the filter to every dataset unless its excluded
    */
    FundingRound.prototype.filters = {
        byCompanies: function() {
            var self = this;
            this.dimensions.byCompanies.filter(function(companies){
                for(var i = 0; i < companies.length; i++) {
                    //As long as one company passes the filters, return true for this investor.
                    if(self.companyPassesFilters(companies[i], self.filterData)) {
                        return true;
                    }
                }

                //Couldn't find a company that passes all the filters.
                return false;
            });
        },
        byFundedOn: function() {
            var range = this.filterData.fundingActivity;
            if (range.length > 0) {
                var self = this;
                this.dimensions.byFundedOn.filter(function(funded_on) {
                    funded_on = funded_on || new Date(1, 1, 1);
                    return self.fallsWithinRange(funded_on, range);
                });
            }
        },
        byFundingAmount: function() {
            var range = this.filterData.roundRanges;

            if (range.length > 0) {
                var self = this;
                this.dimensions.byFundingAmount.filter(function(funding) {
                    return self.fallsWithinRange(funding, range);
                });
            }
        },
        byRoundCode: function() {
            var codes = this.filterData.roundCodes;

            if (codes.length > 0) {
                this.dimensions.byRoundCode.filter(function(round_code) {
                    return (_.contains(codes, round_code));
                });
            }
        },
    };

    FundingRound.prototype.companyPassesFilters = function(company, fd){
        //Company's category is included in filters
        if(fd.categoryIds.length > 0 && !_.include(fd.categoryIds, company.catgory_id)) {
            return false;
        }

        //Company's id is included in filters
        if(fd.companyIds.length > 0 && !_.include(fd.companyIds, company.id)) {
            return false;
        }

        //Company includes filtered investor ids
        if(fd.investorIds.length > 0 && _.intersection(fd.investorIds, company.investor_ids).length < 1) {
            return false;
        }

        //Company passes all other filters
        if(!FundingRound.prototype.companyPassesFilters(company, fd)) {
            return false;
        }

        return true;
    };


    return new FundingRound();
});