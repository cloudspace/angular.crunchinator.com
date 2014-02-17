'use strict';

angular.module('crunchinatorApp.services').service('ComponentData', function() {
    /**
     * Constructs data necessary for the totalFunding bar graph
     *
     * @param {array} [companies] A filtered list of companies to include in the totalFunding graph
     */
    this.totalFunding = _.memoize(function(companies, maxNum) {
        if(typeof maxNum === 'undefined' || typeof companies === 'undefined') { return; }

        var base = 2;
        var minGraph = 10000;

        var ranges = [{start: 1, end: minGraph, label: labelfy(minGraph), count: 0}];

        for(var i = minGraph; i < maxNum; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: labelfy(i * base), count: 0}
            );
        }

        for(var j = 0; j < companies.length; j++) {
            var total_funding = parseInt(companies[j].total_funding);
            if(!isNaN(total_funding)){
                var k = rangeIndex(total_funding, minGraph, base);
                ranges[k].count++;
            }
        }
        return ranges;
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * Constructs data necessary for the Funding: Any Round area chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [extent] Where to start the x-axis of the area chart
     * @return {array} A count of all funding rounds grouped by round month/Year
     */
    this.fundingRoundCount = _.memoize(function(companies, extent) {
        var byMonth = {};
        var parseDate = d3.time.format('%x').parse;
        var format = d3.time.format('%m/%Y');
        var parsed_format = format.parse(extent);
        var now = new Date();

        for(var i = format.parse(extent); i <= now; i.setMonth(i.getMonth() + 1)) {
            byMonth[format(i)] = 0;
        }

        _.each(companies, function(company){
            _.each(company.funding_rounds, function(funding_round){
                if(funding_round.funded_on) {
                    var roundDate = parseDate(funding_round.funded_on);
                    if(roundDate >= parsed_format) {
                        var monthYear = format(roundDate);
                        byMonth[monthYear]++;
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
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * Constructs data necessary for the Acquisition Date area chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [extent] Where to start the x-axis of the area chart
     * @return {array} A count of all companies grouped by acquired_on month/Year
     */
    this.acquiredOnCount = _.memoize(function(companies, extent) {
        var byMonth = {};
        var parseDate = d3.time.format('%x').parse;
        var format = d3.time.format('%m/%Y');
        var parsed_format = format.parse(extent);
        var now = new Date();

        for(var i = format.parse(extent); i <= now; i.setMonth(i.getMonth() + 1)) {
            byMonth[format(i)] = 0;
        }
        _.each(companies, function(company){
            if(company.acquired_on) {
                var acquiredDate = parseDate(company.acquired_on);
                if(acquiredDate >= parsed_format){
                    var monthYear = format(acquiredDate);
                    byMonth[monthYear]++;
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
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });
    
    /**
     * Constructs data necessary for the Date Founded area chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [extent] Where to start the x-axis of the area chart
     * @return {array} A count of all companies grouped by founded_on month/Year
     */
    this.foundedOnCount = _.memoize(function(companies, extent) {
        var byMonth = {};
        var parseDate = d3.time.format('%x').parse;
        var format = d3.time.format('%Y');
        var parsed_format = format.parse(extent);
        var now = new Date();

        for(var i = parsed_format.getFullYear(); i <= now.getFullYear(); i++) {
            byMonth[i.toString()] = 0;
        }

        _.each(companies, function(company){
            if(company.founded_on) {
                var foundedDate = parseDate(company.founded_on);
                var monthYear = format(foundedDate);
                if(foundedDate >= parsed_format){
                    byMonth[monthYear]++;
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
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * Constructs data necessary for the Funding: Any Round bar chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [maxNum] The largest number in the set that we're graphing
     * @return {array} A count of all funding rounds grouped by raised amount in logarithmic ranges
     */
    this.fundingPerRound = _.memoize(function(companies, maxNum) {
        if(typeof maxNum === 'undefined' || typeof companies === 'undefined') { return; }

        var filteredFundingValues = _.pluck(_.flatten(_.pluck(companies, 'funding_rounds')), 'raised_amount');
        var base = 2;
        var minGraph = 10000;

        var ranges = [{start: 1, end: minGraph, label: labelfy(minGraph), count: 0, investor_ids: [], category_ids: []}];

        for(var i = minGraph; i < maxNum; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: labelfy(i * base), count: 0, investor_ids: [], category_ids: []}
            );
        }

        for(var j = 0; j < filteredFundingValues.length; j++) {
            var funding = parseInt(filteredFundingValues[j]);
            if(!isNaN(funding)){
                var k = rangeIndex(funding, minGraph, base);
                ranges[k].count++;
            }
        }
        return ranges;
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * Constructs data necessary for the Funding: Most Recent Round bar chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [maxNum] The largest number in the set that we're graphing
     * @return {array} A count of all company's most recent funding rounds
     *                 raised amounts grouped by logarithmic ranges
     */
    this.mostRecentFundingRound = _.memoize(function(companies, maxNum) {
        if(typeof maxNum === 'undefined' || typeof companies === 'undefined') { return; }

        var base = 2;
        var minGraph = 10000;

        var ranges = [{start: 1, end: minGraph, label: labelfy(minGraph), count: 0, investor_ids: [], category_ids: []}];

        for(var i = minGraph; i < maxNum; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: labelfy(i * base), count: 0, investor_ids: [], category_ids: []}
            );
        }

        var parse = d3.time.format('%x').parse;
        var roundByFundedOn = function(round){
            return round.funded_on ? parse(round.funded_on) : 0;
        };
        for(var j = 0; j < companies.length; j++) {
            var company = companies[j];
            var roundFunding = _.max(company.funding_rounds, roundByFundedOn).raised_amount;
            if(!isNaN(roundFunding)){
                var k = rangeIndex(roundFunding, minGraph, base);
                ranges[k].count++;
            }
        }
        return ranges;
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * Constructs data necessary for the Company Status pie chart
     *
     * @param {array} [companies] A filtered list of companies
     * @return {array} A count of the number of companies per status (deadpooled, acquired, alive)
     */
    this.companyStatusData = _.memoize(function(companies) {
        var statuses = ['alive', 'deadpooled', 'acquired'];
        var status_grouping = _.groupBy(companies, function(company) { return company.status; });
        var results = [];
        if(_.isEmpty(status_grouping)) { return results; }

        // Make sure all known status-types are always represented in the returned data-set.
        _.each(statuses, function(status) {
            if(status_grouping[status]) {
                results.push({label: status, count: status_grouping[status].length});
            } else {
                results.push({label: status, count: 0});
            }
        });

        return results;
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    this.companyStateData = _.memoize(function(companies) {
        var state_grouping = _.countBy(companies, function(company) { return company.state_code; });

        return state_grouping;
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * Constructs data necessary for the IPO Value bar graph
     *
     * @param {array} [companies] A filtered list of companies to include in the IPO value graph
     * @return {array} A collection of logarithmic ranges with their company count and pretty label
     */
    this.ipoValueData = _.memoize(function(companies, maxNum) {
        if(typeof maxNum === 'undefined' || typeof companies === 'undefined') { return; }

        var base = 2;
        var minGraph = 10000;

        var ranges = [{start: 1, end: minGraph, label: labelfy(minGraph), count: 0}];

        for(var i = minGraph; i < maxNum; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: labelfy(i * base), count: 0}
            );
        }

        for(var j = 0; j < companies.length; j++) {
            var ipo_valuation = parseInt(companies[j].ipo_valuation);
            if(!isNaN(ipo_valuation)){
                var k = rangeIndex(ipo_valuation, minGraph, base);
                ranges[k].count++;
            }
        }
        return ranges;
    }, function(companies) {
        var current_hash = _.pluck(companies, 'id').join('|');
        return current_hash;
    });

    /**
     * Abbreviates a number into a shortened string
     *
     * @param {number} [value] A large number to abbreviate
     * @return {string} A shortened string for a large number (1,000,000 => 1M)
     */
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

    /**
     * Converts a large number into a labelfied short string
     *
     * @param {number} [num] A large number to abbreviate and make label-ready
     * @return {string} A shortened, labeled string for a large number (1,000,000 => $1M)
     */
    function labelfy(num) {
        return '$' + abbreviateNumber(num);
    }

    /**
     * Log(n)b
     *
     * @param {number} [n]
     * @param {number} [b]
     * @return {number}
     */
    function logN(n, b) {
        return (Math.log(n)) / (Math.log(b));
    }

    /**
     * Returns a graph index when given a number to index, the min graph value and the log base used
     *
     * @param {number} [num] The number we're determining the index of.
     * @param {number} [min] The minimum value of the first graph bar (usually 10,000)
     * @param {number} [base] The logarithmic base used in the graph (usually 2)
     * @return {num}
     */
    function rangeIndex(num, min, base) {
        return num < min ? 0 : Math.ceil(logN(num/min, base));
    }
});
