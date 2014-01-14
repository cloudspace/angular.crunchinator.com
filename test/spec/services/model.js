'use strict';

describe( 'Service: Model', function() {
    beforeEach(module('crunchinatorApp.models'));
    var Model;
    beforeEach(inject(function(_Model_) {
        Model = _Model_;
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
            Model.url = '/test';
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.expect('GET', '/test').respond(models);
        }));

        it('queries with $http', function() {
            Model.fetch();
            $httpBackend.flush();
        });

        it('sets .all to the returned data', function(){
            Model.fetch();
            $httpBackend.flush();
            expect(Model.all).toEqual(models);
        });
    });

    describe('.count', function() {
        it('returns correct size', function() {
            Model.all = models;
            expect(Model.count()).toEqual(3);
        });
    });
});

