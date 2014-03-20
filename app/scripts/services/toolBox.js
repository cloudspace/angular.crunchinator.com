'use strict';

angular.module('crunchinatorApp.services').service('ToolBox', [function() {
    /**
     * Abbreviates a number into a shortened string
     *
     * @param {number} [value] A large number to abbreviate
     * @return {string} A shortened string for a large number (1,000,000 => 1M)
     */
    this.abbreviateNumber = function(value) {
        var newValue = value;
        if (value >= 1000) {
            var suffixes = ['', 'K', 'M', 'B','T'];
            var suffixNum = Math.floor( ((''+value).length -1)/3 );
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat( (suffixNum !== 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                if (dotLessShortValue.length <= 3) { break; }
            }

            newValue = shortValue+suffixes[suffixNum];
        }
        return newValue;
    };

    /**
     * Converts a large number into a labelfied short string
     *
     * @param {number} [num] A large number to abbreviate and make label-ready
     * @return {string} A shortened, labeled string for a large number (1,000,000 => $1M)
     */
    this.labelfy = function(num) {
        return '$' + this.abbreviateNumber(num);
    };
}]);
