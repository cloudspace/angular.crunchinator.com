'use strict';

// We need to discuss moving these 'utility' functions to a depedency we can inject
// since they are needed across services and directives.
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

angular.module('crunchinatorApp.directives').directive('crunchNav', ['$rootScope', 'Company', 'Investor', 'Category', '$window',
    function($rootScope, Company, Investor, Category, $window) {
        return {
            restrict: 'EA',
            scope: {
                companyCount: '@',
                investorCount: '@',
                filters: '='
            },
            templateUrl: 'views/crunch-nav.tpl.html',
            link: function(scope) {
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
                    var section = angular.element('#main');
                    angular.element('body').animate({scrollTop: section.offset().top}, 'slow');
                };

                angular.element($window).bind('scroll', function(){
                    var offset = angular.element('#nav').offset().top - this.pageYOffset;;
                    scope.chevroned =  offset <= 100;
                });

                scope.$parent.$watch('loading', function(newval) {
                    scope.loading = newval;
                });

                scope.$parent.$watch('initiated', function(newval) {
                    scope.initiated = newval;
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

                    return labelfy(range[0]) + ' - ' + labelfy(range[1]);
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
