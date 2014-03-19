'use strict';

describe('Service: FundingRound', function() {
    beforeEach(module('crunchinatorApp.models'));
    var FundingRound;
    beforeEach(inject(function (_FundingRound_) {
        FundingRound = _FundingRound_;
    }));

    var models;
    beforeEach(function() {
        models = [
            {id: 0, name: 'test'},
            {id: 1, name: 'test'},
            {id: 2, name: 'other'}
        ];
    });

    it('has a list of dataSets', function() {
        expect(FundingRound.dataSets).toBeTruthy();
    });

    it('has a list of filters', function() {
        expect(FundingRound.filters).toBeTruthy();
    });

    describe('.fetch', function() {
        var $httpBackend;
        beforeEach(inject(function($injector) {
            FundingRound.url = '/funding_rounds.json';
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.expect('GET', '/funding_rounds.json').respond({funding_rounds: models});
        }));
    });
});
