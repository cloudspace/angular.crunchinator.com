'use strict';

angular.module('crunchinatorApp.services').service('Analytics', [ function() {
    var gaEvent = function(category, action, name) {
        ga('send', 'event', category, action, name);
    };
    var kissmetricsEvent = function(category, action, name, properties) {
        properties.category = category;
        properties.action = action;
        _kmq.push(['record', name, properties]);
    };

    this.event = function(category, action, name, properties) {
        properties = properties || {};
        gaEvent(category, action, name);
        kissmetricsEvent(category, action, name, properties);
    };
}]);
