(function() {
    'use strict';

    angular.module('i18n').directive('messageKey', messageKeyDirective);

    messageKeyDirective.$inject = ['i18nService'];

    function messageKeyDirective(i18nService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var i18n;
                if(!attrs.messageParams){
                    i18n = i18nService.message(attrs.messageKey);
                } else {
                    i18n = i18nService.format(attrs.messageKey, attrs.messageParams);
                }

                if(attrs.messageAttr) {
                    // store the i18n in the specified element attr
                    element.attr(attrs.messageAttr, i18n);
                } else {
                    // set the i18n as element text
                    element.text(i18n);
                }
            }
        };
    }
})();