package com.aem.cinema.react.core.models;

import java.util.List;

// This interface defines what the main Carousel component model exposes.
public interface Carousel {
    List<CarouselItem> getSlides();
    String getContentType(); // If you want to expose this property
}