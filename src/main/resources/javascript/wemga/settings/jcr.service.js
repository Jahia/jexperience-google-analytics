(function() {
    'use strict';

    angular.module('wemGaApp').service('jcrService', jcrService);

    jcrService.$inject = ['$http'];

    function jcrService($http) {

        return {
            addMixin: addMixin,
            doGetOnPath: doGetOnPath,
            doGetOnPathSync: doGetOnPathSync
        };

        function addMixin(workspace, locale, nodeIdOrPath, mixin, mixinProperties, byPath) {
            var apiType = byPath ? "paths" : "nodes";
            nodeIdOrPath = byPath ? nodeIdOrPath : "/" + nodeIdOrPath;
            var url = _buildURL(workspace, locale, apiType, nodeIdOrPath) + "/mixins/" + mixin.replace(":", "__");
            return mixinProperties ? $http.put(url, mixinProperties) : $http.put(url);
        }

        function doGetOnPath(workspace, locale, path) {
            return $http.get(_buildURL(workspace, locale, "paths", path));
        }

        function doGetOnPathSync(workspace, locale, path) {
            var request = new XMLHttpRequest();
            request.open('GET', _buildURL(workspace, locale, "paths", path), false);
            request.send(null);

            return request.status === 200;
        }

        // Private function under this line
        function _buildURL(workspace, locale, type, endUrl) {
            return [ManagersContext.jcrRestAPIBase,
                    workspace ? workspace : "default",
                    locale ? locale : ManagersContext.currentSiteDefaultLanguage,
                    type ? type : "nodes"].join("/") + endUrl;
        }
    }
})();