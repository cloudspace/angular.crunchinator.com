'use strict';

angular.module('crunchinatorApp.services').service('Bitly', function($http) {
    this.shorten = function(url) {
        var access_token = '98766bc61a09e3d4cd9c5d16dae3b2b604f97a98';
        var query = 'https://api-ssl.bitly.com/v3/shorten?access_token='+access_token+'&longUrl='+url;

        return $http({
            method: 'GET',
            url: query,
            transformResponse: function(response) {
                return JSON.parse(response).data.url;
            }
        });
    };
});
