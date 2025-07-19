package com.aem.cinema.react.core.models.impl;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.aem.cinema.react.core.models.CustomNavbar;
import com.day.cq.wcm.api.NameConstants;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Spliterators;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Model(adaptables = SlingHttpServletRequest.class,
        adapters = CustomNavbar.class, // Changed this to the interface
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL,
        resourceType = CustomNavbarImpl.RESOURCE_TYPE
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
        extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class CustomNavbarImpl implements CustomNavbar, ComponentExporter {

    protected static final String RESOURCE_TYPE = "aem-cinema-react/components/customnavbar";

    @ValueMapValue
    protected String url;

    @ValueMapValue
    protected String topazPlusUrl;

    @ValueMapValue
    protected String accessibilityUrl;

    @ValueMapValue
    protected String faqUrl;

    @SlingObject
    public ResourceResolver resourceResolver;

    private List<Page> navbarPages;

    @PostConstruct
    protected void init() {
        if (url != null) {
            PageManager pageManager = resourceResolver.adaptTo(PageManager.class);

            if (pageManager != null) {
                Page parentPage = pageManager.getPage(url);

                if (parentPage != null) {
                    Iterator<Page> children = parentPage.listChildren();
                    navbarPages = StreamSupport.stream(
                                    Spliterators.spliteratorUnknownSize(children, 0), false)
                            .filter(this::isPageVisibleInNav)
                            .collect(Collectors.toList());
                }
            }
        }
    }

    // Helper method to check if a page should be visible in navigation
    private boolean isPageVisibleInNav(Page page) {
        if (page == null || page.getContentResource() == null) {
            return false; // Page doesn't exist or has no content
        }

        // Check cq:hideInNav property
        boolean hideInNav = page.getProperties().get(NameConstants.PN_HIDE_IN_NAV, false);
        if (hideInNav) {
            return false;
        }

        // Check onTime/offTime properties for validity
        Calendar onTime = page.getProperties().get(NameConstants.PN_ON_TIME, Calendar.class);
        Calendar offTime = page.getProperties().get(NameConstants.PN_OFF_TIME, Calendar.class);
        Calendar now = Calendar.getInstance();

        if (onTime != null && now.before(onTime)) {
            return false; // Page is not yet valid
        }
        if (offTime != null && now.after(offTime)) {
            return false; // Page is no longer valid
        }

        // Also commonly, pages without a jcr:title are hidden from nav
        // You can add this if desired:
        // if (org.apache.commons.lang3.StringUtils.isBlank(page.getTitle())) {
        //     return false;
        // }

        return true; // Page meets the visibility criteria
    }

    @Override
    public String getUrl() {
        return url;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }

    @Override
    public List<Page> getNavbarPages() {
        return navbarPages;
    }

    @Override
    public String getTopazPlusUrl() {
        return topazPlusUrl;
    }

    @Override
    public String getAccessibilityUrl() {
        return accessibilityUrl;
    }

    @Override
    public String getFaqUrl() {
        return faqUrl;
    }
}