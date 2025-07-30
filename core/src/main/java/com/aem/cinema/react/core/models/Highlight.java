package com.aem.cinema.react.core.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Map;

public interface Highlight {

    String getFileReference();

    String getAlignment();

    String getTitle();

    String getDescription();

    String getButtonName();


    String getInternalLink();


    String getExternalLink();

    @JsonIgnore
    Map<String, Object> getAriaAttributes();

    @JsonIgnore
    String getRoleAttribute();
}