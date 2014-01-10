'use strict';

describe('Service: Investor', function () {

    // load the service's module
    beforeEach(module('crunchinatorApp.models'));

    // instantiate service
    var Investor;
    beforeEach(inject(function (_Investor_) {
        Investor = _Investor_;
    }));

    it('should do something', function () {
        expect(!!Investor).toBe(true);
    });

});
