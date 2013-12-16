describe( 'Models', function() {
  beforeEach( module( 'ngBoilerplate.model' ) );
  var Model, m;
  beforeEach(inject(function(_Model_) {
      Model = _Model_;
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
});

