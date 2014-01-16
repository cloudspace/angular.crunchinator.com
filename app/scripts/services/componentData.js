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

    /**
     * TODO: Rewrite this to take into account data that is outside of our expected bounds
     * Constructs data necessary for the totalFunding bar graph
     *
     * @param {array} companies A filtered list of companies to include in the totalFunding graph
     */
    this.totalFunding = _.memoize(function(companies) {
        var total_raised_data = [];
        if (companies && companies.length > 0) {
            for(var i = 1; i <= 10; i++){
                total_raised_data.push({
                    label: '$'+i+' - $'+((i === 1 ? 0 : i)+1) + 'M',
                    count: 0
                });
            }

            _.each(companies, function(company) {
                var label_index = Math.floor((company.total_funding + 1) / 1000000);
                total_raised_data[label_index].count++;
            });
        }
        return total_raised_data;
    });
});