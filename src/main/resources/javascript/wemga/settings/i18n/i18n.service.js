(function() {
    'use strict';

    angular.module('i18n').service('i18nService', i18nService);

    function i18nService() {
        var _i18nMap = {};

        return {
            initMap: initMap,
            addKeyToMap: addKeyToMap,
            message: message,
            format: format,
            contains: contains
        };

        function contains(key) {
            return (_i18nMap && _i18nMap[key]);
        }

        function message(key) {
            if (_i18nMap && _i18nMap[key]) {
                return _i18nMap[key];
            } else {
                return '???' + key + '???';
            }
        }

        function format(key, params) {
            var replacer = function(params){
                return function(s, index) {
                    return params[index] ? (params[index] == '__void__' ? '' : params[index]) : '';
                };
            };

            if(params){
                if (_i18nMap && _i18nMap[key]) {
                    return _i18nMap[key].replace(/\{(\w+)\}/g, replacer(params.split('|')));
                } else {
                    return '???' + key + '???';
                }
            } else {
                return this.message(key);
            }
        }

        function addKeyToMap(newI18nMap) {
            angular.forEach(newI18nMap, function (value, key) {
                _i18nMap[key] = value;
            });
        }

        function initMap(i18nMap) {
            _i18nMap = i18nMap;
        }
    }
})();
