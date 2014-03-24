'use strict';

angular.module('crunchinatorApp.directives').directive('crCrunchNav', ['$rootScope', '$location', 'Company', 'Investor', 'Category', 'ToolBox', 'Analytics',
    function($rootScope, $location, Company, Investor, Category, ToolBox, Analytics) {
        return {
            restrict: 'EA',
            scope: {
                companyCount: '@',
                investorCount: '@',
                filters: '='
            },
            templateUrl: 'views/crunch-nav.tpl.html',
            link: function(scope) {
                scope.Analytics = Analytics;
                var specialFilters = ['companyIds', 'investorIds', 'categoryIds'];
                scope.$watch('filters', function() {
                    scope.filterList = [];

                    _.each(scope.filters, function(filter, key) {
                        if (filter.length !== 0) {
                            if(_.contains(specialFilters, key)) {
                                scope.filterList.push(new FilterItem(idsToObjects(filter, key), key));
                            } else {
                                scope.filterList.push(new FilterItem(filter, key));
                            }
                        }
                    });
                }, true);

                scope.chevron = function() {
                    Analytics.event('Navigation', 'Click', 'Continue to the Crunchinator');
                    var $section = angular.element('#splash');
                    $section.slideUp('slow', function(){
                        scope.chevroned = true;
                        angular.element('html, body').css({
                            'overflow': 'visible',
                        });
                        scope.$digest();
                    });
                };

                scope.$parent.$watch('loading', function(newval) {
                    scope.loading = newval;
                });

                scope.$parent.$watch('initiated', function(newval) {
                    scope.initiated = newval;
                    if(scope.$parent.initiated === true && $location.search().filters) {
                        _.defer(function(){
                            scope.chevron();
                        });
                    }
                });

                scope.removeFilter = function(item) {
                    scope.$parent.filterData[item.raw_type] = [];
                    $rootScope.$broadcast('filterAction');
                };

                scope.reset = function() {
                    _.each(scope.$parent.filterData, function(filter, key) {
                        scope.$parent.filterData[key] = [];
                    });

                    $rootScope.$broadcast('filterAction');
                };

                function idsToObjects(collection, type) {
                    var model;
                    switch(type) {
                        case 'companyIds':
                            model = Company;
                            break;
                        case 'investorIds':
                            model = Investor;
                            break;
                        case 'categoryIds':
                            model = Category;
                            break;
                    }
                    return _.map(collection, function(item) {
                        var object = model.get(item);
                        return model === Category ? object.display_name : object.name;
                    });
                }

                function FilterItem(data, type) {
                    this.type = this.typeLookup[type];
                    this.label = !(data[0] instanceof Date) && isNaN(data[0]) ? this.prettifyList(data) : this.prettifyRange(data);
                    this.raw_type = type;
                }

                FilterItem.prototype.prettifyList = function(collection) {
                    var label = '';
                    if (collection.length > 3) {
                        label = collection.slice(0, 3).join(', ') + '...';
                    } else {
                        label = collection.join(', ');
                    }
                    return label;
                };

                FilterItem.prototype.prettifyRange = function(range) {
                    if (range[0] instanceof Date) {
                        var dateFormat = d3.time.format('%m/%Y');
                        return dateFormat(range[0]) + ' - ' + dateFormat(range[1]);
                    }

                    return ToolBox.labelfy(range[0]) + ' - ' + ToolBox.labelfy(range[1]);
                };

                FilterItem.prototype.typeLookup = {
                    categoryIds: 'Categories',
                    investorIds: 'Investors',
                    companyIds: 'Companies',
                    ranges: 'Total Funding',
                    roundRanges: 'Any Round',
                    mostRecentRoundRanges: 'Latest Round',
                    statuses: 'Company Status',
                    states: 'Company HQ',
                    fundingActivity: 'Investments',
                    acquiredDate: 'Acquisition Date',
                    foundedDate: 'Founding Date',
                    ipoValueRange: 'IPO Raise',
                    ipoDateRange: 'IPO Date',
                    acquiredValueRange: 'Acquisition Price',
                    roundCodes: 'Round Name'
                };
            }
        };
    }
]);
