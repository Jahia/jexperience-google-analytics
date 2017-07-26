(function() {
    'use strict';

    angular.module('wemGaApp').config(wemGaAppConfig);

    function wemGaAppConfig($mdThemingProvider,$mdToastProvider){
        $mdThemingProvider.theme("wemga").primaryPalette("teal").accentPalette("deep-purple").warnPalette("red");
        $mdThemingProvider.setDefaultTheme("wemga");
        //TODO make it work
        //$mdToastProvider.;
    }
})();