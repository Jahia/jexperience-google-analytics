//Technical constants used to initiate google client api
var GOOGLE_API_DISCOVERY_DOCUMENTATION = ['https://www.googleapis.com/discovery/v1/apis/analytics/v3/rest'];
var GOOGLE_API_SCOPE = 'https://www.googleapis.com/auth/analytics https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.edit';

(function() {
    'use strict';
    angular.module('wemApp.components').directive('wemGoogle', wemGoogle);
    function wemGoogle() {
        return {
            restrict: 'E',
            templateUrl: ManagersContext.cmsContext + '/modules/mf-google-analytics/javascript/marketing-factory/common/angular/external-components/wemga-tracking.directive.html',
            controller: wemGoogleController,
            controllerAs: 'wemgaTrackingCtrl',
            scope: {
                variantsHolder:'@'
            }
        };
    }

    wemGoogleController.$inject = ['$scope','_', 'jcrService', 'notificationService', 'loadingSpinnerService', 'i18nService', '$http'];

    function wemGoogleController($scope, _, jcrService, notificationService, loadingSpinnerService, i18nService, $http) {
        var vm = this;
        vm.buttonLabel = i18nService.message('wemga.button.track.label');
        vm.buttonTooltip = i18nService.message('wemga.button.tooltip.label');
        vm.infoTooltip= i18nService.message('wemga.info.tooltip.label');
        vm.persoObject = JSON.parse($scope.variantsHolder);
        vm.notTracked = false;
        vm.persoObjectNode = null;
        jcrService.doGetOnId('default',null,vm.persoObject.nodeIdentifier).then(function(response){
            vm.persoObjectNode = response.data;
            vm.buttonLabel = vm.persoObjectNode.mixins.wemgooglemix__experiment?i18nService.message('wemga.button.update.label'):i18nService.message('wemga.button.track.label');
        });
        //This object will be filled with value requested on site node though jcr api
        vm.googleProperties = {};
        //Init google experiment object
        //String values can't exceed 255 characters
        vm.googleExperiment = {
            'accountId': '',
            'webPropertyId': '',
            'profileId': '',
            'resource': {
                'name': vm.persoObject.displayableName.length>250?vm.persoObject.displayableName.substring(0,250):vm.persoObject.displayableName,
                'servingFramework' : 'EXTERNAL',
                'minimumExperimentLengthInDays':90,
                'objectiveMetric': 'ga:pageviews',
                'status': 'RUNNING',
                'trafficCoverage' : 1,
                'variations': []
            }
        };

        //Public functions
        vm.isPublished = isPublished;
        vm.saveGaPerso = saveGaPerso;

        /**
         * This function checks wether an Experiment is published or not
         * @param persoObject
         * @returns {boolean}
         */
        function isPublished(persoObject){
            return persoObject.publicationStatus == 'Published';
        };

        /**
         * Called when cliking on the tracking button
         */
        function saveGaPerso(){
            loadingSpinnerService.show();
            vm.googleExperiment.resource.name = vm.persoObject.displayableName;
            var sitePath = _getSiteFromNodePath(vm.persoObject.nodePath);
            jcrService.doGetOnPath('default',null,sitePath).then(function(response){
                if(response.data.properties['google_apiKey'] && response.data.properties['google_oAuthKey']){
                    _.each(response.data.properties,function(property,propertyName){
                        if(propertyName.startsWith('google') || propertyName == "webPropertyID"){
                            vm.googleProperties[propertyName]=property.value;
                        }
                    });
                    if(!vm.googleExperiment.googleAnalytics_oAuthKey && vm.googleExperiment.googleAnalytics_apiKey){
                        loadingSpinnerService.hide();
                        notificationService.errorToast('You need api key AND oAuthKey in order to connect to google.<br/> Please verify both are set in your site options');
                    }
                    //Setup google experiment
                    vm.googleExperiment.accountId = vm.googleProperties.googleAnalytics_accountID;
                    vm.googleExperiment.webPropertyId = vm.googleProperties.webPropertyID;
                    vm.googleExperiment.profileId = vm.googleProperties.googleAnalytics_profileId;
                    //Save the perso as variant if perso is on a page
                    if(vm.persoObjectNode.type == 'jnt:page'){
                        vm.googleExperiment.resource.variations.push({'name':vm.persoObject.displayableName.length>250?vm.persoObject.displayableName.substring(0,250):vm.persoObject.displayableName,'url':'','status':vm.persoObject.publicationStatus=='Published'?'ACTIVE':'INACTIVE'});
                    }
                    _.each(vm.persoObject.variants,function(variation,index){
                        jcrService.doGetOnId('default',null,variation.nodeIdentifier).then(function(response){
                            var currentVariant = response.data;
                            if(!currentVariant.mixins.wemgooglemix__variable){
                                vm.notTracked = true;
                            }
                        });
                        vm.googleExperiment.resource.variations.push({'name':variation.name.length>250?variation.name.substring(0,250):variation.name,'url':'','status':variation.publicationStatus=='Published'?'ACTIVE':'INACTIVE'});
                    });
                    //Save Experiment in google Analytics
                    //Init google api connexion
                    _google_authorize();
                } else {
                    loadingSpinnerService.hide();
                    notificationService.errorToast("Please provide google api key and client id in your site options");
                }
            });
        }

        /**
         * This function gets the site path from a given node path
         * @param nodePath
         * @returns {string}
         */
        function _getSiteFromNodePath(nodePath){
            var delimiter = '/',
                tokens = nodePath.split(delimiter).slice(0,3);
            return tokens.join(delimiter); // those.that
        };

        /**
         * Initiate the connexion with the google api
         */
        function _google_authorize() {
            // 1. Load the JavaScript client library.
            // Loads the client library and the auth2 library together for efficiency.
            // Loading the auth2 library is optional here since `gapi.client.init` function will load
            // it if not already loaded. Loading it upfront can save one network request.
            return gapi.load('client:auth2', _start);
        };

        /**
         * Google services connection init function
         * @param callback
         */
        function _start() {
            // 2. Initialize the JavaScript client library.
            gapi.client.init({

                'apiKey': vm.googleProperties.google_apiKey,
                // clientId and scope are optional if auth is not required.
                'clientId': vm.googleProperties.google_oAuthKey,
                'discoveryDocs': GOOGLE_API_DISCOVERY_DOCUMENTATION,
                'scope': GOOGLE_API_SCOPE,
            }).then(function() {
                // 3. Initialize and make the API request.
                return gapi.client.analytics.management.accounts.list();
            }).then(function() {
                console.info('wemga-tracking.directive.js - Google services connection successful');
                _saveExperiment();
            }, function(reason) {
                if(reason.error){
                    if(reason.error == 'idpiframe_initialization_failed'){
                        console.error(reason.details);
                        loadingSpinnerService.hide();
                        notificationService.errorToast(reason.details);
                    } else {
                        loadingSpinnerService.hide();
                        notificationService.errorToast("Google services technical connection issue.");
                    }
                }
                if(reason.result && reason.result.error){
                    if(reason.result.error.code && reason.result.error.code == 401){
                        console.error('wemga-tracking.directive.js - Not connected to google services handling sign in');
                        return _handleGoogleSignIn().then(function(){_saveExperiment();});
                    } else {
                        loadingSpinnerService.hide();
                        notificationService.errorToast("Google services technical connection issue.");
                    }
                }
                else{
                    loadingSpinnerService.hide();
                    notificationService.errorToast("Google services technical connection issue.");
                }
            });
        };

        /**
         * Generates google sign in popup
         * @returns {*}
         */
        function _handleGoogleSignIn(){
            // Ideally the button should only show up after gapi.client.init finishes, so that this
            // handler won't be called before OAuth is initialized.
            return gapi.auth2.getAuthInstance().signIn();
        };



        /**
         * Call the initated google API to save an experiment
         */
        function _saveExperiment(){
            if(vm.persoObjectNode.mixins.wemgooglemix__experiment){
                vm.googleExperiment.experimentId = vm.persoObjectNode.properties.wemgaExperimentId.value;
                var request = gapi.client.analytics.management.experiments.update(vm.googleExperiment);
                request.execute(function (response) {
                    if(response.code>300){
                        loadingSpinnerService.hide();
                        notificationService.errorToast('Google analytics error : '+response.message);
                    } else {
                        loadingSpinnerService.hide();
                        notificationService.successToast('Updated successfully to Google analytics');
                    }
                });
            } else {
                var request = gapi.client.analytics.management.experiments.insert(vm.googleExperiment);
                var nodesId = "";
                request.execute(function (response) {
                    if(response.code>300){
                        loadingSpinnerService.hide();
                        notificationService.errorToast('Google analytics error : '+response.message);
                    } else {
                        console.info('wemga-tracking.directive.js - Experiment inserted successfully');
                        nodesId.length >0?nodesId+=","+vm.persoObject.nodeIdentifier:nodesId+=vm.persoObject.nodeIdentifier;
                        jcrService.addMixin('default', null, vm.persoObject.nodeIdentifier, 'wemgooglemix:experiment', {'properties':{
                            'wemgaExperimentId':{'value' : response.result.id},
                            'wemgaExperimentName':{'value' : vm.googleExperiment.resource.name},
                            'wemgaExperimentStatus':{'value' : vm.googleExperiment.resource.status}
                        }}, false).then(function (response) {
                            //Save the perso as variant if perso is on a page
                            if(vm.persoObjectNode.type == 'jnt:page'){
                                jcrService.addMixin('default', null, vm.persoObject.nodeIdentifier, 'wemgooglemix:variable', {'properties':{'wemgaVariableId':{'value' : 0},'wemgaVariableName':{'value' : vm.persoObject.displayableName.length>250?vm.persoObject.displayableName.substring(0,250):vm.persoObject.displayableName}}}, false);
                            }
                            var var_index = 1;
                            _.each(vm.persoObject.variants,function(variable,index){
                                nodesId.length >0?nodesId+=","+variable.nodeIdentifier:nodesId+=variable.nodeIdentifier;
                                jcrService.addMixin('default', null, variable.nodeIdentifier, 'wemgooglemix:variable', {'properties':{'wemgaVariableId':{'value' : vm.persoObjectNode.type == 'jnt:page'?index+1:index},'wemgaVariableName':{'value' : variable.name.length>250?variable.name.substring(0,250):variable.name}}}, false).then(function(response){
                                    if(var_index == vm.persoObject.variants.length){
                                        $http.post(ManagersContext.baseEdit + ManagersContext.currentSitePath + ".publishNodeAction.do?nodesid="+nodesId, {nodesIdobject:nodesId}).then(function(then_response){
                                            loadingSpinnerService.hide();
                                            vm.buttonLabel = i18nService.message('wemga.button.update.label');
                                            notificationService.successToast('Saved successfully to Google analytics');
                                        });
                                    } else {
                                        var_index++;
                                    }
                                });
                            });
                        });
                    }
                });
            }
        };
    }
})();