import React from "react";
import { MapTo } from "@adobe/aem-react-editable-components";
import "./Highlight.css";

const RESOURCE_TYPE = "aem-cinema-react/components/highlight";

const Highlight = ({
                       fileReference,
                       title,
                       description,
                       alignment = "",
                       buttonName,
                       internalLink,
                       externalLink,
                   }) => {

    const getInternalLink = (link) => {
        if (!link) return null;
        return link.endsWith(".html") ? link : `${link}.html`;
    };

    const getExternalLink = (link) => {
        if (!link) return null;
        return /^https?:\/\//i.test(link) ? link : `http://${link}`;
    };

    const finalInternalLink = getInternalLink(internalLink);
    const finalExternalLink = getExternalLink(externalLink);
    const link = finalInternalLink || finalExternalLink || null;
    const isExternal = !!finalExternalLink && !finalInternalLink;

    return (
        <section className={`highlight ${alignment}`}>
            {fileReference && (
                <div className="highlight-image-wrapper">
                    <img
                        src={fileReference}
                        alt={title || "Highlight image"}
                        className="highlight-image"
                    />
                </div>
            )}

            <div className="highlight-content">
                {title && <h2 className="highlight-title">{title}</h2>}
                {description && <p className="highlight-description">{description}</p>}

                {buttonName && link && (
                    <a
                        href={link}
                        className="highlight-button"
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                        {buttonName}
                    </a>
                )}
            </div>
        </section>
    );
};

MapTo(RESOURCE_TYPE)(Highlight);

export default Highlight;
