angular.module('crunchinatorApp.models').factory('CompanyModel', function(Model) {
    return Model.extend({
        url: '/companies',
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
