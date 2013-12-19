'use strict';
(function (ng) {
    var injector = ng.injector(['configuration', 'ng']);
    var environment = injector.get('ENV');

    var generateInvestors = function(investorCount) {
        var investorList = [];

        for(var i = 0; i < investorCount; i++) {
            investorList.push({
                id: i,
                name: 'investor' + i,
                invested_company_ids: [],
                invested_category_ids: []
            });
        }

        return investorList;
    };

    var generateCategories = function(categoryCount) {
        var categoryList = [];

        for(var i = 0; i < categoryCount; i++) {
            categoryList.push({
                id: i,
                name: 'category' + i,
                company_ids: [],
                investor_ids: []
            });
        }

        return categoryList;
    };

    var generateCompanies = function(categories, investors, companyCount) {
        var getRandomInRange = function(from, to, fixed) {
            return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
        };
        var companyList = [];

        for(var i = 0; i < companyCount; i++) {
            var company = {};
            var associationLimit = Math.floor(Math.random()*10);
            company.id = i;
            company.name = 'company' + i;
            company.zip_code = Math.floor(Math.random()*90000) + 10000;
            company.total_funding = Math.floor(Math.random()*9900000) + 100000;
            company.latitude = getRandomInRange(-124, -66, 3);
            company.longitude = getRandomInRange(22, 49, 3);
            var category = categories[Math.floor(Math.random()*categories.length)];
            company.category_code = category;

            if(category.company_ids.indexOf(company.id) === -1) {
                category.company_ids.push(company.id);
            }

            company.investor_ids = [];
            company.funding_rounds = [];

            for(var j = 0; j < associationLimit; j++) {
                var fundingRound = {};
                fundingRound.id = j;
                fundingRound.raised_amount = '$1000';
                fundingRound.funded_on = '2013-01-01';

                for(var k = 0; k < associationLimit; k++) {
                    var investor = investors[Math.floor(Math.random()*investors.length)];
                    investor.invested_company_ids.push(company.id);
                    investor.invested_category_ids.push(category.id);

                    if(category.investor_ids.indexOf(investor.id) === -1) {
                        category.investor_ids.push(investor.id);
                    }

                    if(company.investor_ids.indexOf(investor.id) === -1) {
                        company.investor_ids.push(investor.id);
                    }
                }
                company.funding_rounds.push(fundingRound);
            }
            companyList.push(company);
        }

        return companyList;
    };

    var setupStubbedBackend = function() {
        var investors = generateInvestors(100);
        var categories = generateCategories(40);
        var companies = generateCompanies(categories, investors, 100);

        ng.module('crunchinatorApp')
        .config(function($provide) {
            $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
        }).run(function($httpBackend) {
            $httpBackend.when('GET', '/companies').respond(companies);
            $httpBackend.when('GET', '/categories').respond(categories);
            $httpBackend.when('GET', '/investors').respond(investors);
            $httpBackend.when('GET', /.*/).passThrough();
        });
    };

    switch (environment) {
    case 'development':
        setupStubbedBackend();
        break;
    case 'staging':
        break;
    case 'production':
        break;
    }

})(angular);
