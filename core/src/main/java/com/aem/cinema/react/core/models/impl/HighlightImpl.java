package com.aem.cinema.react.core.models.impl;



import com.adobe.cq.export.json.ComponentExporter;
import com.aem.cinema.react.core.models.Highlight;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = SlingHttpServletRequest.class,
        adapters = Highlight.class,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL,
        resourceType = HighlightImpl.RESOURCE_TYPE)
public class HighlightImpl implements Highlight, ComponentExporter {

    protected static final String RESOURCE_TYPE = "aem-cinema-react/components/highlight";

    @ValueMapValue
    private String fileReference;

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String description;

    @ValueMapValue
    private String alignment;

    @ValueMapValue
    private String buttonName;

    @ValueMapValue
    private String internalLink;

    @ValueMapValue
    private String externalLink;


    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public String getButtonName() {
        return buttonName;
    }

    @Override
    public String getInternalLink() {

        if(internalLink != null && !internalLink.isEmpty()) {
            if(internalLink.endsWith(".html")) {
                return internalLink;
            }
            else {
                return internalLink + ".html";
            }
        }
        return null;
    }

    @Override
    public String getExternalLink() {
        if(externalLink != null && !externalLink.isEmpty()) {
            if(externalLink.startsWith("http://") || externalLink.startsWith("https://")) {
                return externalLink;
            }
            else {
                return "http://" + externalLink;
            }
        }
        return null;
    }

    @Override
    public String getfileReference() {
        return fileReference;
    }

    @Override
    public String getAlignment() {
        return alignment;
    }


    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}
