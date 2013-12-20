'use strict';

describe('Controller: CrunchinatorCtrl', function () {

  // load the controller's module
  beforeEach(module('crunchinatorApp.controllers'));

  var CrunchinatorCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CrunchinatorCtrl = $controller('CrunchinatorCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(!!CrunchinatorCtrl).toBeTruthy();
  });
});
