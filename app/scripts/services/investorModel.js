'use strict';

angular.module('crunchinatorApp.models').factory('InvestorModel', function(Model, API_BASE_URL) {
    return Model.extend({
        url: API_BASE_URL + '/investors.json',
        _attributes: {
            id: -1,
            name: ''
        }
    });
});
