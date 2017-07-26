var API_URL_START = "modules/api/jcr/v1";

/* REST API GENERAL FUNCTIONS */
/**
 * This function test a javascript object and return true if the object is empty and false in the other case
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}


/**
 * This function execute a vanilla ajax call
 * @param options : The object containing the options for the ajax call :
 *                  - type : The request type (POST, GET, DELETE, PUT)
 *                  - url : The ajax call URL
 *                  - contentType : The ajax request contentType (xml,json etc)
 *                  - dataType : The ajax request dataType (xml,json etc)
 *                  - responseType : The ajax request responseType (xml,json etc)
 *                  - success : The ajax request callback function in case of success
 *                  - error : The ajax request callback function in case of error
 *                  - jsonData : The ajax request data json Object for json contentType
 *                  - data : The ajax request data for other content types
 */
function ajax(options) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
        xhr.open(options.type, options.url, options.async);
        xhr.withCredentials = true;
    } else if (typeof XDomainRequest != 'undefined') {
        xhr = new XDomainRequest();
        xhr.open(options.type, options.url);
    }

    if (options.contentType) {
        xhr.setRequestHeader('Content-Type', options.contentType);
    }

    if (options.dataType) {
        xhr.setRequestHeader('Accept', options.dataType);
    }

    if (options.responseType) {
        xhr.responseType = options.responseType;
    }

    var wemExecuted = false;
    xhr.onreadystatechange = function () {
        if (!wemExecuted) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 || xhr.status == 204 || xhr.status == 304) {
                    if (xhr.responseText != null) {
                        wemExecuted = true;
                        options.success(xhr);
                    }
                } else {
                    options.error(xhr);
                    console.error('atinternet.js - XML request error: ' + xhr.statusText + ' (' + xhr.status + ')');
                }
            }
        }
    };

    if (options.jsonData && !isEmpty(options.jsonData)) {
        xhr.send(JSON.stringify(options.jsonData));
    } else if (options.data && !isEmpty(options.jsonData)) {
        xhr.send(options.data);
    } else {
        xhr.send();
    }
}

/**
 * @Author : Jahia(rahmed)
 * This function make an ajax call to the Jahia API and return the result of this call
 * @param workspace : the workspace to use on this call (live, default)
 * @param locale : the locale to use in ISO 639-1
 * @param way : the way to find the JCR entity on which make the call (nodes, byPath, byType)
 * @param method : the METHOD to call (GET, POST, PUT, DELETE ...)
 * @param endOfURI : the information needed to complete the entity search (id if the way is nodes, path if byPath and type if byType) with the options (/propertie/<propertieName> for example)
 * @param json : the Json to pass with the call
 * @param callback : the callback function for the request (Optional)
 * @param errorCallback : the error function for the request (Optional)
 * @return callResult : the result of the Ajax call
 */
function jahiaAPIStandardCall(urlContext, workspace, locale, way, endOfURI, method, jsonData, successCallback, errorCallback) {
    //defining the call URL from parameters
    var url = urlContext + "/" + API_URL_START + "/" + workspace + "/" + locale + "/" + way + (way == "paths"?"":"/") + endOfURI;
    //Calling the Jahia API using the parameters
    ajax({
        url: url,
        type: method,
        async: true,
        contentType: "application/hal+json",
        responseType: "text",
        jsonData: jsonData,
        dataType: 'text/html,application/xhtml+xml,application/json,application/xml;q=0.9,image/webp,*/*;q=0.8',
        success: successCallback,
        error: errorCallback
    });
}
/**
 * This function extract the content Variant properties from a JCR node and put them into the AT fields object
 * Variant properties are the properties of the atmix:atInternetVariant mixin
 * @param variantNode
 * @param atFields
 */
function getVariantFields(variantNode,atFields){
    if(variantNode !=null && variantNode.properties !=null){
        //Get At internet attribute from variant node
        if(variantNode.properties['wem__atVariableId'] != undefined){
            atFields.variant.variableId = parseInt(variantNode.properties['wem__atVariableId'].value);
        }
        if(variantNode.properties['wem__atVariableLabel'] != undefined){
            atFields.variant.variableLabel = variantNode.properties['wem__atVariableLabel'].value;
        }
        if(variantNode.properties['wem__atVersionId'] != undefined){
            atFields.variant.versionId = parseInt(variantNode.properties['wem__atVersionId'].value);
        }
        if(variantNode.properties['wem__atVersionLabel'] != undefined){
            atFields.variant.versionLabel = variantNode.properties['wem__atVersionLabel'].value;
        }
        if(variantNode.properties['wem__atCreationId'] != undefined){
            atFields.variant.creationId = variantNode.properties['wem__atCreationId'].value;
        }
        if(variantNode.properties['wem__atCreationLabel'] != undefined){
            atFields.variant.creationLabel = variantNode.properties['wem__atCreationLabel'].value;
        }
        atFields.variant.jcrId = variantNode.properties['jcr__uuid'].value;
    }
}
/**
 * This function extract the content Wrapper properties from a JCR node and put them into the AT fields object
 * Content wrapper properties are the properties of the atmix:atInternetArea mixin
 * @param wrapperNode
 * @param atFields
 */
function getWrapperFields(wrapperNode,atFields){
    if(wrapperNode !=null && wrapperNode !=undefined && wrapperNode.properties !=null && wrapperNode.properties !=undefined){
        //Get At internet attribute from area node
        if(wrapperNode.properties['wem__atTestId'] != undefined){
            atFields.area.testId = wrapperNode.properties['wem__atTestId'].value;
        }
        if(wrapperNode.properties['wem__atTestLabel'] != undefined){
            atFields.area.testLabel = wrapperNode.properties['wem__atTestLabel'].value;
        }
        if(wrapperNode.properties['wem__atWaveId'] != undefined){
            atFields.area.waveId = wrapperNode.properties['wem__atWaveId'].value;
        }
        atFields.area.jcrId = wrapperNode.properties['jcr__uuid'].value;
    }
}

/**
 * This function extract the page properties from a JCR node and put them into the AT fields object
 * Page properties are the properties of the atmix:atInternetPage mixin
 * @param pageNode
 * @param atFields
 */
function getPageFields(pageNode,atFields){
    if(pageNode.properties['wem__atPageName'] != undefined){
        atFields.page.pagename = pageNode.properties['wem__atPageName'].value;
    }
    atFields.page.jcrId = pageNode.properties['jcr__uuid'].value;
}

/**
 * This function gets the at-internet needed properties from the jcrnodes described in the wem event (data)
 * And push them to at-internet using the tag object
 * @param data
 * @param tag
 */
function getAtInternetFields(data,tag){
    var jcrParameters ={
        context : jcrContext,
        locale : jcrLocale,
        workspace : jcrWorkspace
    };
    //Get AT internet fields from the sent event data
    var atFields = {
        type:data.type,
        page:{
            pagename:null,
            jcrId:null
        },
        area:{
            testId:null,
            testLabel:null,
            waveId:null,
            jcrId:null
        },
        variant:{
            variableId:null,
            variableLabel:null,
            versionId:null,
            versionLabel:null,
            creationId:null,
            creationLabel:null,
            jcrId:null
        }
    };

    //Get variant node from path in JCR
    jahiaAPIStandardCall(jcrParameters.context, jcrParameters.workspace, jcrParameters.locale, "nodes", data.variant, "GET", {}, function(variantXhr){
        var variantJcrNode = JSON.parse(variantXhr.responseText);
        getVariantFields(variantJcrNode,atFields);
        if(data.variant != data.variantWrapper){
            //Get Area node from path in JCR
            jahiaAPIStandardCall(jcrParameters.context, jcrParameters.workspace, jcrParameters.locale, "nodes", data.variantWrapper, "GET", {}, function(wrapperXhr){
                var wrapperJcrNode = JSON.parse(wrapperXhr.responseText);
                getWrapperFields(wrapperJcrNode,atFields);
                if(data.variantWrapperPath != data.pagePath){
                    //Get Page node from path in JCR
                    jahiaAPIStandardCall(jcrParameters.context, jcrParameters.workspace, jcrParameters.locale, "paths", data.pagePath, "GET", {}, function(pageXhr){
                        var pageJcrNode = JSON.parse(pageXhr.responseText);
                        getPageFields(pageJcrNode,atFields);
                        sendFeedToAtInternet(atFields,tag);
                    }, function(response){console.warn("atinternet.js - Error when getting page node, the page will be pushed without mv test")});
                } else{
                    getPageFields(wrapperJcrNode,atFields);
                    sendFeedToAtInternet(atFields,tag);
                }
            }, function(response){console.warn("atinternet.js - Error when getting Area node, the page will be pushed without mv test")});
        } else {
            getWrapperFields(variantJcrNode,atFields);
            if(data.variantPath != data.pagePath){
                //Get Page node from path in JCR
                jahiaAPIStandardCall(jcrParameters.context, jcrParameters.workspace, jcrParameters.locale, "paths", data.pagePath, "GET", {}, function(pageXhr){
                    var pageJcrNode = JSON.parse(pageXhr.responseText);
                    getPageFields(pageJcrNode,atFields);
                    sendFeedToAtInternet(atFields,tag);
                }, function(response){console.warn("atinternet.js - Error when getting page node, the page will be pushed without mv test")});
            } else {
                getPageFields(variantJcrNode,atFields);
                sendFeedToAtInternet(atFields,tag);
            }
        }
    }, function(xhr){
        console.warn("atinternet.js - Error when getting Variant node, the page will be pushed without mv test");
    });

}

/**
 * This function push the data contained into the atField object directly to AT internet server using the tag Object
 * @param atFields
 * @param tag
 */
function sendFeedToAtInternet(atFields,tag){
    tag.page.set({
        name: atFields.page.pagename
    });
    if(atFields.area != undefined && atFields.area.testId !=undefined && atFields.variant.creationId != undefined){
        //Create mv testing
        var mvTesting = {
            test: atFields.area.testId+'['+atFields.type+'-'+atFields.area.testLabel+']',
            creation: atFields.variant.creationId+'['+atFields.variant.creationLabel+']'
        };
        if(atFields.area.waveId != undefined && atFields.area.waveId != null){
            mvTesting['waveId'] = parseInt(atFields.area.waveId);
        }
        tag.mvTesting.set(mvTesting);

        //Add details if exists
        var details = {};
        if(atFields.variant.variableId != undefined && atFields.variant.variableId !=null){
            details["variable"] = atFields.variant.variableId+'['+atFields.variant.variableLabel+']';
        }
        if(atFields.variant.versionId != undefined && atFields.variant.versionId !=null){
            details["version"] = atFields.variant.versionId+'['+atFields.variant.versionLabel+']';
        }
        tag.mvTesting.add(details);
    } else {
        var ids = "";
        if(atFields.area){
            if(atFields.area.testId){
                ids+=atFields.area.testId;
            }
            if(atFields.variant.creationId){
                ids+=atFields.variant.creationId;
            }
        }
        if(ids.length > 0){
            if(! atFields.area.testId){
                console.warn("atinternet.js - No test id defined, the page will be pushed without mv test");
            } else {
                console.warn("atinternet.js - No creation id defined, the page will be pushed without mv test");
            }
        }
    }
    //Send data to at internet
    tag.dispatch();
}

// Listen for the event.
document.addEventListener('displayWemVariant', function (e) {
    var data = e.detail;
    getAtInternetFields(data,new ATInternet.Tracker.Tag());
}, true);