(function() {
    'use strict';

    angular.module('wemApp.components').directive('wemgaPersoTracking', wemgaComponentDirective);

    function wemgaComponentDirective() {
        return {
            restrict: "E",
            scope: {
                ref: '=',
                parentList: '=',
                parentIndex: '=',
                types: '='
            },
            templateUrl: ManagersContext.wemAppPath + "/external-components/wemga-perso-tracking.directive.html",
            controller: WemgaComponentDirectiveController
        };
    }

    WemgaComponentDirectiveController.$inject = ['$scope', '_'];

    function WemgaComponentDirectiveController($scope, _) {
        console.log("Google analytics directive action ...");
    }
})();