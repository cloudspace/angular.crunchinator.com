'use strict';

angular.module('crunchinatorApp.models').factory('CompanyModel', function(Model, API_BASE_URL) {
    return Model.extend({
        url: API_BASE_URL + 'companies.json',
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
    });
});
