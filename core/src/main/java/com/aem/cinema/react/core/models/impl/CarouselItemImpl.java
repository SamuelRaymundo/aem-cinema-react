package com.aem.cinema.react.core.models.impl;

import com.aem.cinema.react.core.models.CarouselItem;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(
        adaptables = Resource.class,
        adapters = CarouselItem.class,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class CarouselItemImpl implements CarouselItem {


    @ValueMapValue
    private String fileReference;

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String buttonName;

    @ValueMapValue
    private String internalLink;

    @ValueMapValue
    private String externalLink;

    @Override
    public String getFileReference() {
        return fileReference;
    }

    @Override
    public String getTitle() {
        return title;
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
}