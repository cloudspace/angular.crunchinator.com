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

angular.module('crunchinatorApp.directives').directive('crunchNav',
    function() {
        return {
            restrict: 'EA',
            scope: {
                companyCount: '@',
                investorCount: '@',
                filters: '='
            },
            templateUrl: 'views/crunch-nav.tpl.html',
            link: function(scope) {

                scope.$watch('filters', function() {
                    scope.filterList = [];

                    _.each(scope.filters, function(filter, key) {
                        if (filter.length !== 0) {
                            scope.filterList.push(new FilterItem(filter, key));
                        }
                    });
                }, true);

                function FilterItem(data, type) {
                    this.type = this.typeLookup[type];
                    this.label = !(data[0] instanceof Date) && isNaN(data[0]) ? this.prettifyList(data) : this.prettifyRange(data);
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
);