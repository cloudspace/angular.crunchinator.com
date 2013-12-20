'use strict';

describe('Directive: d3Bars', function () {

    // load the directive's module
    beforeEach(module('crunchinatorApp.directives'));

    var scope;

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should be tested', inject(function () {
        expect(true).toBeTruthy();
    }));
});
