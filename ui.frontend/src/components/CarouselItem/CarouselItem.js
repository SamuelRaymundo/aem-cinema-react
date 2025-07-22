import React from 'react';
import './CarouselItem.css';

const CarouselItem = (props) => {
    const { isActive, fileReference, title, buttonName, internalLink, externalLink } = props;

    return (
        <div className={`carousel-item ${isActive ? 'active' : ''}`}>
            {/* Image Wrapper and Image */}
            {fileReference && (
                <div className="carousel-item__image-wrapper"> {/* Use this class */}
                    <img src={fileReference} alt={title || 'Slide Image'} className="carousel-item__image" /> {/* Use this class */}
                </div>
            )}

            {/* Overlay Content */}
            <div className="carousel-item__overlay-content"> {/* Use this class */}
                {title && <h3 className="carousel-item__title">{title}</h3>} {/* Use this class */}
                {buttonName && (internalLink || externalLink) && (
                    <a href={internalLink || externalLink} className="carousel-item__button"> {/* Use this class */}
                        {buttonName}
                    </a>
                )}
            </div>
        </div>
    );
};

export default CarouselItem;