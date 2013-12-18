describe('Service: InvestorModel', function () {

  // load the service's module
  beforeEach(module('crunchinatorApp.models'));

  // instantiate service
  var InvestorModel;
  beforeEach(inject(function (_investorModel_) {
    InvestorModel = _investorModel_;
  }));

  it('should do something', function () {
    expect(!!InvestorModel).toBe(true);
  });

});
