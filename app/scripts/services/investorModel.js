angular.module('crunchinatorApp.models').factory('InvestorModel', function(Model) {
    return Model.extend({
        url: '/investors',
        _attributes: {
            id: -1,
            name: ''
        }
    });
});
