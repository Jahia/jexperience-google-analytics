(function() {
    'use strict';

    angular.module('wemGaApp').controller(WemGaAppController);

    WemGaAppController.$inject = ['$scope','$sce', '$mdToast', 'jcrService', 'i18nService'];

    function WemGaAppController($scope,$sce,$mdToast,jcrService, i18nService){
        $scope.configuration = {
            identifier:null,
            newTag : null,
            weekNumber : null,
            hashtag : null,
            pages:[],
            folders:[],
            nodes:{},
            nofile : true
        };
        $scope.atsettings = {
            autofill:true,
            insertTag:true
        };
        $scope.tree = [];
        $scope.selectedPath = "";
        $scope.pathSelected = false;
        $scope.selectMessage = "";
        $scope.enablePicker = false;
        $scope.nodes=[];
        $scope.messageToDisplay = false;
        $scope.message="";

        $scope.changeMixins = function(type, mixinURL){
            //If true adding mixins if false removing mixins
            if(type){
                if (confirm(messages.addMessage)) {
                    $scope.addRemoveMixins(mixinURL,type);
                }
            } else {
                if (confirm(messages.removeMessage)) {
                    $scope.addRemoveMixins(mixinURL,type);
                }
            }
        }

        $scope.addRemoveMixins = function(url, type){
            jcrService.callAction(url).success(function(response){
                if(response.result.success == 'true'){
                    $mdToast.show($mdToast.simple().textContent(messages.successMessage).position("top right"));
                }
            }).error(function(response){
                $mdToast.show($mdToast.simple().textContent(messages.errorMessage).position("top right"));
            });
        };

        $scope.updateConfiguration = function(){
            var fileNode = $scope.configuration.nodes[$scope.atsettings.file];
            jcrService.doUpdateNodeById(urlContext,"default","en",$scope.configuration.node.id,{
                "properties":{
                    "autofill":{"value" : $scope.atsettings.autofill},
                    "inserttag":{"value" : $scope.atsettings.insertTag}
                }}).success(function(){
                $scope.message = "Configuration updated";
                $mdToast.show($mdToast.simple().textContent($scope.message).position("top right"));
            }).error(function(response){console.error("atinternetConfiguration.js - Error in creation !"); });
        };

        $scope.getConfiguration = function(configurationPath, urlContext){
            //get Configuration node
            jcrService.doGetOnPath(urlContext, 'default', 'en', configurationPath).success(function(response) {
                $scope.configuration.node = response;
                if($scope.configuration.node.properties.username != undefined){
                    $scope.atsettings.username = $scope.configuration.node.properties.username.value;
                }
                if($scope.configuration.node.properties.password != undefined){
                    $scope.atsettings.password = $scope.configuration.node.properties.password.value;
                }
                if($scope.configuration.node.properties.autofill != undefined){
                    $scope.atsettings.autofill = $scope.configuration.node.properties.autofill.value;
                }
                if($scope.configuration.node.properties.inserttag != undefined){
                    $scope.atsettings.insertTag = $scope.configuration.node.properties.inserttag.value;
                }
            }).error(function(response){
                //Tiles folder doesn't exist for that site
                console.error("wemga-configuration.js - no configuration node found");
            });
        };
        $scope.getConfiguration(sitePath+'/contents/wemga-settings', urlContext);
    }
})();