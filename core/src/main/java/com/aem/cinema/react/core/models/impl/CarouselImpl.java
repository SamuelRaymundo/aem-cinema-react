package com.aem.cinema.react.core.models.impl;

import com.aem.cinema.react.core.models.Carousel;
import com.aem.cinema.react.core.models.CarouselItem; // New interface for individual slide
import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
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

    // You can inject properties specific to the overall carousel, if any
    @ValueMapValue
    private String contentType; // From your dialog's "contentType" field

    // This is the key: Inject the child resources created by the multifield
    // The 'name' attribute here must match the 'name' attribute of the <field> in your dialog's multifield,
    // which is "./slideAssets" from your XML.
    @ChildResource(name = "slideAssets")
    private List<Resource> slideResources; // Inject as raw Resources initially

    // This list will hold the adapted CarouselItem models
    private List<CarouselItem> slides;

    // The PostConstruct method is executed after all injections are done.
    // It's used to adapt the raw Resources into your specific CarouselItem models.
    @PostConstruct
    protected void init() {
        if (slideResources != null && !slideResources.isEmpty()) {
            slides = slideResources.stream()
                    .map(resource -> resource.adaptTo(CarouselItem.class))
                    .filter(java.util.Objects::nonNull) // Filter out any resources that couldn't be adapted
                    .collect(Collectors.toList());
        } else {
            slides = Collections.emptyList();
        }
    }

    /**
     * Returns the list of carousel items (slides).
     * This is the primary method to expose the multifield data.
     * @return A list of {@link CarouselItem} models.
     */
    @Override // If your Carousel interface defines getSlides()
    public List<CarouselItem> getSlides() {
        return slides;
    }

    /**
     * Returns the content type chosen in the dialog (e.g., "slide").
     * @return The content type string.
     */
    public String getContentType() {
        return contentType;
    }

    // --- ComponentExporter method for SPA/headless ---
    @Override
    public String getExportedType() {
        return RESOURCE_TYPE; // Must match the component's resource type
    }


}