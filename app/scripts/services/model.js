'use strict';

angular.module('crunchinatorApp.models').service('Model', function($rootScope, $http) {
    var Model = function() {
        this.all = [];
        this.dimensions = [];
    };

    //Fetches all items from url specified on the class
    Model.prototype.fetch = function() {
        var self = this;
        var url = self.url;

        if (!url) { throw new Error('You must specify a url on the class'); }
        return $http.get(url).success(function(response) { self.all = self.parse(response); });
    };

    //Parses the response returned from fetch to find the necessary data
    Model.prototype.parse = function(response) {
        return response;
    };

    //Loop through all of the model's crossfilter dimensions and reset their filters
    Model.prototype.resetAllDimensions = function() {
        _.each(this.dimensions, function (dimension) {
            dimension.filterAll();
        });
    };

    //Loop through all of the model's filter groups and run the function.
    //Each function should set a filtered list of models on the class
    Model.prototype.runFilters = function(filterData) {
        var self = this;
        this.filterData = filterData;
        _.each(this.filterGroups, function(filterGroupFunction) {
            filterGroupFunction.bind(self)();
        });
    };

    //Loops through all of the model's filters and apply them to the dimension specified in the function
    Model.prototype.applyFilters = function(exclusions) {
        var self = this;
        exclusions = exclusions || [];
        _.each(this.filters, function(filterFunction, filterName) {
            if(!_.contains(exclusions, filterName)) {
                filterFunction.bind(self)();
            }
        });
    };

    //Returns a count of all the objects
    Model.prototype.count = function() {
        return this.all.length;
    };

    return new Model();
});
