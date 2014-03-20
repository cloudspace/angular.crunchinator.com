'use strict';

angular.module('crunchinatorApp.services').service('ComponentData', function(Company, Investor, Category, FundingRound, ToolBox) {
    /**
     * Collection of data used as datasources for dashboard widgets (list-select, bar-charts, area-charts, etc).
     */
    this.dataSets ={};

    /**
     * Updates the state of all data sets exposed to other facets of the system
     */
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

    /**
     * Creates checksum based on object ids. Used primarily for memoization state checking.
     *
     * @param {object} items to create checksum from.
     * @return {string} a string of joined object ids delimited by '|'.
     */
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
        return clusterByDate(rounds, 'funded_on', '%m/%Y', extent);
    }, idListMemoFunction);

    /**
     * Constructs data necessary for the Acquisition Date area chart
     *
     * @param {array} [companies] A filtered list of companies
     * @param {string} [extent] Where to start the x-axis of the area chart
     * @return {array} A count of all companies grouped by acquired_on month/Year
     */
    this.acquiredOnCount = _.memoize(function(companies, extent) {
        return clusterByDate(companies, 'acquired_on', '%m/%Y', extent);
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
        return clusterByDate(companies, 'founded_on', '%Y', extent);
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

    /**
     * Group companies by their states
     *
     * @param {array} list of filtered companies to group.
     * @return {array} a collection of states and their associated company counts.
     */
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

    /**
     * Constructs data necessary for the IPO Date area chart
     *
     * @param {array} a filtered list of companies to include in the IPO date chart.
     * @return {array} a collection of dates with their associated company counts.
     */
    this.ipoDateData = _.memoize(function(companies, extent) {
        return clusterByDate(companies, 'ipo_on', '%Y', extent);
    }, idListMemoFunction);

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
        var ranges = [{start: start, end: min, label: ToolBox.labelfy(min), count: 0}];

        for(var i = min; i < max; i *= base) {
            ranges.push(
                {start: i, end: i * base, label: ToolBox.labelfy(i * base), count: 0}
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

    /**
    * @param {array} collection of data to operate on
    * @param {string} property to calculate with
    * @param {string} D3 time format
    * @param {extent} starting date
    # @return {array} of ranges and their counts group by date
    */
    function clusterByDate(collection, property, format, extent) {
        extent = extent || 1992;

        var parseDate = d3.time.format('%x').parse;
        var dateFormat = d3.time.format(format);
        var parsedFormat = dateFormat.parse(extent);
        var now = new Date();

        var date = {};
        if(format === '%Y') {
            for(var i = parsedFormat.getFullYear(); i <= now.getFullYear(); i++) {
                date[i.toString()] = 0;
            }
        } else {
            for(var j = dateFormat.parse(extent); j <= now; j.setMonth(j.getMonth() + 1)) {
                date[dateFormat(j)] = 0;
            }
        }

        _.each(collection, function(item) {
            if(item[property]) {
                var propertyDate = parseDate(item[property]);
                if(propertyDate >= parsedFormat) {
                    date[dateFormat(propertyDate)]++;
                }
            }
        });

        return _.reduce(date, function(o, v, k){
            o.push({
                date: k,
                count: v
            });
            return o;
        }, []);
    }
});
