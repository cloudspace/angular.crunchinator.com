'use strict';

angular.module('crunchinatorApp.services').service('ComponentData', function(Company, Investor, Category, FundingRound) {
    this.dataSets ={};
    this.updateDataSets = function() {
        var data = this.dataSets;
        //Run each data function
        data.roundCodeListData = this.roundCodeListData(FundingRound.dataForRoundName, FundingRound.roundHash);
        data.categoryListData = this.categoryListData(Category.dataForCategoryList, Company.dataForCategoriesList);
        data.investorListData = this.investorListData(Investor.dataForInvestorsList, Company.dataForInvestorsList);
        data.totalFunding = this.totalFunding(Company.dataForTotalFunding, Company.maxCompanyValue);
        data.fundingRoundCount = this.fundingRoundCount(FundingRound.dataForInvestments, '1/2000');
        data.acquiredOnCount = this.acquiredOnCount(Company.dataForAcquiredOnAreaChart, '1/2006');
        data.acquiredValueCount = this.acquiredValueCount(Company.dataForAcquiredValue, Company.maxAcquiredValue);
        data.foundedOnCount = this.foundedOnCount(Company.dataForFoundedOnAreaChart, '1992');
        data.fundingPerRound = this.fundingPerRound(FundingRound.dataForFundingAmount, FundingRound.maxFundingValue);
        data.mostRecentFundingRound = this.mostRecentFundingRound(Company.dataForMostRecentRaisedAmount, Company.maxRecentFundingValue);
        data.companyStatusData = this.companyStatusData(Company.dataForCompanyStatus);
        data.companyStateData = this.companyStateData(Company.dataForLocationMap);
        data.ipoValueData = this.ipoValueData(Company.dataForIPOValue, Company.maxIPOValue);
        data.ipoDateData = this.ipoDateData(Company.dataForIPODate, '1992');
    };

    var idListMemoFunction = function(items) {
        var current_hash = _.pluck(items, 'id').join('|');
        return current_hash;
    };

    /**
     * Constructs data necessary for the round code list display
     *
     * @param {array} [companies] A filtered list of companies to construct a list of displayed round codes
     * @return {array} A list of round codes
     */
    this.roundCodeListData = _.memoize(function(rounds, roundHash) {
        if(typeof rounds === 'undefined') { return []; }

        var codeNames = _.unique(_.pluck(rounds, 'round_code'));
        var sortedRoundCodes = _.sortBy(_.map(codeNames, function(roundCode){
            return roundHash[roundCode];
        }), function(round){ return round.name; });

        return sortedRoundCodes;

    }, idListMemoFunction);

    /**
     * Constructs data necessary for the category list display
     *
     * @param {array} [categories] A filtered list of categories to display in the category list display
     * @param {array} [companies] A list of companies that have categories
     *                that are displayed in the category list display
     * @return {array} A list of categories ordered by the companies they belong to.
     */
    this.categoryListData = function(categories, companies) {
        if(typeof categories === 'undefined' || typeof companies === 'undefined') { return []; }

        _.each(categories, function(category) {
            var companyCount = _.select(companies, function(company) {
                return company.category_id === category.id;
            }).length;
            category.model_count = companyCount;
        });
        return categories;
    };

    /**
     * Constructs data necessary for the investor list display
     *
     * @param {array} [categories] A filtered list of inevestor to display in the inevestor list display
     * @param {array} [companies] A list of companies that have investors
     *                that are displayed in the inevestor list display
     * @return {array} A list of investors ordered by the companies they have invested in.
     */
    this.investorListData = function(investors, companies) {
        if(typeof investors === 'undefined' || typeof companies === 'undefined') { return []; }

        if(companies.length <= 1000) {
            var orderedInvestors = _.sortBy(investors, function(investor) {
                var companyCount = _.select(companies, function(company) {
                    return _.contains(investor.invested_company_ids, company.id);
                }).length;
                investor.model_count = companyCount;
                return companyCount * -1;
            });

            return orderedInvestors;
        }

        _.each(investors, function(investor) {
            delete investor.model_count;
        });
        return investors;
    };

    /**
     * Constructs data necessary for the totalFunding bar graph
     *
     * @param {array} [companies] A filtered list of companies to include in the totalFunding graph
     */
    this.totalFunding = _.memoize(function(companies, maxNum) {
        if(typeof maxNum === 'undefined' || typeof companies === 'undefined') { return; }

        return setupRanges(companies, 'total_funding', maxNum);
    }, idListMemoFunction);

    /**
     * Constructs data necessary for the Funding: Any Round area chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [extent] Where to start the x-axis of the area chart
     * @return {array} A count of all funding rounds grouped by round month/Year
     */
    this.fundingRoundCount = _.memoize(function(rounds, extent) {
        var byMonth = {};
        var parseDate = d3.time.format('%x').parse;
        var format = d3.time.format('%m/%Y');
        var parsed_format = format.parse(extent);
        var now = new Date();

        for(var i = format.parse(extent); i <= now; i.setMonth(i.getMonth() + 1)) {
            byMonth[format(i)] = 0;
        }

        _.each(rounds, function(funding_round){
            if(funding_round.funded_on) {
                var roundDate = parseDate(funding_round.funded_on);
                if(roundDate >= parsed_format) {
                    var monthYear = format(roundDate);
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
    }, idListMemoFunction);

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
    }, idListMemoFunction);

    /**
     * Constructs data necessary for the acquired value bar graph
     *
     * @param {array} [companies] A filtered list of companies to include in the acquired value graph
     * @param {int} [maxNum] integer representation of maximum acquired value
     * @return {array} of dollar ranges with their company counts
     */
    this.acquiredValueCount = _.memoize(function(companies, maxNum) {
        if(typeof maxNum === 'undefined' || typeof companies === 'undefined') { return; }

        return setupRanges(companies, 'acquired_value', maxNum);
    }, idListMemoFunction);

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
    }, idListMemoFunction);

    /**
     * Constructs data necessary for the Funding: Any Round bar chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [maxNum] The largest number in the set that we're graphing
     * @return {array} A count of all funding rounds grouped by raised amount in logarithmic ranges
     */
    this.fundingPerRound = _.memoize(function(rounds, maxNum) {
        if(typeof maxNum === 'undefined' || typeof rounds === 'undefined') { return; }

        return setupRanges(rounds, 'raised_amount', maxNum);
    }, idListMemoFunction);

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

        return setupRanges(companies, 'most_recent_raised_amount', maxNum);
    }, idListMemoFunction);

    /**
     * Constructs data necessary for the Company Status pie chart
     *
     * @param {array} [companies] A filtered list of companies
     * @return {array} A count of the number of companies per status (deadpooled, acquired, alive)
     */
    this.companyStatusData = _.memoize(function(companies) {
        var statuses = ['alive', 'deadpooled', 'acquired', 'IPOed'];
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
    }, idListMemoFunction);

    this.companyStateData = _.memoize(function(companies) {
        var state_grouping = _.countBy(companies, function(company) { return company.state_code; });

        return state_grouping;
    }, idListMemoFunction);

    /**
     * Constructs data necessary for the IPO Value bar graph
     *
     * @param {array} [companies] A filtered list of companies to include in the IPO value graph
     * @return {array} A collection of logarithmic ranges with their company count and pretty label
     */
    this.ipoValueData = _.memoize(function(companies, maxNum) {
        if(typeof maxNum === 'undefined' || typeof companies === 'undefined') { return; }

        return setupRanges(companies, 'ipo_valuation', maxNum);
    }, idListMemoFunction);

    this.ipoDateData = _.memoize(function(companies, extent) {
        var byMonth = {};
        var parseDate = d3.time.format('%x').parse;
        var format = d3.time.format('%Y');
        var parsed_format = format.parse(extent);
        var now = new Date();

        for(var i = parsed_format.getFullYear(); i <= now.getFullYear(); i++) {
            byMonth[i.toString()] = 0;
        }

        _.each(companies, function(company){
            if(company.ipo_on) {
                var ipoDate = parseDate(company.ipo_on);
                var monthYear = format(ipoDate);
                if(ipoDate >= parsed_format){
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
    }, idListMemoFunction);

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

    /**
    * Creates logarithmic ranges used in bar charts
    *
    * @param {array} collection of data to operate on
    * @param {string} property to calculate with
    * @param {int} maximum range
    * @param {int} number base
    * @param {int} upper bound of first range
    * @param {int} lower bound of first range
    * @return {array} of ranges and their counts
    */
    function setupRanges(collection, property, max, base, min, start) {
        min = min || 10000;
        base = base || 2;
        start = start || 1;

        var propertyList = _.pluck(collection, property);
        var ranges = [{start: start, end: min, label: labelfy(min), count: 0}];

        for(var i = min; i < max; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: labelfy(i * base), count: 0}
            );
        }

        _.each(propertyList, function(property) {
            if(!isNaN(property) && property > 0) {
                var index = rangeIndex(property, min, base);
                ranges[index].count++;
            }
        });

        return ranges;
    }
});
