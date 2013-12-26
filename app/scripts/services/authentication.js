'use strict';

angular.module('devise', [])
.factory('Auth', function($q, $location, $http) {
    function redirect(url) {
        if (url == null) { return; }
        url = url || '/';
        $location.path(url);
    }
    var service = {
        currentUser: null,
        login: function(opts) {
            if (!opts) { opts = {}; }
            var user = _.pick(opts, 'email', 'password');
            return $http.post('/users/sign_in.json', {user: user}).then(function(response) {
                service.currentUser = response.data;
                redirect(opts.redirect);
                return service.requestCurrentUser();
            });
        },
        logout: function(opts) {
            if (!opts) { opts = {}; }
            $http.delete('/users/sign_out.json').then(function() {
                service.currentUser = null;
                redirect(opts.redirect);
            });
        },
        register: function(opts) {
            if (!opts) { opts = {}; }
            var user = _.pick(opts, 'email', 'password', 'password_confirmation');
            if (!user.password_confirmation) {
                user.password_confirmation = user.password;
            }
            return $http.post('/users.json', {user: user}).then(function(response) {
                service.currentUser = response.data;
                redirect(opts.redirect);
            });
        },
        requestCurrentUser: function() {
            if (service.isAuthenticated()) {
                return $q.when(service.currentUser);
            }
            return service.login();
        },
        isAuthenticated: function(){
            return !!service.currentUser;
        }
    };

    return service;
})
.config(function($httpProvider) {
    $httpProvider.interceptors.push(function($location, $q) {
        /* Only for intercepting 401 requests. */
        return {
            responseError: function(response) {
                if (response.status === 401) {
                    $location.path('/users/login');
                    return response;
                }
                return $q.reject(response);
            }
        };
    });
    $httpProvider.defaults.headers.common['X-CSRF-Token'] = angular.element(document.querySelector('meta[name=csrf-token]')).attr('content');
});
