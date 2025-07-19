package com.aem.cinema.react.core.models;


// This interface defines the properties of a single slide.
public interface CarouselItem {

    String getFileReference();
    String getTitle();
    String getButtonName();
    String getInternalLink();
    String getExternalLink();

    // Utility methods to simplify link handling
    default String getLink() {
        if (getInternalLink() != null && !getInternalLink().isEmpty()) {
            return getInternalLink();
        }
        return getExternalLink();
    }

    default boolean isInternalLink() {
        return getInternalLink() != null && !getInternalLink().isEmpty();
    }
}