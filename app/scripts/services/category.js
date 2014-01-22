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
     * @param {object} response The response returned from the API
     * @return {array} A list of categories extracted from the response
     */
    Category.prototype.parse = function(response) {
        return response.categories;
    };

    /**
     * Sets up a crossfilter object on all of the model's data
     * Sets up a list of named dimensions used in the filter list to filter datasets
     */
    Category.prototype.setupDimensions = function() {
        var crossCategories = crossfilter(this.all);

        this.dimensions = {
            byId: crossCategories.dimension(function(category) { return category.id; }),
            byCompanies: crossCategories.dimension(function(category) { return category.company_ids; }),
            byInvestors: crossCategories.dimension(function(category) { return category.investor_ids; })
        };

        this.byName = crossCategories.dimension(function(category) { return category.name; });
    };

    /**
     * A mapping of dataset names to the exclusions used when building the dataset
     * A dataset with a value of ['byId'] will have every filter applied except the one named 'byId'
     */
    Category.prototype.dataSets = {
        dataForCategoryList: ['byId']
    };

    /**
    * A list of functions that filter on a single dimension
    * When building datasets every filter is applied to that dataset except what's in the exclusion list
    * Adding a new filter here will apply the filter to every dataset unless its excluded
    */
    Category.prototype.filters = {
        byCompanies: function() {
            var ids = this.filterData.companyIds;
            this.dimensions.byCompanies.filter(function(companyIds) {
                return (ids.length === 0 || _.intersection(companyIds, ids).length > 0);
            });
        },
        byInvestors: function() {
            var ids = this.filterData.investorIds;
            this.dimensions.byInvestors.filter(function(investorIds) {
                return (ids.length === 0 || _.intersection(investorIds, ids).length > 0);
            });
        },
        byId: function() {
            var ids = this.filterData.categoryIds;
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        },
        byTotalFunding: function() {
            var ids = _.uniq(_.flatten(_.pluck(this.filterData.ranges, 'category_ids')));
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        }
    };

    return new Category();
});