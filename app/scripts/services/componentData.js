'use strict';

angular.module('crunchinatorApp.services').service('ComponentData', function() {
    this.categoryWordCloudData = function(categories, companies) {
        _.each(categories, function(category){
            category.count = _.select(companies, function(company){
                return company.category_id === category.id;
            }).length;
            category.display = category.name.replace('_', '/');
        });
        return categories;
    };

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

    //TODO: Rewrite this to take into account data that is outside of our expected bounds
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
    }, function(companies) {
        return _.pluck(companies, 'id').join('');
    });
});