'use strict';

angular.module('crunchinatorApp.services').service('ComponentData', function() {
    this.categoryWordCloudData = function(categories, companies) {
        _.each(categories, function(category){
            category.count = _.select(companies, function(company){
                return company.category_id === category.id;
            }).length;
        });
        return categories;
    };

    this.totalFunding = _.memoize(function(companies, allCompanies) {
        if(typeof allCompanies === 'undefined' || typeof companies === 'undefined') { return; }

        function abbreviateNumber(value) {
            var newValue = value;
            if (value >= 1000) {
                var suffixes = ["", "K", "M", "B","T"];
                var suffixNum = Math.floor( ((""+value).length -1)/3 );
                var shortValue = '';
                for (var precision = 2; precision >= 1; precision--) {
                    shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
                    var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                    if (dotLessShortValue.length <= 3) { break; }
                }

                newValue = shortValue+suffixes[suffixNum];
            }
            console.log('label name: ' + newValue);
            return newValue;
        }

        function labelfy(num) {
            return '$' + abbreviateNumber(num);
        }

        var fundingValues = _.pluck(allCompanies, 'total_funding');
        var maxNum = parseInt(_.max(fundingValues, function(n){ return parseInt(n); }));
        var base = 2;
        var minGraph = 100000;
        var maxGraph = minGraph;

        while(maxGraph < maxNum) {
            maxGraph *= base;
        }

        var ranges = [{start: 1, end: minGraph, label: labelfy(minGraph), count: 0, objs: []}];

        for(var i = minGraph; i < maxNum; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: labelfy(i * base), count: 0, objs: []}
            );
        }

        for(var j = 0; j < companies.length; j++) {
            var company = companies[j];

            for(var k = 0; k < ranges.length; k++) {
                var range = ranges[k];
                var total_funding = parseInt(company.total_funding);

                if (range.start < total_funding && total_funding < range.end) {
                    range.count++;
                    range.objs.push(company);
                    break;
                }
            }
        }
        return ranges;
    });

    this.companyGeoJson = _.memoize(function(companies) {
        var geojson = {
            'type': 'FeatureCollection',
            'features': []
        };
        if (companies && companies.length > 0) {
            _.each(companies, function(company) {
                if(company.latitude && company.longitude) {
                    geojson.features.push({
                        type: 'Feature',
                        geometry: {type: 'Point', coordinates: [company.longitude, company.latitude]},
                        properties: {
                            name: company.name
                        }
                    });
                }

            });
        }
        return geojson;
    }, function(companies) {
        return _.pluck(companies, 'id').join('');
    });
});