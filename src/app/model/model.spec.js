describe( 'Models', function() {
    beforeEach( module( 'ngBoilerplate.model' ) );
    var Model, m;
    beforeEach(inject(function(_Model_) {
        Model = _Model_.extend();
    }));

    describe('when constructing', function() {
        it('instantiates with options', function() {
            m = new Model({id: 1, test: 2});
            expect(m.id).toEqual(1);
            expect(m.test).toEqual(2);
        });

        it('instantiates with default options', function() {
            var M = Model.extend({
                _attributes: {test: 3}
            });
            m = new M({id: 1});
            expect(m.id).toEqual(1);
            expect(m.test).toEqual(3);
        });

        it('passed in options override defaults', function() {
            var M = Model.extend({
                _attributes: {test: 3}
            });
            m = new M({test: 1});
            expect(m.test).toEqual(1);
        });
    });

    describe('instances', function() {
        describe('#save', function() {
            it('saves instance to class variable .models', function() {
                m = new Model({id: 0});
                m.save();

                expect(Model.models).toEqual([{id: 0}]);
            });

            it('saves new copy if dirty', function() {
                m = new Model({id: 0, test: 0});
                m.save();
                var original = Model.models[0];

                m.test = 1;
                m.save();
                expect(Model.models[0]).not.toBe(original);
            });

            it("doesn't save if not dirty", function() {
                m = new Model({id: 0, test: 0});
                m.save();
                var original = Model.models[0];
                m.save();
                expect(Model.models[0]).toBe(original);
            });

            it('uses $apply to notify Angular', inject(function($rootScope) {
                var spy = spyOn($rootScope, '$apply');

                m = new Model({id: 0});
                m.save();
                expect(spy).toHaveBeenCalled();
            }));
        });

        describe('#destroy', function() {
            beforeEach(function() {
                Model.models = {0: {id: 0}};
                m = new Model({id: 0});
            });

            it('deletes model if it has been defined', function() {
                m.destroy();

                expect(Model.models[0]).toEqual(undefined);
            });

            it('uses $apply to notify Angular', inject(function($rootScope) {
                var spy = spyOn($rootScope, '$apply');

                m.destroy();

                expect(spy).toHaveBeenCalled();
            }));
        });

        describe('#toJSON', function() {
            it('returns an object', function() {
                m = new Model();

                expect(m.toJSON()).toEqual({});
            });

            it("doesn't capture properties defined after instantiation", function() {
                m = new Model();
                m.id = 1;
                expect(m.toObject()).toEqual({});
            });

            it('gets properties defined by instantiation', function() {
                m = new Model({id: 1});
                expect(m.toJSON()).toEqual({id: 1});
            });

            it('gets properties defined by defined options', function() {
                var M = Model.extend({
                    _attributes: {test: 1}
                });
                m = new M();
                expect(m.toJSON()).toEqual({test: 1});
            });

            it('gets updated properties', function() {
                m = new Model({id: 1});
                m.id = 2;
                expect(m.toJSON()).toEqual({id: 2});
            });
        });

        describe('#toObject', function() {
            it('returns an object', function() {
                m = new Model();

                expect(m.toObject()).toEqual({});
            });

            it("doesn't capture properties defined after instantiation", function() {
                m = new Model();
                m.id = 1;
                expect(m.toObject()).toEqual({});
            });

            it('gets properties defined by instantiation', function() {
                m = new Model({id: 1});
                expect(m.toObject()).toEqual({id: 1});
            });

            it('gets properties defined by defined options', function() {
                var M = Model.extend({
                    _attributes: {test: 1}
                });
                m = new M();
                expect(m.toObject()).toEqual({test: 1});
            });

            it('gets updated properties', function() {
                m = new Model({id: 1});
                m.id = 2;
                expect(m.toObject()).toEqual({id: 2});
            });
        });
    });

    describe('class', function() {
        beforeEach(function() {
            Model.models = {
                0: {id: 0, name: 'test'},
                1: {id: 1, name: 'test'},
                2: {id: 2, name: 'other'}
            };
        });

        describe('.find', function() {
            describe('when found', function() {
                it('returns a instance of Model', function() {
                    expect(Model.find(0) instanceof Model).toBeTruthy();
                });

                it('has all properties defined', function() {
                    expect(Model.find(0).toObject()).toEqual(Model.models[0]);
                });
            });

            describe('when not found', function() {
                it('returns a new instance of Model', function() {
                    expect(Model.find(5) instanceof Model).toBeTruthy();
                });

                it('has no properties defined', function() {
                    expect(Model.find(5).toObject()).toEqual({});
                });
            });
        });

        describe('.fetch', function() {
            var model = {id: 0, name: 'test'}, $httpBackend;
            beforeEach(inject(function($injector) {
                Model.prototype.url = '/test';
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.expect('GET', '/test').respond([model]);
            }));

            it('queries with $http', function() {
                Model.fetch();
                $httpBackend.flush();
            });

            it("sets class' models on success", function($http) {
                Model.fetch();
                $httpBackend.flush();
                expect(Model.find(model.id).toObject()).toEqual(model);
            });
        });

        describe('.where', function() {
            it('returns an array of models', function() {
                var where = Model.where({name: 'test'});
                for (var i in where) {
                    expect(where[i] instanceof Model).toBeTruthy();
                }
            });

            it('can be passed an object of propeties', function() {
                var where = Model.where({name: 'test'});
                expect(where.length).toEqual(2);
            });

            it('can be passed a function', function() {
                var where = Model.where(function(model) { return model.id > 1; });
                expect(where.length).toEqual(1);
            });
        });
        describe('.all', function() {
            it('returns all models', function() {
                var all = Model.all();
                var ids = _.pluck(all, 'id');
                expect(ids).toEqual([0, 1, 2]);
                for (var i in all) {
                    var model = all[i];
                    expect(model.toObject()).toEqual(Model.models[model.id]);
                }
            });
        });
        describe('.size', function() {
            it('returns correct size', function() {
                expect(Model.size()).toEqual(3);
            });
        });
    });
});

