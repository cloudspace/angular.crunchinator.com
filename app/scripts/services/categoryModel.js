'use strict';

angular.module('crunchinatorApp.models').factory('CategoryModel', function(Model, API_BASE_URL) {
    return Model.extend({
        url: API_BASE_URL + '/categories.json',
        _attributes: {
            name: ''
        }
    });
});
