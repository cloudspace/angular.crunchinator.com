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
        window.bad_investors = [];
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
            byCompanies: crossInvestors.dimension(function(investor) { return investor; })
        };

        this.byName = crossInvestors.dimension(function(investor) { return investor.name; });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    Investor.prototype.dataSets = {
        dataForInvestorsList: []
    };

    /**
    * A list of functions that filter on a single dimension
    * When building datasets every filter is applied to that dataset except what's in the exclusion list
    * Adding a new filter here will apply the filter to every dataset unless its excluded
    */
    Investor.prototype.filters = {
        byCompanies: function() {
            var self = this;
            this.dimensions.byCompanies.filter(function(investor){
                var companies = investor.invested_companies;
                for(var i = 0; i < companies.length; i++) {
                    //As long as one company passes the filters, return true for this investor.
                    if(self.companyPassesFilters(companies[i], self.filterData)) {
                        return true;
                    }
                }

                window.bad_investors.push(investor);

                //Couldn't find a company that passes all the filters.
                return false;
            });
        }
    };

    //Determines if a company passes
    Investor.prototype.companyPassesFilters = function(company, filterData){
        var self = this;
        var parse = this.format.parse;

        //byCompanyId
        if (filterData.companyIds.length !== 0) {
            if(!_.contains(filterData.companyIds, company.id)) { return false; }
        }

        //byCategoryId
        if(filterData.categoryIds.length !== 0) {
            if(!_.contains(filterData.categoryIds, company.category_id)) { return false; }
        }

        //byTotalFunding
        if (filterData.ranges.length !== 0) {
            if(!self.fallsWithinRange(company.total_funding, filterData.ranges)) { return false; }
        }

        //byAllFundingRoundsRaised
        if (filterData.roundRanges.length !== 0) {
            var funding_rounds_raised = _.pluck(company.funding_rounds, 'raised_amount');
            if(!self.anyItemFallsWithinRange(funding_rounds_raised, filterData.roundRanges)) { return false; }
        }

        //byMostRecentFundingRoundRaised
        if (filterData.mostRecentRoundRanges.length !== 0) {
            var most_recent_funding_amount = _.max(company.funding_rounds, function(round){
                return round.funded_on ? parse(round.funded_on) : 0;
            }).raised_amount;
            if(!self.fallsWithinRange(most_recent_funding_amount, filterData.mostRecentRoundRanges)) { return false; }
        }

        //byStatus
        if (filterData.statuses.length !== 0) {
            if(!_.contains(filterData.statuses, company.status)) { return false; }
        }

        //byState
        if (filterData.states.length !== 0) {
            if(!_.contains(filterData.states, company.state_code)) { return false; }
        }

        //byAcquiredOn
        if (filterData.acquiredDate.length !== 0) {
            if(!company.acquired_on){ return false; }
            if(!self.fallsWithinRange(parse(company.acquired_on), filterData.acquiredDate)) { return false; }
        }

        //byFoundedOn
        if (filterData.foundedDate.length !== 0) {
            if(!company.founded_on){ return false; }
            if(!self.fallsWithinRange(parse(company.founded_on), filterData.foundedDate)) { return false; }
        }

        //byAllFundingRoundsDate
        if (filterData.fundingActivity.length !== 0) {
            var funding_rounds_date = _.compact(_.map(company.funding_rounds, function(round){
                return round.funded_on ? parse(round.funded_on) : null;
            }));
            if(!self.anyItemFallsWithinRange(funding_rounds_date, filterData.fundingActivity)) { return false; }
        }

        //byIPOValue
        if (filterData.ipoValueRange.length !== 0) {
            if(!self.fallsWithinRange(company.ipo_valuation, filterData.ipoValueRange)) { return false; }
        }

        return true;
    };


    return new Investor();
});