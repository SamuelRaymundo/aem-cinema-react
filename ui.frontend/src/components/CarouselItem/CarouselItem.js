import React from 'react';
import './CarouselItem.css';

const CarouselItem = (props) => {
    const { isActive, fileReference, title, buttonName, internalLink, externalLink } = props;

    return (
        <div className={`carousel-item ${isActive ? 'active' : ''}`}>
            {fileReference && (
                <div className="carousel-item__image-wrapper">
                    <img src={fileReference} alt={title || 'Slide Image'} className="carousel-item__image" />
                </div>
            )}

            {/* Overlay Content */}
            <div className="carousel-item__overlay-content">
                {title && <h3 className="carousel-item__title">{title}</h3>}
                {buttonName && (internalLink || externalLink) && (
                    <a href={internalLink || externalLink} className="carousel-item__button">
                        {buttonName}
                    </a>
                )}
            </div>
        </div>
    );
};

export default CarouselItem;