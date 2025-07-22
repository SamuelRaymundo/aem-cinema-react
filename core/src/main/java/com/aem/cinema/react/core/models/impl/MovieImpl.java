package com.aem.cinema.react.core.models.impl;


import com.aem.cinema.react.core.models.Movie;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

@Model(
        adaptables = Resource.class,
        adapters = Movie.class,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class MovieImpl implements Movie {

    private static final Logger LOG = LoggerFactory.getLogger(MovieImpl.class);

    @Self
    private Resource currentResource;

    @Inject
    private ResourceResolver resourceResolver;

    private String poster;
    private String title;
    private String ageGroup;
    private String gender;
    private String movieTime;

    @ValueMapValue
    private String fragmentPath;

    @PostConstruct
    protected void init() {
        if (fragmentPath != null && !fragmentPath.isEmpty()) {
            Resource fragmentResource = resourceResolver.getResource(fragmentPath);
            if (fragmentResource != null) {
                // For Content Fragments, the actual element data is usually stored under jcr:content/data
                // or directly on jcr:content if it's an older CF or specific setup.
                Resource dataResource = fragmentResource.getChild("jcr:content/data"); // Standard location for CF data
                if (dataResource == null) {
                    // Fallback for simpler CFs where data might be directly on jcr:content or if 'data' node doesn't exist
                    dataResource = fragmentResource.getChild("jcr:content");
                }

                if (dataResource != null) {
                    ValueMap valueMap = dataResource.getValueMap();

                    // Retrieve properties by their names as they are stored in the CF's JCR node.
                    // These names MUST match the 'Property Name' from your Content Fragment Model.
                    this.poster = valueMap.get("poster", String.class);
                    this.title = valueMap.get("title", String.class);
                    this.ageGroup = valueMap.get("ageGroup", String.class);
                    this.gender = valueMap.get("gender", String.class);
                    this.movieTime = valueMap.get("movieTime", String.class);

                    LOG.debug("Movie data extracted from CF: Title={}, Poster={}", this.title, this.poster);

                } else {
                    LOG.warn("Content Fragment data resource (jcr:content/data or jcr:content) not found for path: {}", fragmentPath);
                }
            } else {
                LOG.warn("Fragment resource not found at path: {}", fragmentPath);
            }
        } else {
            LOG.warn("fragmentPath is null or empty for MovieImpl adapting resource: {}", currentResource != null ? currentResource.getPath() : "unknown");
        }
    }

    @Override
    public String getPoster() {
        return poster;
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getAgeGroup() {
        return ageGroup;
    }

    @Override
    public String getGender() {
        return gender;
    }

    @Override
    public String getMovieTime() {
        return movieTime;
    }

    public String getFragmentPath() {
        return fragmentPath;
    }

}