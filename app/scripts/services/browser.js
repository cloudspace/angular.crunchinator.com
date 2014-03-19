'use strict';

angular.module('crunchinatorApp.services').service('Browser', [function() {
    var browser = {
        getUserAgent: function() {
            return navigator.userAgent;
        },
        isIE: function() {
            var myNav = browser.getUserAgent().toLowerCase();
            return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
        },
        isMobile: {
            Android: function() {
                return browser.getUserAgent().match(/Android/i);
            },
            BlackBerry: function() {
                return browser.getUserAgent().match(/BlackBerry/i);
            },
            iOS: function() {
                return browser.getUserAgent().match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return browser.getUserAgent().match(/Opera Mini/i);
            },
            Windows: function() {
                return browser.getUserAgent().match(/IEMobile/i);
            },
            any: function() {
                return (browser.isMobile.Android() || browser.isMobile.BlackBerry() || browser.isMobile.iOS() ||
                        browser.isMobile.Opera() || browser.isMobile.Windows());
            }
        }
    };

    return browser;
}]);
