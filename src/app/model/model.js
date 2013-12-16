angular.module( 'ngBoilerplate.model', [])

.factory('Model', ['$rootScope', '$http', function($rootScope, $http) {
    function getModels(obj) {
        obj = getConstructor(obj);
        return obj.models || (obj.models = []);
    }
    function setModels(obj, models) {
        obj = getConstructor(obj);
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
    function getConstructor(obj) {
        if (!obj.prototype) { obj = obj.constructor; }
        return obj;
    }

    var Model = function(attrs) {
        if (!attrs) { attrs = {}; }
        var attributes = {};
        var defaults = this._attributes = _.clone(this._attributes) || {};
        this._attributeKeys = _.union(_.keys(defaults), _.keys(attrs));
        _.extend(this, defaults, attrs);
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
        _.each(this._attributeKeys, function(key) {
            data[key] = this[key];
        }, this);
        return data;
    };
    Model.prototype.toJSON = function() {
        return this.toObject();
    };

    Model.find = function(id) {
        return new (getConstructor(this))(getModels(this)[id]);
    };
    Model.fetch = function() {
        var _this = this;
        var url = this.prototype.url;
        if (!url) { throw new Error('You must specify a url on the prototype'); }
        return $http.get(url).success(function(response) { setModels(_this, response); });
    };
    Model.where = function(comparator) {
        var ms;
        var _this = this;
        if (_.isFunction(comparator)) {
            ms = _.select(getModels(this), comparator);
        } else {
            ms = _.where(getModels(this), comparator);
        }
        return _.map(ms, function(model) {
            return new (getConstructor(_this))(model);
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
}]);
