package com.aem.cinema.react.core.models.impl;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.adobe.cq.wcm.core.components.models.contentfragment.ContentFragment;
import com.aem.cinema.react.core.models.Movie;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource; // Alterado aqui
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

@Model(
        adaptables = SlingHttpServletRequest.class,
        adapters = Movie.class,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL,
        resourceType = {MovieImpl.RESOURCE_TYPE}
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class MovieImpl implements Movie, ComponentExporter {


    protected static final String RESOURCE_TYPE = "aem-cinema-react/components/movie";

    private static final Logger LOG = LoggerFactory.getLogger(MovieImpl.class);

    @ValueMapValue
    private String fragmentPath;

    private ContentFragment contentFragment;

    @Inject
    private Resource resource;

    @Inject
    private ResourceResolver resourceResolver;

    @PostConstruct
    protected void init() {
        if (fragmentPath != null && !fragmentPath.isEmpty()) {
            Resource cfResource = resourceResolver.getResource(fragmentPath);
            if (cfResource != null) {
                contentFragment = cfResource.adaptTo(ContentFragment.class);
                if (contentFragment == null) {
                    LOG.warn("Resource at path {} is not a Content Fragment.", fragmentPath);
                }
            } else {
                LOG.warn("Content Fragment resource not found at path: {}", fragmentPath);
            }
        }
    }

    public ContentFragment getContentFragment() {
        return contentFragment;
    }


    public String getFragmentPath() {
        return fragmentPath;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}