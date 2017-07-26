<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="wem" uri="http://www.jahia.org/tags/wem" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="subchild" type="org.jahia.services.content.JCRNodeWrapper"--%>
<template:addResources type="css" resources="wemga/vendor/angular-material.css"/>
<template:addResources type="css" resources="wemga/wemga.css"/>

<template:addResources type="javascript" resources="wemga/vendor/angular.js,
                                                    wemga/vendor/angular-animate.js,
                                                    wemga/vendor/angular-aria.js,
                                                    wemga/vendor/angular-messages.js,
                                                    wemga/vendor/angular-material.js,
                                                    wemga/vendor/angular-route.js" />

<template:addResources type="javascript" resources="wemga/underscore.js, wemga/angular-underscore.js, wemga/i18n.js, wemga/jahiaRestAPI-services.js, wemga/configuration.app.js, wemga/pathHandler.js, wemga/folderPicker.js"/>

<template:addResources>
<script type="text/javascript">
    var checked=false;
    var editor = null;
    var urlContext = "${url.context}";
    var siteId = "${renderContext.site.identifier}";
    sitePath = "${renderContext.site.path}";
    var ManagersContext = {
        jahiaUILocale : '${renderContext.mainResourceLocale}'
    };
    var selectedFolderPath="/configuration";
    var selectTargetI18n = "${i18NSelectTarget}";
    var messages = {
        addMessage : '<fmt:message key="wemga_settings.mixins.add.confirm.message"/>',
        removeMessage : '<fmt:message key="wemga_settings.mixins.remove.confirm.message"/>',
        successMessage : '<fmt:message key="wemga_settings.mixins.change.success.message"/>',
        errorMessage : '<fmt:message key="wemga_settings.mixins.change.error.message"/>'
    }
</script>
</template:addResources>
<%--
<template:addResources type="css" resources="atinternet/style.css"/>
--%>
<c:url var="addMixinsURL" value="${url.base}${renderContext.mainResource.node.path}.addMixinsAction.do"/>
<c:url var="removeMixinsURL" value="${url.base}${renderContext.mainResource.node.path}.removeMixinsAction.do"/>

<div ng-app="configurationApp" layout="column">
    <div layout="row" md-whiteframe="1">
        <md-toolbar>
            <div class="md-toolbar-tools">
                <h2><span><fmt:message key="wemga_settings.title"/></span></h2>
            </div>
        </md-toolbar>
    </div>
    <div ng-controller="configurationAppCtrl">
        <md-card>
            <md-card-content layout="column">
                <form name="atsettingsForm">
                    <md-switch ng-model="atsettings.autofill">
                        <fmt:message key="wemga_settings.autofill"/>
                    </md-switch>
                    <hr class="at-separator">
                    <md-switch ng-model="atsettings.insertTag">
                        <fmt:message key="wemga_settings.inserttag"/>
                    </md-switch>
                    <hr class="at-separator">
                    <h5><fmt:message key="wemga_settings.mixins.title"/></h5>
                    <p class="explication-text">
                        <fmt:message key="wemga_settings.mixins.text"/><br/>
                        <fmt:message key="wemga_settings.mixins.text2"/><br/>
                        <fmt:message key="wemga_settings.mixins.text3"/><br/>
                        <fmt:message key="wemga_settings.mixins.text4"/><br/>
                    </p>
                    <md-button class="md-primary add-mixin-button" ng-click="changeMixins(true, '${addMixinsURL}')">
                        <fmt:message key="wemga_settings.mixins.add.label"/>
                    </md-button>
                    <md-button class="md-primary remove-mixin-button" ng-click="changeMixins(false, '${removeMixinsURL}')">
                        <fmt:message key="wemga_settings.mixins.remove.label"/>
                    </md-button>
                    <md-card-actions layout="row" layout-align="end center">
                        <md-button class="md-primary" ng-click="updateConfiguration()">
                            <fmt:message key="wemga_settings.save.label"/>
                        </md-button>
                    </md-card-actions>
                </form>
            </md-card-content>
        </md-card>
    </div>
</div>