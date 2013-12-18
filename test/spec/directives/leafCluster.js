'use strict';

describe('Directive: leafCluster', function () {

  // load the directive's module
  beforeEach(module('tmpApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<leaf-cluster></leaf-cluster>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the leafCluster directive');
  }));
});
