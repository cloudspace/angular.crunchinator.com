'use strict';

describe('Service: Category', function() {
    beforeEach(module('crunchinatorApp.models'));
    var Category;
    beforeEach(inject(function (_Category_) {
        Category = _Category_;
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
            Category.url = '/categories.json';
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.expect('GET', '/categories.json').respond({categories: models});
        }));

        //TODO: Add this back in when we fix crossfilter dependency injection
        // it('creates a set of dimensions when setUpDimensions is called', function(){
        //     Category.fetch();
        //     $httpBackend.flush();
        //     Category.setupDimensions();
        //     expect(Category.dimensions).toBeTruthy();
        // });

        it('has a list of filterGroups', function() {
            expect(Category.filterGroups).toBeTruthy();
        });

        it('has a list of filters', function() {
            expect(Category.filters).toBeTruthy();
        });
    });
});

