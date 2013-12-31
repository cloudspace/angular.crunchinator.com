# angular.crunchinator.com

Cloudspace Crunchinator Angular Demo


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

## Endpoint Schemas

### Companies
    {
        "companies":
        [
            {
                "id": 1,
                "name": "company1",
                "category_id": 15,
                "total_funding": 1000.0,
                "latitude": 1.0,
                "longitude": 1.0,
                "investor_ids":
                [
                    "person-1",
                    "company-1"
                ],
                "funding_rounds":
                [
                    {
                        "id": 1,
                        "raised_amount": 100.0,
                        "funded_on": "10/10/2013"
                    }
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
                "name", "A Category",
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