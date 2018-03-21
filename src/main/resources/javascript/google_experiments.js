/**
 * This function test a javascript object and return true if the object is empty and false in the other case
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}


/**
 * This function execute a vanilla ajax call
 * @param options The object containing the options for the ajax call :
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
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 204 || xhr.status === 304) {
                    if (xhr.responseText != null) {
                        wemExecuted = true;
                        options.success(xhr);
                    }
                } else {
                    options.error(xhr);
                    console.error('googleVariants.js - XML request error: ' + xhr.statusText + ' (' + xhr.status + ')');
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
 * @param urlContext
 * @param workspace the workspace to use on this call (live, default)
 * @param locale the locale to use in ISO 639-1
 * @param way the way to find the JCR entity on which make the call (nodes, byPath, byType)
 * @param endOfURI the information needed to complete the entity search (id if the way is nodes, path if byPath and type if byType) with the options (/propertie/<propertieName> for example)
 * @param method the METHOD to call (GET, POST, PUT, DELETE ...)
 * @param jsonData the Json to pass with the call
 * @param successCallback the callback function for the request (Optional)
 * @param errorCallback the error function for the request (Optional)
 * @return callResult the result of the Ajax call
 */
function jahiaAPIStandardCall(urlContext, workspace, locale, way, endOfURI, method, jsonData, successCallback, errorCallback) {
    ajax({
        url: urlContext + '/modules/api/jcr/v1/' + workspace + '/' + locale + '/' + way + (way === 'paths' ? '' : '/') + endOfURI,
        type: method,
        async: true,
        contentType: 'application/hal+json',
        responseType: 'text',
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
 * @param googleFields
 */
function getVariantFields(variantNode, googleFields) {
    if (variantNode && variantNode.properties) {
        // Get Google attribute from variant node
        if (variantNode.properties['wemgaVariableId']) {
            googleFields.variant.variableId = parseInt(variantNode.properties['wemgaVariableId'].value);
        }
        googleFields.variant.jcrId = variantNode.properties['jcr__uuid'].value;
    }
}
/**
 * This function extract the content Wrapper properties from a JCR node and put them into the AT fields object
 * Content wrapper properties are the properties of the atmix:atInternetArea mixin
 * @param wrapperNode
 * @param googleFields
 */
function getWrapperFields(wrapperNode, googleFields) {
    if (wrapperNode && wrapperNode.properties) {
        // Get Google attribute from area node
        if (wrapperNode.properties['wemgaExperimentId']) {
            googleFields.area.experimentId = wrapperNode.properties['wemgaExperimentId'].value;
        }
        googleFields.area.jcrId = wrapperNode.properties['jcr__uuid'].value;
    }
}

/**
 * This function gets the at-internet needed properties from the jcrnodes described in the wem event (variantInfo)
 * And push them to at-internet using the tag object
 * @param variantInfo
 */
function getGoogleFields(variantInfo) {
    var jcrParameters = {
        context: jcrContext,
        locale: jcrLocale,
        workspace: jcrWorkspace
    };
    // Get Google fields from the sent event variantInfo
    var googleFields = {
        type: variantInfo.type,
        area: {
            experimentId: null,
            jcrId: null,
            name: variantInfo.wrapper.displayableName.trim().substring(0, 65)
        },
        variant: {
            variableId: null,
            jcrId: null,
            name: variantInfo.displayableName.trim().substring(0, 65)
        }
    };

    // Get variant node from path in JCR
    jahiaAPIStandardCall(jcrParameters.context, jcrParameters.workspace, jcrParameters.locale, 'nodes', variantInfo.id, 'GET', {}, function (variantXhr) {
        var variantJcrNode = JSON.parse(variantXhr.responseText);
        getVariantFields(variantJcrNode, googleFields);
        if (variantInfo.id !== variantInfo.wrapper.id) {
            // Get Area node from path in JCR
            jahiaAPIStandardCall(jcrParameters.context, jcrParameters.workspace, jcrParameters.locale, 'nodes', variantInfo.wrapper.id, 'GET', {}, function (wrapperXhr) {
                var wrapperJcrNode = JSON.parse(wrapperXhr.responseText);
                getWrapperFields(wrapperJcrNode, googleFields);
                sendFeedToGoogle(googleFields);
            }, function () {
                console.warn('googleVariants.js - Error when getting Area node, the page will be pushed without mv test');
            });
        } else {
            getWrapperFields(variantJcrNode, googleFields);
            sendFeedToGoogle(googleFields);
        }
    }, function () {
        console.warn('googleVariants.js - Error when getting Variant node, the page will be pushed without mv test');
    });

}

/**
 * This function push the data contained into the googleFields object directly to Google server using the tag Object
 * @param googleFields
 */
function sendFeedToGoogle(googleFields) {
    if (googleFields.area && googleFields.area.experimentId && googleFields.variant.variableId) {
        // Create mv testing
        if (googleFields.area.experimentId) {
            ga('set', 'expId', googleFields.area.experimentId);     // The id of the experiment the user has been exposed to.
        }
        if (googleFields.variant.variableId) {
            ga('set', 'expVar', googleFields.variant.variableId);
        }
    } else {
        var ids = '';
        if (googleFields.area) {
            if (googleFields.area.experimentId) {
                ids += googleFields.area.experimentId;
            }
            if (googleFields.variant.variableId) {
                ids += googleFields.variant.variableId;
            }
        }
        if (ids.length > 0) {
            if (!googleFields.area.experimentId) {
                console.warn('googleVariants.js - No experiment id defined, the ' + googleFields.type + ' will be pushed without mv test');
            } else {
                console.warn('googleVariants.js - No variable id defined, the ' + googleFields.type + ' will be pushed without mv test');
            }
        }
    }

    // Make sure GA module is set
    if (typeof ga !== 'undefined') {
        // Sending an event that will carry the mv/test
        ga('send', 'event', googleFields.type, 'Display', googleFields.area.name + '-' + googleFields.variant.name, 5, true);
    }
}

// Listen for the event.\n" +
document.addEventListener('displayWemVariant', function (event) {
    var variantInfo = event.detail;
    if (variantInfo) {
        getGoogleFields(variantInfo);
    }
}, true);