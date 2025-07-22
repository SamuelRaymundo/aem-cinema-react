package com.aem.cinema.react.core.models.impl;

import com.aem.cinema.react.core.models.Carousel;
import com.aem.cinema.react.core.models.CarouselItem; // New interface for individual slide
import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.aem.cinema.react.core.models.Movie;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource; // Crucial for multifields
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;

import javax.annotation.PostConstruct;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Sling Model representing the main Carousel component.
 * It adapts from a SlingHttpServletRequest and exposes a list of CarouselItem models.
 */
@Model(
        adaptables = {SlingHttpServletRequest.class},
        adapters = {Carousel.class, ComponentExporter.class}, // Add ComponentExporter for SPA/headless
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL,
        resourceType = {CarouselImpl.RESOURCE_TYPE}
)
@Exporter(
        name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
        extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class CarouselImpl implements Carousel, ComponentExporter {

    protected static final String RESOURCE_TYPE = "aem-cinema-react/components/carousel";


    @ValueMapValue
    private String contentType;

    @ChildResource(name = "slideAssets")
    private List<Resource> slideResources;

    @ChildResource(name = "movieAssets")
    private List<Resource> movieResources;

    private List<CarouselItem> slides;

    private List<Movie> movies;


    @PostConstruct
    protected void init() {
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
    }

    @Override
    public List<CarouselItem> getSlides() {
        return slides;
    }

    @Override
    public List<Movie> getMovies() {
        return movies;
    }

    public String getContentType() {
        return contentType;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}