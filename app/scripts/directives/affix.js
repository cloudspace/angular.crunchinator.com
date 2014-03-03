'use strict';

angular.module( 'crunchinatorApp.directives').directive( 'affix', [ '$window', '$document', '$parse',
    function ( $window, $document, $parse ) {
        return {
            scope: {
                affix: '@',
                end: '@'
            },
            link: function ( scope, element ) {
                function checkPosition() {
                    //Where we should start affixing the element
                    var fixStart = $parse(scope.affix)(scope);

                    //Where we should stop affixing the element
                    var fixEnd = $parse(scope.end)(scope);

                    //Where the page top is
                    var offset = win.prop('pageYOffset');

                    var affix = false;
                    //Offset is between start and end, put it at the top.
                    if((offset >= fixStart) && (offset <= fixEnd)) {
                        affix = 'top';
                    }
                    //Offset is past the fix end, put it at the bottom of its container.
                    else if(offset >= fixEnd) {
                        affix = 'bottom';
                    }
                    
                    if (affixed === affix) { return; }
                        
                    affixed = affix;
                        
                    element.removeClass('affix affix-top affix-bottom').addClass('affix' + (affix ? '-' + affix : ''));
                }
                
                var win = angular.element ( $window ),
                    affixed;
                                            
                win.bind( 'scroll', checkPosition );
                win.bind( 'click', function () {
                    setTimeout( checkPosition, 1 );
                });
            }
        };
    }
]);
