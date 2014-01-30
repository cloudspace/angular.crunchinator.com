'use strict';

angular.module('crunchinatorApp.services').service('ComponentData', function() {
    /**
     * Constructs data necessary for the word cloud of categories
     *
     * @param {array} categories A filtered list of categories to display in the category word cloud
     * @param {array} companies A list of companies that have categories
     *                that are displayed in the category word cloud
     * @return {array} A list of categories including a display name and
                       a count of how many companies are in that category
     */
    this.categoryWordCloudData = _.memoize(function(categories, companies) {
        var cats = [];
        if(categories){
            _.each(categories, function(category){
                var cat = {};
                cat.name = category.name;
                cat.id = category.id;
                cat.count = _.select(companies, function(company){
                    return company.category_id === category.id;
                }).length;
                cat.display = category.name.replace('_', '/');
                cats.push(cat);
            });
        }
        return cats;
    }, function(categories, companies) {
        var current_hash = _.pluck(categories, 'id').join('|') + '&' + _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * TODO: Rewrite this to take into account data that is outside of our expected bounds
     * Constructs data necessary for the totalFunding bar graph
     *
     * @param {array} companies A filtered list of companies to include in the totalFunding graph
     */
    this.totalFunding = _.memoize(function(companies, allCompanies) {
        if(typeof allCompanies === 'undefined' || typeof companies === 'undefined') { return; }

        function abbreviateNumber(value) {
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
        }

        function labelfy(num) {
            return '$' + abbreviateNumber(num);
        }

        var fundingValues = _.pluck(allCompanies, 'total_funding');
        var maxNum = parseInt(_.max(fundingValues, function(n){ return parseInt(n); }));
        var base = 2;
        var minGraph = 10000;
        var maxGraph = minGraph;

        while(maxGraph < maxNum) {
            maxGraph *= base;
        }

        var ranges = [{start: 1, end: minGraph, label: labelfy(minGraph), count: 0, investor_ids: [], category_ids: []}];

        for(var i = minGraph; i < maxNum; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: labelfy(i * base), count: 0, investor_ids: [], category_ids: []}
            );
        }

        for(var j = 0; j < companies.length; j++) {
            var company = companies[j];

            for(var k = 0; k < ranges.length; k++) {
                var range = ranges[k];

                var total_funding = parseInt(company.total_funding);

                if (range.start < total_funding && total_funding < range.end) {
                    range.count++;
                    break;
                }
            }
        }
        return ranges;
    });

    /**
     * Constructs geoJson data necessary for the company location map
     *
     * @param {array} companies A filtered list of companies to display on the map
     * @return {object} A GeoJson hash that maps the latitude and longitude of each company in companies
     */
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
    });

    this.fundingRoundCount = _.memoize(function(companies, extent) {
        var byMonth = {};
        var parseDate = d3.time.format('%x').parse;
        var format = d3.time.format('%m/%Y');
        _.each(companies, function(company){
            _.each(company.funding_rounds, function(funding_round){
                if(funding_round.funded_on) {
                    var roundDate = parseDate(funding_round.funded_on);
                    if(roundDate >= format.parse(extent)) {
                        var monthYear = format(roundDate);
                        if(byMonth[monthYear]) {
                            byMonth[monthYear]++;
                        }
                        else {
                            byMonth[monthYear] = 1;
                        }
                    }
                }
            });
        });

        return _.reduce(byMonth, function(o, v, k){
            o.push({
                date: k,
                count: v
            });
            return o;
        }, []);
    });

    this.foundedOnCount = _.memoize(function(companies) {
        var byMonth = {};
        var parseDate = d3.time.format('%x').parse;
        var format = d3.time.format('%m/%Y');
        _.each(companies, function(company){
            if(company.founded_on) {
                var foundedDate = parseDate(company.founded_on);
                var monthYear = format(foundedDate);
                if(byMonth[monthYear]) {
                    byMonth[monthYear]++;
                }
                else {
                    byMonth[monthYear] = 1;
                }
            }
        });
        return _.reduce(byMonth, function(o, v, k){
            o.push({
                date: k,
                count: v
            });
            return o;
        }, []);
    });
});
