'use strict';

angular.module('crunchinatorApp.models').service('Category', function(Model, API_BASE_URL) {
    /**
     * Creates an instance of Category.
     *
     * @constructor
     * @this {Category}
     */
    var Category = function() {
        this.url = API_BASE_URL + '/categories.json';
    };

    Category.prototype = Object.create(Model);

    /**
     * A function called on the response object that returns the raw model data
     * This is overridden for each subclass of model for different paths to the data
     *
     * @override
     * @param {object} [response] The response returned from the API
     * @return {array} A list of categories extracted from the response
     */
    Category.prototype.parse = function(response) {
        return response.categories;
    };

    /**
     * This links companies and investors to the category object so that when filtering
     * by categories we have access to the companies and investors it contains
     *
     * @param {object} [companiesById] An object/hash of all companies keyed by their IDs
     * @param {object} [investorsById] An object/hash of all categories keyed by their IDs
     */
    Category.prototype.linkModels = function(companiesById, investorsById) {
        _.each(this.all, function(category){
            category.companies = [];
            category.investors = [];

            _.each(category.company_ids, function(companyId){
                category.companies.push(companiesById[companyId]);
            });

            _.each(category.investor_ids, function(investorId){
                category.investors.push(investorsById[investorId]);
            });

            category.companies = _.compact(category.companies);
            category.investors = _.compact(category.investors);
        });
    };

    /**
     * Sets up a crossfilter object on all of the model's data
     * Sets up a list of named dimensions used in the filter list to filter datasets
     */
    Category.prototype.setupDimensions = function() {
        var crossCategories = crossfilter(this.all);

        this.dimensions = {
            byCompanies: crossCategories.dimension(function(category) { return category.companies; })
        };

        this.byName = crossCategories.dimension(function(category) { return category.name; });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    Category.prototype.dataSets = {
        dataForCategoryList: []
    };

    /**
    * A list of functions that filter on a single dimension
    * When building datasets every filter is applied to that dataset except what's in the exclusion list
    * Adding a new filter here will apply the filter to every dataset unless its excluded
    */
    Category.prototype.filters = {
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
        }
    };

    //Determines if a company passes
    Category.prototype.companyPassesFilters = function(company, filterData){
        var self = this;
        var parse = this.format.parse;

        //byCompanyId
        if (filterData.companyIds.length !== 0) {
            if(!_.contains(filterData.companyIds, company.id)) { return false; }
        }

        //byInvestorIds
        if(filterData.investorIds.length !== 0) {
            if(_.intersection(filterData.investorIds, company.investor_ids).length === 0) { return false; }
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

        //byIPODate
        if (filterData.ipoDateRange.length !== 0) {
            if(!company.ipo_on) { return false; }
            if(!self.fallsWithinRange(parse(company.ipo_on), filterData.ipoDateRange)) { return false; }
        }

        return true;
    };

    return new Category();
});