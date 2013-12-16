angular.module( 'ngBoilerplate.crunchinator', [
  'ui.state',
  'ui.bootstrap',
  'plusOne',
  'configuration'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'crunchinator', {
    url: '/crunchinator',
    views: {
      "main": {
        controller: 'CrunchinatorCtrl',
        templateUrl: 'crunchinator/crunchinator.tpl.html'
      }
    },
    data:{ pageTitle: 'Crunchinator Angularjs + D3js Demo by Cloudspace' }
  });
})

.factory('Model', ['$rootScope', '$http', function($rootScope, $http) {
    function getModels(obj) {
        if (!obj.prototype) { obj = obj.constructor; }
        return obj.models || (obj.models = []);
    }
    function setModels(obj, models) {
        if (!obj.prototype) { obj = obj.constructor; }
        if (_.isArray(models)) {
            // In case there are no ids.
            var id = 0;
            models = _.reduce(models, function(memo, model) {
                memo[model.id || id++] = model;
                return memo;
            }, {});
        }
        obj.models = models;
    }

    var Model = function(attrs) {
        var attributes = _.clone(this._attributes) || {};
        _.extend(attributes, attrs || {});
        this._attributes = attributes;
        _.extend(this, attributes);
        return this;
    };

    Model.prototype.save = function() {
        var data = this.toObject();
        var models = getModels(this);
        var id = this.id;
        if (!_.isEqual(this._attributes, data)) {
            this._attributes = data;
            $rootScope.$apply(function() {
                models[id] = data;
            });
        }
        return this;
    };
    Model.prototype.destroy = function() {
        var models = getModels(this);
        var id = this.id;
        if (models[id]) {
            $rootScope.$apply(function() {
                delete models[id];
            });
        }
        return this;
    };
    Model.prototype.toObject = function() {
        var data = {};
        _.each(_.keys(this._attributes), function(key) {
            data[key] = this[key];
        }, this);
        return data;
    };
    Model.prototype.toJSON = function() {
        return this.toObject();
    };

    Model.find = function(id) {
        var Constructor = this;
        return new Constructor(getModels(this)[id]);
    };
    Model.fetch = function() {
        var _this = this;
        var url = this.prototype.url;
        if (!url) { throw new Error('You must specify a url on the prototype'); }
        return $http.get(url).success(function(response) { setModels(_this, response); });
    };
    Model.where = function(comparator) {
        var ms;
        if (_.isFunction(comparator)) {
            ms = _.select(getModels(this), comparator);
        } else {
            ms = _.where(getModels(this), comparator);
        }
        return _.map(ms, function(model) {
            return new Model(model);
        });
    };
    Model.first = function(limit) {
        var l = limit || 1;
        var ms = [];
        for (var i in getModels(this)) {
            ms.push(Model.find(i));
            if (--l <= 0) { break; }
        }
        return (limit) ? ms : ms[0];
    };
    Model.all = function() {
        return Model.first(Model.size());
    };
    Model.size = function() {
        return _.keys(getModels(this)).length;
    };

    Model.extend = function(protoProps, staticProps) {
        // Courtesy of Backbone.js
        var parent = this;
        var child;

        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function() { return parent.apply(this, arguments); };
        }

        _.extend(child, parent, staticProps);

        var Surrogate = function() { this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        if (protoProps) { _.extend(child.prototype, protoProps); }

        return child;
    };

    return Model;
}])

// CompanyModel = function(Model)
.factory('CompanyModel', function(Model) {
    m = Model.extend({
        url: '/companies',
        _attributes: {
            id: -1,
            name: '',
            category: '',
            zipcode: 0,
            funding_rounds: [],
            // funding_rounds: {
            // amount_raised: 0,
            // start: new Date(),
            // end: new Date()
            // investors: [],
            // },
            total_funding: 0
        }
    });

    return m;
})

// CategoryModel = function(Model)
.factory('CategoryModel', function(Model) {
    m = Model.extend({
        url: '/categories',
        _attributes: {
            name: ''
        }
    });

    return m;
})

// CompanyModel = function(Model)
.factory('InvestorModel', function(Model) {
    m = Model.extend({
        url: '/investors',
        _attributes: {
            id: -1,
            name: ''
        }
    });

    return m;
})

// CrunchinatorCtrl = function($scope) {
.controller( 'CrunchinatorCtrl', [ '$scope', '$http', 'ENV', 'CompanyModel', 'CategoryModel', 'InvestorModel', function CrunchinatorCtrl( $scope, $http, ENV, CompanyModel, CategoryModel, InvestorModel ) {
  $scope.environment = ENV;

  $scope.updateSelectedItem = function(item) {
    $scope.selectedItem = item;
  };

  window.CompanyModel = $scope.companies = CompanyModel;
  window.CategoryModel = $scope.categories = CategoryModel;
  window.InvestorModel = $scope.investors = InvestorModel;

  CompanyModel.fetch();
  CategoryModel.fetch();
  InvestorModel.fetch();
}]);
