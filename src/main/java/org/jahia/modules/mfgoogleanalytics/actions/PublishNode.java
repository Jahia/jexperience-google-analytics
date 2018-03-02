/*
    ==========================================================================================
    =                   JAHIA'S DUAL LICENSING - IMPORTANT INFORMATION                       =
    ==========================================================================================

                                    http://www.jahia.com

        Copyright (C) 2002-2018 Jahia Solutions Group SA. All rights reserved.

        THIS FILE IS AVAILABLE UNDER TWO DIFFERENT LICENSES:
        1/GPL OR 2/JSEL

        1/ GPL
        ==================================================================================

        IF YOU DECIDE TO CHOOSE THE GPL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program. If not, see <http://www.gnu.org/licenses/>.


        2/ JSEL - Commercial and Supported Versions of the program
        ===================================================================================

        IF YOU DECIDE TO CHOOSE THE JSEL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:

        Alternatively, commercial and supported versions of the program - also known as
        Enterprise Distributions - must be used in accordance with the terms and actions
        contained in a separate written agreement between you and Jahia Solutions Group SA.

        If you are unsure which license is appropriate for your use,
        please contact the sales department at sales@jahia.com.
 */
package org.jahia.modules.mfgoogleanalytics.actions;

import org.apache.commons.lang.StringUtils;
import org.jahia.bin.Action;
import org.jahia.bin.ActionResult;
import org.jahia.services.content.*;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.URLResolver;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

/**
 * Created by rahmed on 07/08/17.
 */
public class PublishNode extends Action {
    private static Logger logger = LoggerFactory.getLogger(PublishNode.class);

    @Override
    public ActionResult doExecute(HttpServletRequest req, RenderContext renderContext,
                                  Resource resource, JCRSessionWrapper session, Map<String,
            List<String>> parameters, URLResolver urlResolver) throws Exception {
        String nodeId = req.getParameter("nodesid");
        JSONObject response = new JSONObject();
        if(StringUtils.isNotEmpty(nodeId)){
            String[] nodesId  = nodeId.split(",");
            JCRTemplate jcrTemplate = JCRTemplate.getInstance();
            JCRSessionWrapper defaultSession = jcrTemplate.getSessionFactory().getCurrentSystemSession(org.jahia.api.Constants.EDIT_WORKSPACE, session.getLocale(), session.getFallbackLocale());
            JCRSessionWrapper liveSession = jcrTemplate.getSessionFactory().getCurrentSystemSession(org.jahia.api.Constants.LIVE_WORKSPACE, session.getLocale(), session.getFallbackLocale());
            JCRPublicationService ps = JCRPublicationService.getInstance();
            boolean publishedNode = false;
            for (int nodeindex=0;nodeindex<nodesId.length;nodeindex++){
                JCRNodeWrapper nodeToPublish = session.getNodeByIdentifier(nodesId[nodeindex]);
                if(nodeToPublish.isNodeType("wemgooglemix:experiment") || nodeToPublish.isNodeType("wemgooglemix:variable")){
                    publishedNode = true;
                    List<PublicationInfo> publicationInfo = ps.getPublicationInfo(nodesId[nodeindex], renderContext.getSite().getActiveLiveLanguages(), false, true, true, org.jahia.api.Constants.EDIT_WORKSPACE, org.jahia.api.Constants.LIVE_WORKSPACE);
                    ps.publishByInfoList(publicationInfo, org.jahia.api.Constants.EDIT_WORKSPACE, org.jahia.api.Constants.LIVE_WORKSPACE, false, null);
                } else {
                    logger.error("Tried to publish a non Google analytics node, the node won't be published !");
                    response.put("message", "Tried to publish a non Google analytics node, the node won't be published !");
                }
            }
            if(publishedNode){
                defaultSession.refresh(false);
                liveSession.refresh(false);
                response.put("published", true);
            }
        } else {
            response.put("published", false);
            response.put("message", "No node to publish");
        }



        return new ActionResult(HttpServletResponse.SC_OK, null, response);
    }
}
