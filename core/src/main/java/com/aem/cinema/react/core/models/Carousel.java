package com.aem.cinema.react.core.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;
import java.util.Map;

// This interface defines what the main Carousel component model exposes.
public interface Carousel {
    List<CarouselItem> getSlides();
    List<Movie> getMovies();
    String getContentType(); // If you want to expose this property

    @JsonIgnore
    Map<String, Object> getAriaAttributes();

    @JsonIgnore
    String getRoleAttribute();
}