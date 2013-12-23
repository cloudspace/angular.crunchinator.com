'use strict';

angular.module('crunchinatorApp.models').factory('CategoryModel', function(Model, API_BASE_URL) {
    return Model.extend({
        _attributes: {
            name: ''
        }
    }, {
        url: API_BASE_URL + '/categories.json',
        }
    });
});
