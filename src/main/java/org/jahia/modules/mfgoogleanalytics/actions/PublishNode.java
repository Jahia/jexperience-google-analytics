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
