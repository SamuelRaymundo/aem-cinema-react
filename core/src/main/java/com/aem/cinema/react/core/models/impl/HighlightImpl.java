package com.aem.cinema.react.core.models.impl;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.wcm.core.components.models.Component; // Keep Component interface if you still want to adapt to it
import com.adobe.cq.wcm.core.components.models.datalayer.ComponentData; // Keep import if you're adapting to Component
// REMOVED: import com.adobe.cq.wcm.core.components.models.datalayer.builder.DataLayerBuilder; // No longer needed if not using the builder

import com.aem.cinema.react.core.models.Highlight;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.api.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;


@Model(adaptables = SlingHttpServletRequest.class,

        adapters = {Highlight.class, Component.class, ComponentExporter.class},
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL,
        resourceType = HighlightImpl.RESOURCE_TYPE)
public class HighlightImpl implements Highlight, Component, ComponentExporter {

    private static final Logger LOGGER = LoggerFactory.getLogger(HighlightImpl.class);

    protected static final String RESOURCE_TYPE = "aem-cinema-react/components/highlight";

    @SlingObject
    private Resource resource;

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

    @JsonProperty("dataLayer")
    private Map<String,Object> dataLayerJson;

    private String id;


    private ComponentData componentData = null;

    @PostConstruct
    protected void init() {

        this.id = resource.getName() + "-" + Math.abs(resource.getPath().hashCode());
        LOGGER.debug("Manually generated ID for Highlight: {}", this.id);


        dataLayerJson = new HashMap<>();


        Map<String, Object> componentProperties = new HashMap<>();
        componentProperties.put("@type", RESOURCE_TYPE);
        componentProperties.put("id", this.id);


        if (this.title != null) {
            componentProperties.put("dc:title", this.title);
        }

         if (resource.getValueMap().containsKey("jcr:lastModified")) {
             componentProperties.put("repo:modifyDate", resource.getValueMap().get("jcr:lastModified", String.class));
         }

        String highlightLink = getInternalLink() != null ? getInternalLink() : getExternalLink();
        if (highlightLink != null) {
            componentProperties.put("xdm:linkURL", highlightLink);
        }
        dataLayerJson.put(this.id, componentProperties);

        LOGGER.debug("HighlightImpl dataLayerJson initialized: {}", dataLayerJson);
    }

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
            return internalLink.endsWith(".html") ? internalLink : internalLink + ".html";
        }
        return null;
    }

    @Override
    public String getExternalLink() {
        if(externalLink != null && !externalLink.isEmpty()) {
            return (externalLink.startsWith("http://") || externalLink.startsWith("https://")) ? externalLink : "http://" + externalLink;
        }
        return null;
    }

    @Override
    public String getFileReference() {
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

    @Override
    public String getId() {
        return this.id;
    }

    @Override
    public String getAppliedCssClasses() {
        return null;
    }

    @Override
    @JsonIgnore
    public ComponentData getData() {
        return this.componentData;
    }

    @Override
    @JsonIgnore
    public Map<String, Object> getAriaAttributes() {
        return null;
    }

    @Override
    @JsonIgnore
    public String getRoleAttribute() {
        return null;
    }

    @JsonProperty("dataLayer")
    public Map<String, Object> getDataLayer() {
        return dataLayerJson;
    }
}