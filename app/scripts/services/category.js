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

    Category.prototype.constructor = Category;

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
            category.funding_rounds = [];

            _.each(category.company_ids, function(companyId){
                var company = companiesById[companyId];

                //Add company to category
                if(company) {
                    category.companies.push(company);
                }
            });

            //Add investors to category
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
            byCompanies: crossCategories.dimension(function(category) { return category.companies; }),
            byFundingRounds: crossCategories.dimension(function(category) { return category.funding_rounds; })
        };

        this.byName = crossCategories.dimension(function(category) { return category.display_name.toLowerCase(); });
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

    Category.prototype.roundPassesFilters = function(round, fd){
        //Round's company includes filtered investor ids
        if(fd.investorIds.length > 0 && _.intersection(fd.investorIds, round.company.investor_ids).length < 1) {
            return false;
        }

        //Round's company is included in filtered company ids
        if(fd.companyIds.length > 0 && !_.include(fd.companyIds, round.company.id)) {
            return false;
        }

        //Round passes all other filters
        if(!Model.roundPassesFilters(round, fd)) {
            return false;
        }

        return true;
    };

    Category.prototype.companyPassesFilters = function(company, fd){
        //Company includes filtered investor ids
        if(fd.investorIds.length > 0 && _.intersection(fd.investorIds, company.investor_ids).length < 1) {
            return false;
        }

        //Company is included in filtered company ids
        if(fd.companyIds.length > 0 && !_.include(fd.companyIds, company.id)) {
            return false;
        }

        //Company passes all other filters
        if(!Model.companyPassesFilters(company, fd)) {
            return false;
        }

        return true;
    };

    return new Category();
});
