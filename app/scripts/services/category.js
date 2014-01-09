'use strict';

angular.module('crunchinatorApp.models').factory('Category', function(Model, API_BASE_URL) {
    return Model.extend({
        _attributes: {
            name: ''
        }
    }, {
        url: API_BASE_URL + '/categories.json',
        parse: function(response) {
            return response.categories;
        }
    });
});
