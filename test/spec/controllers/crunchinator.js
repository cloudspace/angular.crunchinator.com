'use strict';

describe('Controller: CrunchinatorCtrl', function () {

    // load the controller's module
    beforeEach(module('crunchinatorApp.controllers'));

    var CrunchinatorCtrl, scope, _company, _category, _investor;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, Company, Category, Investor) {
        scope = $rootScope.$new();
        _company = Company;
        _category = Category;
        _investor = Investor;

        //setup spies
        _.each([_company, _investor, _category], function(_model){
            spyOn(_model, 'fetch').andCallThrough();
            spyOn(_model, 'runFilters');
        });

        CrunchinatorCtrl = $controller('CrunchinatorCtrl', {
            $scope: scope,
            Company: _company,
            Category: _category,
            Investor: _investor
        });
    }));

    it('attaches the models to the scope', function () {
        expect(scope.companies).toBeTruthy();
        expect(scope.categories).toBeTruthy();
        expect(scope.investors).toBeTruthy();
    });

    it('attaches the component data to the scope', function () {
        expect(scope.ComponentData).toBeTruthy();
    });

    it('calls each models fetch function', function(){
        expect(_company.fetch).toHaveBeenCalled();
        expect(_category.fetch).toHaveBeenCalled();
    });

    it('calls each models runFilters function after a filterAction event happens', function(){
        scope.$broadcast('filterAction');
        expect(_company.runFilters.calls.length).toEqual(1);
        expect(_category.runFilters.calls.length).toEqual(1);
        expect(_investor.runFilters.calls.length).toEqual(1);
    });
});
