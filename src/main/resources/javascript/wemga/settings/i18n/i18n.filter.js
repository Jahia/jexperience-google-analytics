(function() {
    'use strict';

    angular.module('i18n').filter('translate', translateFilter);

    translateFilter.$inject = ['i18nService'];

    function translateFilter(i18nService) {
        return function(input) {
            return i18nService.message(input);
        };
    }
})();