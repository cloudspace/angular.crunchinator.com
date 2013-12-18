describe('Service: CategoryModel', function () {

  // load the service's module
  beforeEach(module('crunchinatorApp.models'));

  // instantiate service
  var CategoryModel;
  beforeEach(inject(function (_categoryModel_) {
    CategoryModel = _categoryModel_;
  }));

  it('should do something', function () {
    expect(!!CategoryModel).toBe(true);
  });

});
