// components/CarouselItem/CarouselItem.jsx
import React from 'react';
import MovieDisplay from '../MovieDisplay/MovieDisplay'; // Importe o novo componente
import './CarouselItem.css';

const CarouselItem = (props) => {
    const { contentType, isActive, fileReference, title, buttonName, internalLink, externalLink, fragmentPath } = props;

    return (
        <div className={`carousel-item ${isActive ? 'active' : ''}`}>
            {/* Renderiza um Slide */}
            {contentType === 'slide' && (
                <div className="carousel-slide-content">
                    {fileReference && <img src={fileReference} alt={title || 'Slide Image'} className="carousel-image" />}
                    {title && <h3 className="carousel-title">{title}</h3>}
                    {buttonName && (internalLink || externalLink) && (
                        <a href={internalLink || externalLink} className="carousel-button">
                            {buttonName}
                        </a>
                    )}
                </div>
            )}

            {/* Renderiza um Filme usando o componente MovieDisplay */}
            {contentType === 'movies' && (
                <MovieDisplay fragmentPath={fragmentPath} cqPath={props.cqPath} />
            )}
        </div>
    );
};

export default CarouselItem;