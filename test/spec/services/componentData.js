'use strict';

describe('Service: ComponentData', function() {
    beforeEach(module('crunchinatorApp.services'));
    var ComponentData;
    beforeEach(inject(function(_ComponentData_) {
        ComponentData = _ComponentData_;
    }));

    describe('.categoryWordCloudData', function() {
        var categories, companies;
        beforeEach(function() {
            categories = [
                {id: 1, name: 'software'},
                {id: 2, name: 'web'},
                {id: 3, name: 'games_video'}
            ];
            companies = [
                {id: 1, category_id: 1},
                {id: 2, category_id: 1},
                {id: 3, category_id: 3}
            ];
        });
        it('returns an empty array for empty input', function() {
            var response = ComponentData.categoryWordCloudData([], []);
            expect(response).toEqual([]);
        });
        it('returns an array equal in length to the categories input', function() {
            var response = ComponentData.categoryWordCloudData(categories, companies);
            expect(response.length).toEqual(categories.length);
        });
        it('returns a count of how many times each category is represented in the companies input', function() {
            var expected_response = [
                {id: 1, name: 'software', count: 2, display: 'software'},
                {id: 2, name: 'web', count: 0, display: 'web'},
                {id: 3, name: 'games_video', count: 1, display: 'games/video'}
            ];
            var response = ComponentData.categoryWordCloudData(categories, companies);
            expect(response).toEqual(expected_response);
        });
    });

    describe('.companyGeoJson', function(){
        var companies;
        beforeEach(function(){
            companies = [
                {name: 'Google', latitude: 1, longitude: 1},
                {name: 'Cloudspace', latitude: 1, longitude: 1},
                {name: 'Facebook', latitude: 1, longitude: 1}
            ];
        });
        it('returns a geoJson object with a type of FeatureCollection', function(){
            var response = ComponentData.companyGeoJson(companies);
            expect(response.type).toEqual('FeatureCollection');
        });
        it('returns a geoJson object that includes a collection of features', function(){
            var response = ComponentData.companyGeoJson(companies);
            expect(response.features).toContain({
                type: 'Feature',
                geometry: {type: 'Point', coordinates: [1, 1]},
                properties: {
                    name: 'Cloudspace'
                }
            });
        });
    });

    //TODO: Implement this when we've finished total funding component
    describe('.totalFunding', function(){
    });
});

