'use strict';

var rnd_bmt = function() {
    var x = 0, y = 0, rds, c;
    do {
        x = Math.random()*2-1;
        y = Math.random()*2-1;
        rds = x*x + y*y;
    }
    while (rds === 0 || rds > 1);
    c = Math.sqrt(-2*Math.log(rds)/rds);
    return [x*c, y*c];
};

var distributed_random = function(min, max) { return Math.floor(rnd_bmt()[0] * (max - min) + min); };


(function (ng, fk) {
    var injector = ng.injector(['configuration', 'ng']);
    var environment = injector.get('ENV');

    /**
     * Generate a company object with random, usable attributes.
     *
     * @param {number} [id] Not required. Define an ID for the returned company.
     * @return {object} A company with randomly generated data values.
     */
    var randomCompany = function(id) {
        var name = fk.Company.companyName();
        id = id || 0;
        return {
            id: id,
            name: name,
            permalink: name.toLowerCase(),
            category_id: 0,
            total_funding: distributed_random(1, 6e9), //Random between 1 and 6 billion
            latitude: 1.0,
            longitude: 1.0,
            investor_ids: [],
            funding_rounds: []
        };
    };

    /**
     * Generate an investor object with random, usable attributes.
     *
     * @param {number} [id] Not required. Define an ID for the returned investor.
     * @return {object} An investor with randomly generated data values.
     */
    var randomInvestor = function(id) {
        var type = Math.random() < 0.5 ? 'company' : 'person';
        var name = type === 'company' ? fk.Company.companyName() : fk.Name.findName();
        id = id || 0;
        return {
            id: id,
            name: name,
            investor_type: type,
            permalink: name.toLowerCase(),
            invested_company_ids: [],
            invested_category_ids: []
        };
    };

    /**
     * Generate a category object with random, usable attributes.
     *
     * @param {number} [id] Not required. Define an ID for the returned category.
     * @return {object} A category with randomly generated data values.
     */
    var randomCategory = function(id) {
        id = id || 0;
        return {
            id: id,
            name: fk.random.bs_buzz(),
            permalink: name.toLowerCase(),
            company_ids: [],
            investor_ids: []
        };
    };

    /**
     * Generate a list of data based on a supplied function
     *
     * @param {number} [count] How many items should be returned in the data list
     * @param {function} [genFn] A function that when called returns an instance of a single item in the list
     * @return {array} A list of data generated from the supplied function
     */
    var generateDataList = function(count, genFn) {
        var generated = [];
        for(var i = 0; i < count; i++){
            generated.push(genFn(i));
        }
        return generated;
    };

    /**
     * Link a generated list of data together
     *
     * @param {array} [companies] An unlinked list of companies
     * @param {array} [investors] An unlinked list of investors
     * @param {array} [categories] An unlinked list of categories
     */
    var linkGeneratedLists = function(companies, investors, categories) {
        _.each(companies, function(company){
            var category = categories[Math.floor(Math.random()*categories.length)];
            company.category_id = category.id;
            category.company_ids.push(company.id);

            _(Math.floor(Math.random() * (1) + 24)).times(function(){
                var investor = investors[Math.floor(Math.random()*investors.length)];
                company.investor_ids.push(investor.id);
                category.investor_ids.push(investor.id);
                investor.invested_company_ids.push(company.id);
                investor.invested_category_ids.push(company.category_id);
            });
        });
    };

    var setupStubbedBackend = function() {
        var categories = generateDataList(10, randomCategory);
        var investors = generateDataList(10000, randomInvestor);
        var companies = generateDataList(15000, randomCompany);
        linkGeneratedLists(companies, investors, categories);

        ng.module('crunchinatorApp')
        .config(['$provide', function($provide) {
            $provide.decorator('$httpBackend', ng.mock.e2e.$httpBackendDecorator);
        }]).run(['$httpBackend', function($httpBackend) {
            $httpBackend.when('GET', '/companies.json').respond({ companies: companies });
            $httpBackend.when('GET', '/categories.json').respond({ categories: categories });
            $httpBackend.when('GET', '/investors.json').respond({investors: investors });
            $httpBackend.when('GET', /.*/).passThrough();
            $httpBackend.when('POST', /.*/).passThrough();
            $httpBackend.when('DELETE', /.*/).passThrough();
            $httpBackend.when('PUT', /.*/).passThrough();
        }]);
    };

    var base_url = '';
    switch (environment) {
    case 'development':
        setupStubbedBackend();
        break;
    case 'staging':
        base_url = 'https://s3.amazonaws.com/temp.crunchinator.com/fakedata';
        break;
    case 'production':
        base_url = 'https://s3.amazonaws.com/temp.crunchinator.com/realdata';
        break;
    }

    ng.module('crunchinatorApp.models').constant('API_BASE_URL', base_url);
})(angular, window.Faker);