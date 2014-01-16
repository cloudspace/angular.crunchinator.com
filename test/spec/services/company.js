'use strict';

describe('Service: Company', function() {
    beforeEach(module('crunchinatorApp.models'));
    var Company;
    beforeEach(inject(function (_Company_) {
        Company = _Company_;
    }));

    var models;
    beforeEach(function() {
        models = [
            {id: 0, name: 'test'},
            {id: 1, name: 'test'},
            {id: 2, name: 'other'}
        ];
    });

    it('has a list of dataSets', function() {
        expect(Company.dataSets).toBeTruthy();
    });

    it('has a list of filters', function() {
        expect(Company.filters).toBeTruthy();
    });

    describe('.fetch', function() {
        var $httpBackend;
        beforeEach(inject(function($injector) {
            Company.url = '/companies.json';
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.expect('GET', '/companies.json').respond({companies: models});
        }));

        //TODO: Add this back in when we fix crossfilter dependency injection
        // it('creates a set of dimensions when setUpDimensions is called', function(){
        //     Company.fetch();
        //     $httpBackend.flush();
        //     Company.setupDimensions();
        //     expect(Company.dimensions).toBeTruthy();
        // });


    });


});

