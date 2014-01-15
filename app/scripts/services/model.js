'use strict';

angular.module('crunchinatorApp.models').service('Model', function($rootScope, $http) {
    /**
     * Creates an instance of Model.
     *
     * @constructor
     * @this {Model}
     */
    var Model = function() {
        this.all = [];
        this.dimensions = [];
    };

    /**
     * Fetch uses the url set on the class to $http.get a response from the API
     * We call the parse function on the response which returns a list of unfiltered data
     *
     * @return {object} A promise object?
     */
    Model.prototype.fetch = function() {
        var self = this;
        if (!this.url) { throw new Error('You must specify a url on the class'); }
        return $http.get(self.url).success(function(response) { self.all = self.parse(response); });
    };

    /**
     * A function called on the response object that returns the raw model data
     * This is overridden for each subclass of model for different paths to the data
     *
     * @param {object} response The response returned from the API
     * @return {array} A list of models extracted from the response
     */
    Model.prototype.parse = function(response) {
        return response;
    };

    /**
     * Loop through all of the model's crossfilter dimensions and reset their filters
     */
    Model.prototype.resetAllDimensions = function() {
        _.each(this.dimensions, function (dimension) {
            dimension.filterAll();
        });
    };

    /**
     * Loop through the Model's dataSet hash
     * Each key/value pair corresponds to a data set name/exclusion list
     * Create and set a data list for each key/value pair in the hash
     *
     * @param {object} filterData A hash data required by the filters
     */
    Model.prototype.runFilters = function(filterData) {
        var self = this;
        this.filterData = filterData;
        _.each(this.dataSets, function(exclusions, setName) {
            self.resetAllDimensions();
            self.applyFilters(exclusions);
            self[setName] = self.byName.bottom(Infinity);
        });
    };

    /**
     * Apply all the filters attached to the Model except those specified in exlusions 
     *
     * @param {array} exclusions An array of filters we do not want to be applied to a data set
     */
    Model.prototype.applyFilters = function(exclusions) {
        var self = this;
        exclusions = exclusions || [];
        _.each(this.filters, function(filterFunction, filterName) {
            if(!_.contains(exclusions, filterName)) {
                filterFunction.bind(self)();
            }
        });
    };

    /**
     * Returns a count of objects in the model
     *
     * @return {number} A count of all, unfiltered, objects
     */
    Model.prototype.count = function() {
        return this.all.length;
    };

    return new Model();
});
