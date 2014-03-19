'use strict';

describe('Service: Browser', function() {

    // load the directive's module
    beforeEach(module('crunchinatorApp.services'));

    var Browser, uastring;
    beforeEach(inject(function (_Browser_) {
        Browser = _Browser_;
        Browser.getUserAgent = function() {
            return uastring;
        };
    }));

    describe('.isMobile', function(){
        it('detects iPhone browsers', function() {
            uastring = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko)';
            expect(Browser.isMobile.iOS()).toBeTruthy();
        });

        it('detects iPad browsers', function() {
            uastring = 'Mozilla/5.0 (iPad; U; CPU iPad OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko)';
            expect(Browser.isMobile.iOS()).toBeTruthy();
        });

        it('detects iPod browsers', function() {
            uastring = 'Mozilla/5.0 (iPod; U; CPU iPod OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko)';
            expect(Browser.isMobile.iOS()).toBeTruthy();
        });

        it('detects Android browsers', function() {
            uastring = 'Mozilla/5.0 (Android; Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';
            expect(Browser.isMobile.Android()).toBeTruthy();
        });

        it('Doesn\'t raise false positives', function(){
            uastring = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36';
            expect(Browser.isMobile.any()).toBeFalsy();
        });
    });

    describe('.isIE', function(){
        it('detects IE10', function(){
            uastring = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
            expect(Browser.isIE()).toBeTruthy();
        });

        it('Doesn\'t raise false positives.', function(){
            uastring = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36';
            expect(Browser.isIE()).toBeFalsy();
        });
    });
});
