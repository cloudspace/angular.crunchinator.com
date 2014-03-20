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

    Investor.prototype.constructor = Investor;

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
                var company = companiesById[companyId];

                if(company) {
                    //Add company to investor
                    investor.invested_companies.push(company);
                }
            });

            //Add category to investor
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
            byCompanies: crossInvestors.dimension(function(investor) { return investor.invested_companies; }),
            byFundingRounds: crossInvestors.dimension(function(investor) { return investor.funding_rounds || []; })
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
        byFundingRounds: function() {
            var self = this;
            this.dimensions.byFundingRounds.filter(function(funding_rounds){
                //An investor fails if none of its rounds passes filters.
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

    /**
     * Checks to see if a FundingRound passes filtering. Calls super-class method,
     * 'roundPassesFilters' to check general filters.
     *
     * @override
     * @param {object} a FundingRound to check filters against.
     * @param {object} current filter parameters.
     * @returns {boolean} whether a FundingRound passes the current filter state.
     */
    Investor.prototype.roundPassesFilters = function(round, fd){
        //Round's category is included in filters
        if(fd.categoryIds.length > 0 && !_.include(fd.categoryIds, round.company.category_id)) {
            return false;
        }

        //Round's company is included in filters
        if(fd.companyIds.length > 0 && !_.include(fd.companyIds, round.company.id)) {
            return false;
        }

        //Round passes all other filters
        if(!Model.roundPassesFilters(round, fd)) {
            return false;
        }

        return true;
    };

    /**
     * Checks to see if a Company passes Investor specific filtering. Calls super-class method,
     * 'companyPassesFilters' to check general filters.
     *
     * @override
     * @param {object} a Company to check filters against.
     * @param {object} current filter parameters.
     * @returns {boolean} whether a Company passes the current filter state.
     */
    Investor.prototype.companyPassesFilters = function(company, fd){
        //Company's category is included in filters
        if(fd.categoryIds.length > 0 && !_.include(fd.categoryIds, company.category_id)) {
            return false;
        }

        //Company's id is included in filters
        if(fd.companyIds.length > 0 && !_.include(fd.companyIds, company.id)) {
            return false;
        }

        //Company passes all other filters
        if(!Model.companyPassesFilters(company, fd)) {
            return false;
        }

        return true;
    };

    return new Investor();
});
