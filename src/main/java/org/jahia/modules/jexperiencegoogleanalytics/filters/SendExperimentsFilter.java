/**
 * ==========================================================================================
 * =                   JAHIA'S DUAL LICENSING - IMPORTANT INFORMATION                       =
 * ==========================================================================================
 *
 *                                 http://www.jahia.com
 *
 *     Copyright (C) 2002-2019 Jahia Solutions Group SA. All rights reserved.
 *
 *     THIS FILE IS AVAILABLE UNDER TWO DIFFERENT LICENSES:
 *     1/GPL OR 2/JSEL
 *
 *     1/ GPL
 *     ==================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE GPL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 *
 *     2/ JSEL - Commercial and Supported Versions of the program
 *     ===================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE JSEL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     Alternatively, commercial and supported versions of the program - also known as
 *     Enterprise Distributions - must be used in accordance with the terms and conditions
 *     contained in a separate written agreement between you and Jahia Solutions Group SA.
 *
 *     If you are unsure which license is appropriate for your use,
 *     please contact the sales department at sales@jahia.com.
 */
package org.jahia.modules.jexperiencegoogleanalytics.filters;

import net.htmlparser.jericho.*;
import org.apache.commons.lang.StringUtils;
import org.jahia.api.Constants;
import org.jahia.data.templates.JahiaTemplatesPackage;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.cache.AggregateCacheFilter;
import org.jahia.services.templates.JahiaModuleAware;
import org.jahia.services.templates.JahiaTemplateManagerService;
import org.jahia.utils.ScriptEngineUtils;
import org.jahia.utils.WebUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;

import javax.jcr.RepositoryException;
import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.SimpleScriptContext;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.util.List;

/**
 * Created by rahmed on 03/08/17.
 */
public class SendExperimentsFilter extends AbstractFilter implements ApplicationListener<ApplicationEvent>, JahiaModuleAware {

    private static Logger logger = LoggerFactory.getLogger(SendExperimentsFilter.class);

    private ScriptEngineUtils scriptEngineUtils;

    private String template;

    private JahiaTemplatesPackage module;

    private String resolvedTemplate;

    public SendExperimentsFilter() {
        //Execute filter only if module is enabled on the site
        addCondition(new ExecutionCondition() {
            @Override
            public boolean matches(RenderContext renderContext, Resource resource) {
                try {
                    List<String> installedBundles = resource.getNode().getResolveSite().getInstalledModules();
                    return installedBundles.contains(module.getBundle().getSymbolicName());
                } catch (RepositoryException e) {
                    logger.error("Error when execute filter condition", e);
                }
                return false;
            }
        });
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        String out = previousOut;
        JCRSessionWrapper session = resource.getNode().getSession();
        String script = getResolvedTemplate();
        if (script != null) {
            String scriptUrl = renderContext.getURLGenerator().getContext() + "/modules/jexperience-google-analytics/javascript/google_experiments.js";
            Source source = new Source(previousOut);
            OutputDocument outputDocument = new OutputDocument(source);
            List<Element> headElementList = source.getAllElements(HTMLElementName.HEAD);
            for (Element element : headElementList) {
                final EndTag headEndTag = element.getEndTag();
                String extension = StringUtils.substringAfterLast(template, ".");
                ScriptEngine scriptEngine = scriptEngineUtils.scriptEngine(extension);
                ScriptContext scriptContext = new GoogleScriptContext();
                final Bindings bindings = scriptEngine.createBindings();
                bindings.put("scriptUrl", scriptUrl);
                bindings.put("jcrContext", renderContext.getURLGenerator().getContext());
                bindings.put("jcrWorkspace", Constants.LIVE_WORKSPACE);
                bindings.put("jcrLocale", session.getLocale());
                String url = resource.getNode().getUrl();
                if (renderContext.getRequest().getAttribute("analytics-path") != null) {
                    url = (String) renderContext.getRequest().getAttribute("analytics-path");
                }
                bindings.put("resourceUrl", url);
                bindings.put("resource", resource);
                scriptContext.setBindings(bindings, ScriptContext.GLOBAL_SCOPE);
                // The following binding is necessary for Javascript, which doesn't offer a console by default.
                bindings.put("out", new PrintWriter(scriptContext.getWriter()));

                scriptEngine.eval(script, scriptContext);
                StringWriter writer = (StringWriter) scriptContext.getWriter();

                final String googleScript = writer.toString();
                if (StringUtils.isNotBlank(googleScript)) {
                    outputDocument.replace(headEndTag.getBegin(), headEndTag.getBegin() + 1,
                            "\n" + AggregateCacheFilter.removeEsiTags(googleScript) + "\n<");
                }
                break; // avoid to loop if for any reasons multiple body in the page
            }
            out = outputDocument.toString().trim();
        }
        return out;
    }

    protected String getResolvedTemplate() throws IOException {
        if (resolvedTemplate == null) {
            resolvedTemplate = WebUtils.getResourceAsString(template);
            if (resolvedTemplate == null) {
                logger.warn("Unable to lookup template at {}", template);
            }
        }

        return resolvedTemplate;
    }

    public void onApplicationEvent(ApplicationEvent event) {
        JahiaTemplateManagerService service;
        if (event instanceof JahiaTemplateManagerService.TemplatePackageRedeployedEvent) {
            resolvedTemplate = null;
        }
    }

    public void setScriptEngineUtils(ScriptEngineUtils scriptEngineUtils) {
        this.scriptEngineUtils = scriptEngineUtils;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    @Override
    public void setJahiaModule(JahiaTemplatesPackage jahiaTemplatesPackage) {

        this.module = jahiaTemplatesPackage;

    }

    protected static class GoogleScriptContext extends SimpleScriptContext {
        private Writer writer = null;

        /**
         * {@inheritDoc}
         */
        @Override
        public Writer getWriter() {
            if (writer == null) {
                writer = new StringWriter();
            }
            return writer;
        }
    }
}