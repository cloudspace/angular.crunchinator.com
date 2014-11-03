# angular.crunchinator.com

Crunchbase visualization with Angular.js and D3

## Quick Start if developing from Mac

Install Node.js and then:

```sh
$ git clone git://github.com/cloudspace/angular.crunchinator.com
$ cd angular.crunchinator.com
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
$ npm install grunt --save-dev
$ grunt serve
```
---

## Changing the API

You should be using the faker for local development, not staging data.

If you need to a make a change to the API, complete the following steps:
 1. Update webApiFaker to produce the type of output that you expect.
 1. In the same commit, update the JSON in the README to match what webApiFaker now returns
 1. Add a ticket to pivotal tracker assigned to the backend team and labeled with 'api' 
 1. Include a link to the README (and a diff showing the changes) with the version of the API you need
 1. When the API team finishes the change and marks the ticket as 'delivered' determine if the output matches your expectations (check this manually and/or by running grunt serve:staging)
 1. If the output is as expected, accept the ticket
 1. If the output is incorrect, reject the ticket 

Once the API has been successfully updated, any code that relies on the new data can be merged to master.

## Endpoint Schemas

### Companies
    {
        "companies":
        [
            {
                "id": 1,
                "name": "company1",
                "permalink": "company-1",
                "category_id": 15,
                "status": "deadpooled",
                "total_funding": 1000,
                "latitude": 1.0,
                "longitude": 1.0,
                "state_code": "FL",
                "acquired_on": "1/28/2014",
                "acquired_value: 3000000,
                "acquired_by_id": 1,
                "ipo_on": "1/28/2014",
                "ipo_valuation": 50000,
                "founded_on": "1/28/2014",
                "most_recent_raised_amount": 10000,
                "investor_ids":
                [
                    "person-1",
                    "company-1"
                ]
            }
        ]
    }


### Funding Rounds
    {
        "funding_rounds":
        [
            {
                "id": 1,
                "company_id": 3,
                "round_code": "series a",
                "raised_amount": 100.0,
                "funded_on": "10/10/2013",
                "investor_ids":
                [
                    "person-10",
                    "financial_organization-3",
                    "company-7"
                ]
            }
        ]
    }

### Investors
    {
        "investors"
        [
            {
                "id": "person-5",
                "name": "Test Name",
                "investor_type": "person",
                "permalink": "test-name",
                "invested_company_ids":
                [
                    1,
                    2,
                    3
                ],
                "invested_category_ids":
                [
                    10,
                    9,
                    8
                ]
            }
        ]
    }

### Categories
    {
        "categories"
        [
            {
                "id": 1,
                "name": "A Category",
                "display_name": "A better Category Name",
                "company_ids":
                [
                    1,
                    2,
                    3
                ],
                "investor_ids":
                [
                    "person-3",
                    "company-1"
                ]
            }
        ]
    }
