(function (ng) {
  var injector = ng.injector(['configuration', 'ng']);
  var environment = injector.get('ENV');

  var generateInvestors = function(investorCount) {
    var investorList = [];

    for(var i = 0; i < investorCount; i++) {
      investorList.push({id: i, name: "investor" + i});
    }

    return investorList;
  };

  var generateCategories = function(categoryCount) {
    var categoryList = [];

    for(var i = 0; i < categoryCount; i++) {
      categoryList.push({name: "category" + i});
    }

    return categoryList;
  };

  var generateCompanies = function(categories, investors, companyCount) {
    companyList = [];

    for(var i = 0; i < companyCount; i++) {
      var company = {};
      var associationLimit = Math.floor(Math.random()*10) + 1;
      company.id = i;
      company.name = "company" + i;
      company.zip_code = Math.floor(Math.random()*90000) + 10000;
      company.total_funding = "$1";
      company.category_code = categories[Math.floor(Math.random()*categories.length) + 1];
      company.funding_rounds = [];

      for(var j = 0; j < associationLimit; j++) {
        var fundingRound = {};

        fundingRound.id = j;
        fundingRound.raised_amount = "$1000";
        fundingRound.funded_on = "2013-01-01";
        fundingRound.investors = [];

        for(var k = 0; k < associationLimit; k++) {
          fundingRound.investors.push(investors[Math.floor(Math.random()*investors.length) + 1]);
        }
        company.funding_rounds.push(fundingRound);
      }
      companyList.push(company);
    }

    return companyList;
  };

  setupStubbedBackend = function() {
    var investors = generateInvestors(1000);
    var categories = generateCategories(40);
    var companies = generateCompanies(categories, investors, 1000);

    ng.module('ngBoilerplate.crunchinator').
      config(function($provide) {
        $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
      }).
      run(function($httpBackend) {
        $httpBackend.when('GET', '/companies').respond(companies);
        $httpBackend.when('GET', '/categories').respond(categories);
        $httpBackend.when('GET', '/investors').respond(investors);
      });
  };

  switch (environment) {
    case "development":
      setupStubbedBackend();
      break;
    case "staging":
      break;
    case "production":
      break;
  }

})(angular);
