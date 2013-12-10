angular.module( 'ngBoilerplate.crunchinator', [
  'ui.state',
  'ui.bootstrap',
  'plusOne',
  'configuration'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'crunchinator', {
    url: '/crunchinator',
    views: {
      "main": {
        controller: 'CrunchinatorCtrl',
        templateUrl: 'crunchinator/crunchinator.tpl.html'
      }
    },
    data:{ pageTitle: 'Crunchinator Angularjs + D3js Demo by Cloudspace' }
  });
})

// CrunchinatorCtrl = function($scope) {
.controller( 'CrunchinatorCtrl', [ '$scope', 'ENV', function CrunchinatorCtrl( $scope, ENV ) {
  $scope.environment = ENV;
  $scope.companies = [
    {
      name: 'Google',
      total_money_raised: '$24B'
    }, {
      name: 'Facebook',
      total_money_raised: '$13B'
    }, {
      name: 'Twitter',
      total_money_raised: '$10B'
    }, {
      name: 'Google',
      total_money_raised: '$24B'
    }, {
      name: 'Facebook',
      total_money_raised: '$13B'
    }, {
      name: 'Twitter',
      total_money_raised: '$10B'
    }, {
      name: 'Google',
      total_money_raised: '$24B'
    }, {
      name: 'Facebook',
      total_money_raised: '$13B'
    }, {
      name: 'Twitter',
      total_money_raised: '$10B'
    }, {
      name: 'Google',
      total_money_raised: '$24B'
    }, {
      name: 'Facebook',
      total_money_raised: '$13B'
    }, {
      name: 'Twitter',
      total_money_raised: '$10B'
    }, {
      name: 'Google',
      total_money_raised: '$24B'
    }, {
      name: 'Facebook',
      total_money_raised: '$13B'
    }, {
      name: 'Twitter',
      total_money_raised: '$10B'
    }
  ];
  $scope.categories = [
    {
      name: 'Software',
      count: '18k'
    }, {
      name: 'Web',
      count: '15k'
    }, {
      name: 'E-Commerce',
      count: '9k'
    }, {
      name: 'Software',
      count: '18k'
    }, {
      name: 'Web',
      count: '15k'
    }, {
      name: 'E-Commerce',
      count: '9k'
    }, {
      name: 'Software',
      count: '18k'
    }, {
      name: 'Web',
      count: '15k'
    }, {
      name: 'E-Commerce',
      count: '9k'
    }, {
      name: 'Software',
      count: '18k'
    }, {
      name: 'Web',
      count: '15k'
    }, {
      name: 'E-Commerce',
      count: '9k'
    }, {
      name: 'Software',
      count: '18k'
    }, {
      name: 'Web',
      count: '15k'
    }, {
      name: 'E-Commerce',
      count: '9k'
    }, {
      name: 'Software',
      count: '18k'
    }, {
      name: 'Web',
      count: '15k'
    }, {
      name: 'E-Commerce',
      count: '9k'
    }
  ];
  return $scope.investors = [
    {
      name: 'DFJ',
      total_money_invested: '$17B'
    }, {
      name: 'First Round Capital',
      total_money_invested: '$1.3B'
    }, {
      name: 'Softech',
      total_money_invested: '$500M'
    }, {
      name: 'DFJ',
      total_money_invested: '$17B'
    }, {
      name: 'First Round Capital',
      total_money_invested: '$1.3B'
    }, {
      name: 'Softech',
      total_money_invested: '$500M'
    }, {
      name: 'DFJ',
      total_money_invested: '$17B'
    }, {
      name: 'First Round Capital',
      total_money_invested: '$1.3B'
    }, {
      name: 'Softech',
      total_money_invested: '$500M'
    }, {
      name: 'DFJ',
      total_money_invested: '$17B'
    }, {
      name: 'First Round Capital',
      total_money_invested: '$1.3B'
    }, {
      name: 'Softech',
      total_money_invested: '$500M'
    }, {
      name: 'DFJ',
      total_money_invested: '$17B'
    }, {
      name: 'First Round Capital',
      total_money_invested: '$1.3B'
    }, {
      name: 'Softech',
      total_money_invested: '$500M'
    }, {
      name: 'DFJ',
      total_money_invested: '$17B'
    }, {
      name: 'First Round Capital',
      total_money_invested: '$1.3B'
    }, {
      name: 'Softech',
      total_money_invested: '$500M'
    }, {
      name: 'DFJ',
      total_money_invested: '$17B'
    }, {
      name: 'First Round Capital',
      total_money_invested: '$1.3B'
    }, {
      name: 'Softech',
      total_money_invested: '$500M'
    }
  ];
}]);
