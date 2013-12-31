'use strict';

describe('Service: InvestorModel', function () {

    // load the service's module
    beforeEach(module('crunchinatorApp.models'));

    // instantiate service
    var InvestorModel;
    beforeEach(inject(function (_InvestorModel_) {
        InvestorModel = _InvestorModel_;
    }));

    it('should do something', function () {
        expect(!!InvestorModel).toBe(true);
    });

});
