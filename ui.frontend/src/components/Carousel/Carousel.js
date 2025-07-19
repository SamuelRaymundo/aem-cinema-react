// components/Carousel/Carousel.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import CarouselItem from "../CarouselItem/CarouselItem";
import './Carousel.css'

const RESOURCE_TYPE = 'aem-cinema-react/components/carousel'

const Carousel = ({ items, cqPath }) => { // Renomeado 'slides' para 'items' conforme discutido anteriormente
    const [activeIndex, setActiveIndex] = useState(0);
    const totalItems = items ? items.length : 0;

    const goToNextItem = useCallback(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % totalItems);
    }, [totalItems]);

    const goToPrevItem = useCallback(() => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
    }, [totalItems]);

    useEffect(() => {
        if (totalItems <= 1) {
            return;
        }
        const interval = setInterval(() => {
            goToNextItem();
        }, 5000);
        return () => clearInterval(interval);
    }, [totalItems, goToNextItem]);

    if (!items || totalItems === 0) {
        return (
            <div className="carousel-placeholder">
                <p>Nenhum item configurado para o carrossel. Por favor, adicione itens no AEM.</p>
                {cqPath && <p>Caminho do componente: {cqPath}</p>}
            </div>
        );
    }

    return (
        <div className="carousel-container">
            <div className="carousel-slides-wrapper">
                {items.map((item, index) => (
                    // Passe todas as propriedades do 'item' diretamente, incluindo 'contentType' e 'fragmentPath' se for um filme.
                    <CarouselItem key={index} {...item} isActive={index === activeIndex} />
                ))}
            </div>

            {totalItems > 1 && (
                <>
                    <button className="carousel-control prev" onClick={goToPrevItem} aria-label="Item Anterior">
                        &#10094;
                    </button>
                    <button className="carousel-control next" onClick={goToNextItem} aria-label="Próximo Item">
                        &#10095;
                    </button>

                    <div className="carousel-indicators">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Ir para o item ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

MapTo(RESOURCE_TYPE)(Carousel);

export default Carousel;