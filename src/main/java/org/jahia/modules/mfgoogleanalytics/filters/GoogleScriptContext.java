package org.jahia.modules.mfgoogleanalytics.filters;

import javax.script.SimpleScriptContext;
import java.io.StringWriter;
import java.io.Writer;

/**
 * Created by rahmed on 03/08/17.
 */
class GoogleScriptContext extends SimpleScriptContext {
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
