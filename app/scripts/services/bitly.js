'use strict';

angular.module('crunchinatorApp.services').service('Bitly', ['$http', 'BITLY_KEY', function($http, BITLY_KEY) {
    this.shorten = function(url) {
        var query = 'https://api-ssl.bitly.com/v3/shorten?access_token='+BITLY_KEY+'&longUrl='+url;

        return $http({
            method: 'GET',
            url: query,
            transformResponse: function(response) {
                return JSON.parse(response).data.url;
            }
        });
    };
}]);
