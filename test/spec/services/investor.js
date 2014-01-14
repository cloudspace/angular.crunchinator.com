'use strict';

describe('Service: Investor', function() {
    beforeEach(module('crunchinatorApp.models'));
    var Investor;
    beforeEach(inject(function (_Investor_) {
        Investor = _Investor_;
    }));

    var models;
    beforeEach(function() {
        models = [
            {id: 0, name: 'test'},
            {id: 1, name: 'test'},
            {id: 2, name: 'other'}
        ];
    });

    describe('.fetch', function() {
        var $httpBackend;
        beforeEach(inject(function($injector) {
            Investor.url = '/investors.json';
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.expect('GET', '/investors.json').respond({investors: models});
        }));

        //TODO: Add this back in when we fix crossfilter dependency injection
        // it('creates a set of dimensions when setUpDimensions is called', function(){
        //     Investor.fetch();
        //     $httpBackend.flush();
        //     Investor.setupDimensions();
        //     expect(Investor.dimensions).toBeTruthy();
        // });

        it('has a list of filterGroups', function() {
            expect(Investor.filterGroups).toBeTruthy();
        });

        it('has a list of filters', function() {
            expect(Investor.filters).toBeTruthy();
        });
    });
});

