'use strict';

describe('Service: Category', function () {

    // load the service's module
    beforeEach(module('crunchinatorApp.models'));

    // instantiate service
    var Category;
    beforeEach(inject(function (_Category_) {
        Category = _Category_;
    }));

    it('should do something', function () {
        expect(!!Category).toBe(true);
    });

});
