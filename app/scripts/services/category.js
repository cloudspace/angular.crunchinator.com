'use strict';

angular.module('crunchinatorApp.models').service('Category', function(Model, API_BASE_URL) {
    var Category = function() {
        this.url = API_BASE_URL + '/categories.json';
    };

    Category.prototype = Object.create(Model);

    Category.prototype.parse = function(response) {
        return response.categories;
    };

    Category.prototype.setupDimensions = function() {
        var crossCategories = crossfilter(this.all);

        this.dimensions = {
            'byId': crossCategories.dimension(function(category) { return category.id; }),
            'byCompanies': crossCategories.dimension(function(category) { return category.company_ids; }),
            'byInvestors': crossCategories.dimension(function(category) { return category.investor_ids; })
        };

        this.categoriesByName = crossCategories.dimension(function(category) { return category.name; });
    };

    Category.prototype.filterGroups = {
        'dataForCategoryList': function() {
            this.resetAllDimensions();

            var exclusions = ['byId'];
            this.applyFilters(exclusions);

            this.dataForCategoryList = this.categoriesByName.bottom(Infinity);
        }
    };

    Category.prototype.filters = {
        'byCompanies': function() {
            var ids = this.filterData.companyIds;
            this.dimensions.byCompanies.filter(function(companyIds) {
                return (ids.length === 0 || _.intersection(companyIds, ids).length > 0);
            });
        },
        'byInvestors': function() {
            var ids = this.filterData.investorIds;
            this.dimensions.byInvestors.filter(function(investorIds) {
                return (ids.length === 0 || _.intersection(investorIds, ids).length > 0);
            });
        },
        'byId': function() {
            var ids = this.filterData.categoryIds;
            this.dimensions.byId.filter(function(id) {
                return (ids.length === 0 || ids.indexOf(id) > -1);
            });
        }
    };

    return new Category();
});
