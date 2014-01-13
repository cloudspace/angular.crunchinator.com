'use strict';

describe( 'Service: Model', function() {
    beforeEach(module('crunchinatorApp.models'));
    var Model;
    beforeEach(inject(function(_Model_) {
        Model = _Model_;
    }));

    describe('class', function() {
        var models;
        beforeEach(function() {
            models = [
                {id: 0, name: 'test'},
                {id: 1, name: 'test'},
                {id: 2, name: 'other'}
            ];
            Model.all = models;
        });

        describe('.fetch', function() {
            var model = {id: 0, name: 'test'}, $httpBackend;
            beforeEach(inject(function($injector) {
                Model.url = '/test';
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.expect('GET', '/test').respond([model]);
            }));

            it('queries with $http', function() {
                Model.fetch();
                $httpBackend.flush();
            });

            it('parses the response', function() {
                var data = [{id: 1}];
                spyOn(Model, 'parse').andReturn(data);

                Model.fetch();
                $httpBackend.flush();

                expect(Model.all[0]).toEqual(data[0]);
            });
        });

        describe('.all', function() {
            it('returns all models', function() {
                var all = Model.all;
                var ids = _.pluck(all, 'id');
                expect(ids).toEqual([0, 1, 2]);
                for (var i in all) {
                    var model = all[i];
                    expect(model).toEqual(models[model.id]);
                }
            });
        });
        describe('.all.length', function() {
            it('returns correct size', function() {
                expect(Model.all.length).toEqual(3);
            });
        });
    });
});

