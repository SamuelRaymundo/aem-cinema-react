package com.aem.cinema.react.core.models.impl;

import com.adobe.cq.wcm.core.components.models.Component;
import com.adobe.cq.wcm.core.components.models.datalayer.ComponentData;
import com.aem.cinema.react.core.models.Carousel;
import com.aem.cinema.react.core.models.CarouselItem;
import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.aem.cinema.react.core.models.Movie;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Model(
        adaptables = {SlingHttpServletRequest.class},
        adapters = {Carousel.class, ComponentExporter.class, Component.class},
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL,
        resourceType = {CarouselImpl.RESOURCE_TYPE}
)
@Exporter(
        name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
        extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class CarouselImpl implements Carousel, ComponentExporter, Component {

    private static final Logger LOGGER = LoggerFactory.getLogger(CarouselImpl.class);

    protected static final String RESOURCE_TYPE = "aem-cinema-react/components/carousel";

    @SlingObject
    private Resource resource;

    @Self
    private SlingHttpServletRequest request;

    @ValueMapValue
    private String contentType;

    @ChildResource(name = "slideAssets")
    private List<Resource> slideResources;

    @ChildResource(name = "movieAssets")
    private List<Resource> movieResources;

    private List<CarouselItem> slides;
    private List<Movie> movies;

    @JsonProperty("dataLayer")
    private Map<String, Object> dataLayerJson;

    private String id;

    private ComponentData componentData;

    @PostConstruct
    protected void init() {
        LOGGER.debug("Initializing CarouselImpl for resource: {}", resource.getPath());

        try {

            componentData = null;


            if (componentData != null) {
                this.id = componentData.getId();
            } else {

                this.id = resource.getName() + "-" + Math.abs(resource.getPath().hashCode());
            }

        } catch (Exception e) {
            LOGGER.error("Error initializing DataLayerBuilder. Falling back to manual ID and dataLayer creation.", e);
            this.id = resource.getName() + "-" + Math.abs(resource.getPath().hashCode());
            componentData = null;
        }



        dataLayerJson = new HashMap<>();
        if (componentData != null) {
            Map<String, Object> componentProperties = new HashMap<>();

            componentProperties.put("@type", componentData.getType());
            componentProperties.put("repo:modifyDate", componentData.getLastModifiedDate());
            componentProperties.put("id", componentData.getId());


            dataLayerJson.put(this.id, componentProperties);
        } else {

            Map<String, Object> componentProperties = new HashMap<>();
            componentProperties.put("@type", RESOURCE_TYPE);
            componentProperties.put("id", this.id);
            dataLayerJson.put(this.id, componentProperties);
        }


        if (slideResources != null && !slideResources.isEmpty()) {
            slides = slideResources.stream()
                    .map(resource -> resource.adaptTo(CarouselItem.class))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
        } else {
            slides = Collections.emptyList();
        }

        if (movieResources != null && !movieResources.isEmpty()) {
            movies = movieResources.stream()
                    .map(resource -> resource.adaptTo(Movie.class))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
        } else {
            movies = Collections.emptyList();
        }

        LOGGER.debug("CarouselImpl initialized. ID: {}, DataLayer JSON: {}", id, dataLayerJson);
    }

    @Override
    public List<CarouselItem> getSlides() {
        return slides;
    }

    @Override
    public List<Movie> getMovies() {
        return movies;
    }

    @Override
    public String getContentType() {
        return contentType;
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

    public Map<String, Object> getDataLayer() {
        return this.dataLayerJson;
    }
}