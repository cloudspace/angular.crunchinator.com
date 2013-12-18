describe('Service: CompanyModel', function () {

  // load the service's module
  beforeEach(module('crunchinatorApp.models'));

  // instantiate service
  var CompanyModel;
  beforeEach(inject(function (_companyModel_) {
    CompanyModel = _companyModel_;
  }));

  it('should do something', function () {
    expect(!!CompanyModel).toBe(true);
  });

});
