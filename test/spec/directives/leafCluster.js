describe('Directive: leafCluster', function () {
  'use strict';

  // load the directive's module
  beforeEach(module('crunchinatorApp.directives'));

  var element,
  scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should be tested', inject(function ($compile) {
    expect(true).toBeTruthy();
  }));
});
