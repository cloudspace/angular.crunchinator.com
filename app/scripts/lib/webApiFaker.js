'use strict';

var exponential_distribution = function(min, max) {
    var increment = (max - min) / 6;
    var num;
    do {
        var u = Math.random();
        var t = (-1 * Math.log(u))/1;
        num = min + (t * increment);
    }
    while(num <= min || num >= max);
    return Math.floor(num);
};

var randomDate = function(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

(function (ng, fk) {
    var injector = ng.injector(['configuration', 'ng']);
    var environment = injector.get('ENV');

    var states = [
        { name: 'ALABAMA', abbreviation: 'AL'},
        { name: 'ALASKA', abbreviation: 'AK'},
        { name: 'AMERICAN SAMOA', abbreviation: 'AS'},
        { name: 'ARIZONA', abbreviation: 'AZ'},
        { name: 'ARKANSAS', abbreviation: 'AR'},
        { name: 'CALIFORNIA', abbreviation: 'CA'},
        { name: 'COLORADO', abbreviation: 'CO'},
        { name: 'CONNECTICUT', abbreviation: 'CT'},
        { name: 'DELAWARE', abbreviation: 'DE'},
        { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
        { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
        { name: 'FLORIDA', abbreviation: 'FL'},
        { name: 'GEORGIA', abbreviation: 'GA'},
        { name: 'GUAM', abbreviation: 'GU'},
        { name: 'HAWAII', abbreviation: 'HI'},
        { name: 'IDAHO', abbreviation: 'ID'},
        { name: 'ILLINOIS', abbreviation: 'IL'},
        { name: 'INDIANA', abbreviation: 'IN'},
        { name: 'IOWA', abbreviation: 'IA'},
        { name: 'KANSAS', abbreviation: 'KS'},
        { name: 'KENTUCKY', abbreviation: 'KY'},
        { name: 'LOUISIANA', abbreviation: 'LA'},
        { name: 'MAINE', abbreviation: 'ME'},
        { name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
        { name: 'MARYLAND', abbreviation: 'MD'},
        { name: 'MASSACHUSETTS', abbreviation: 'MA'},
        { name: 'MICHIGAN', abbreviation: 'MI'},
        { name: 'MINNESOTA', abbreviation: 'MN'},
        { name: 'MISSISSIPPI', abbreviation: 'MS'},
        { name: 'MISSOURI', abbreviation: 'MO'},
        { name: 'MONTANA', abbreviation: 'MT'},
        { name: 'NEBRASKA', abbreviation: 'NE'},
        { name: 'NEVADA', abbreviation: 'NV'},
        { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
        { name: 'NEW JERSEY', abbreviation: 'NJ'},
        { name: 'NEW MEXICO', abbreviation: 'NM'},
        { name: 'NEW YORK', abbreviation: 'NY'},
        { name: 'NORTH CAROLINA', abbreviation: 'NC'},
        { name: 'NORTH DAKOTA', abbreviation: 'ND'},
        { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
        { name: 'OHIO', abbreviation: 'OH'},
        { name: 'OKLAHOMA', abbreviation: 'OK'},
        { name: 'OREGON', abbreviation: 'OR'},
        { name: 'PALAU', abbreviation: 'PW'},
        { name: 'PENNSYLVANIA', abbreviation: 'PA'},
        { name: 'PUERTO RICO', abbreviation: 'PR'},
        { name: 'RHODE ISLAND', abbreviation: 'RI'},
        { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
        { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
        { name: 'TENNESSEE', abbreviation: 'TN'},
        { name: 'TEXAS', abbreviation: 'TX'},
        { name: 'UTAH', abbreviation: 'UT'},
        { name: 'VERMONT', abbreviation: 'VT'},
        { name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
        { name: 'VIRGINIA', abbreviation: 'VA'},
        { name: 'WASHINGTON', abbreviation: 'WA'},
        { name: 'WEST VIRGINIA', abbreviation: 'WV'},
        { name: 'WISCONSIN', abbreviation: 'WI'},
        { name: 'WYOMING', abbreviation: 'WY' }
    ];

    /**
     * Generate a company object with random, usable attributes.
     *
     * @param {number} [id] Not required. Define an ID for the returned company.
     * @return {object} A company with randomly generated data values.
     */
    var randomCompany = function(id) {
        var name = fk.Company.companyName();
        id = id || 0;
        var statuses = ['alive', 'deadpooled', 'acquired'];

        return {
            id: id,
            name: name,
            permalink: name.toLowerCase(),
            category_id: 0,
            total_funding: exponential_distribution(1, 6e9), //Random between 1 and 6 billion
            latitude: 1.0,
            longitude: 1.0,
            acquired_on: d3.time.format('%x')(randomDate(new Date(2006, 1, 1), new Date())), //Random date between two dates
            founded_on: d3.time.format('%x')(randomDate(new Date(2000, 1, 1), new Date())),
            investor_ids: [],
            funding_rounds: [],
            status: statuses[exponential_distribution(0, statuses.length)],
            state_code: states[exponential_distribution(0, states.length)].abbreviation
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
            name: fk.random.bs_noun(),
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
            var category = categories[exponential_distribution(0, categories.length)];
            company.category_id = category.id;
            category.company_ids.push(company.id);

            _(exponential_distribution(1, 10)).times(function(){
                var investor = investors[exponential_distribution(0, investors.length)];
                company.investor_ids.push(investor.id);
                category.investor_ids.push(investor.id);
                investor.invested_company_ids.push(company.id);
                investor.invested_category_ids.push(company.category_id);

                company.funding_rounds.push({
                    id: 1,
                    raised_amount: Math.floor(Math.random() * 1e8),
                    funded_on: d3.time.format('%x')(randomDate(new Date(2000, 1, 1), new Date())),
                    investor_ids: [investor.id]
                });
            });
        });
    };

    /**
     * Initiate and respond with fake backend data instead of querying an actual API
     */
    var setupStubbedBackend = function() {
        var categories = generateDataList(42, randomCategory);
        var investors = generateDataList(9987, randomInvestor);
        var companies = generateDataList(16635, randomCompany);
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