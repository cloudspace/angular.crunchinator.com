'use strict';

angular.module('crunchinatorApp.models').service('Model', function($rootScope, $http) {
    var Model = function() {
        this.all = [];
        this.dimensions = [];
    };

    Model.prototype.fetch = function() {
        var self = this;
        var url = self.url;
        var parse = self.parse;

        if (!url) { throw new Error('You must specify a url on the class'); }
        return $http.get(url).success(function(response) { self.all = self.parse(response); });
    };

    Model.prototype.resetAllDimensions = function() {
        _.each(this.dimensions, function (dimension) {
            dimension.filterAll();
        }); 
    };

    Model.prototype.runFilters = function(filterData) {
        var self = this;
        this.filterData = filterData;
        _.each(this.filterGroups, function(filterGroupFunction, name) {
            filterGroupFunction.bind(self)();
        });
    };

    Model.prototype.applyFilters = function(exclusions) {
        var self = this;
        var exclusions = exclusions || [];
        _.each(this.filters, function(filterFunction, filterName) {
            if(!_.contains(exclusions, filterName)) {
                filterFunction.bind(self)();
            }
        });
    }

    return new Model();
});
