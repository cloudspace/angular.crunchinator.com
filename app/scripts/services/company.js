'use strict';

angular.module('crunchinatorApp.models').factory('Company', function(Model, API_BASE_URL) {
    return Model.extend({
        _attributes: {
            id: -1,
            name: '',
            category: '',
            zipcode: 0,
            funding_rounds: [],
            // funding_rounds: {
            // amount_raised: 0,
            // start: new Date(),
            // end: new Date()
            // investors: [],
            // },
            total_funding: 0
        }
    }, {
        url: API_BASE_URL + '/companies.json',
        parse: function(response) {
            return response.companies;
        }
    });
});
