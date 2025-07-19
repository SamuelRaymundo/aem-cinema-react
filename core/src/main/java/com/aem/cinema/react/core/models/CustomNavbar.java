package com.aem.cinema.react.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.day.cq.wcm.api.Page;

import java.util.List;

public interface CustomNavbar extends ComponentExporter {

    String getUrl();

    List<Page> getNavbarPages();

    String getTopazPlusUrl();
    String getAccessibilityUrl();
    String getFaqUrl();
}
