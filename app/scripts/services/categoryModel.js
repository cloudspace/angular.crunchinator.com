'use strict';

angular.module('crunchinatorApp.models').factory('CategoryModel', function(Model) {
    return Model.extend({
        url: '/categories',
        _attributes: {
            name: ''
        }
    });
});
