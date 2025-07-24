import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import CarouselItem from "../CarouselItem/CarouselItem";
import MovieDisplay from "../Movie/MovieDisplay";
import { useMoviesData } from '../../hooks/useMovieData'; // Import the new hook

import './Carousel.css';

const RESOURCE_TYPE = 'aem-cinema-react/components/carousel';



const Carousel = (props) => {
    // console.log('Carousel: Component Rendered');
    // console.log('Carousel: Props received:', props);

    const [activeIndex, setActiveIndex] = useState(0);
    // Use states from the custom hook
    const { moviesList, moviesListLoading, moviesListError, fetchMoviesList } = useMoviesData();

    const movieListRef = useRef(null);
    const intervalRef = useRef(null);
    const [isTeleporting, setIsTeleporting] = useState(false);

    const contentType = props.contentType;

    let carouselData = [];
    let calculatedTotalItems = 0;
    const numToDuplicate = 4;

    if (contentType === "movies") {
        if (!moviesListLoading && !moviesListError && moviesList.length > 0) {
            const head = moviesList.slice(-numToDuplicate);
            const tail = moviesList.slice(0, numToDuplicate);
            carouselData = [...head, ...moviesList, ...tail];
            calculatedTotalItems = moviesList.length;
        }
    } else if (contentType === "slide") {
        carouselData = props.slides || [];
        calculatedTotalItems = carouselData.length;
    }

    const goToNextItem = useCallback(() => {
        setActiveIndex((prevIndex) => {
            if (calculatedTotalItems === 0) return 0;
            const newIndex = (prevIndex + 1) % calculatedTotalItems;
            return newIndex;
        });
    }, [calculatedTotalItems]);

    const goToPrevItem = useCallback(() => {
        setActiveIndex((prevIndex) => {
            if (calculatedTotalItems === 0) return 0;
            const newIndex = (prevIndex - 1 + calculatedTotalItems) % calculatedTotalItems;
            return newIndex;
        });
    }, [calculatedTotalItems]);

    const scrollMovieList = useCallback((direction) => {
        if (!movieListRef.current || moviesList.length === 0) return;

        const container = movieListRef.current;
        const item = container.querySelector('.cmp-movie-card');
        if (!item) return;

        const itemWidth = item.offsetWidth;
        const gap = parseFloat(getComputedStyle(container).gap) || 0;
        const scrollAmount = itemWidth + gap;

        let newScrollLeft = container.scrollLeft;

        if (direction === 'next') {
            newScrollLeft += scrollAmount;
            if (newScrollLeft >= (moviesList.length + numToDuplicate) * scrollAmount - container.clientWidth + 1) {
                setIsTeleporting(true);
                newScrollLeft = numToDuplicate * scrollAmount;
            }
        } else {
            newScrollLeft -= scrollAmount;
            if (newScrollLeft <= numToDuplicate * scrollAmount - 1) {
                setIsTeleporting(true);
                newScrollLeft = (moviesList.length + numToDuplicate - 1) * scrollAmount - container.clientWidth;
            }
        }
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });

        if (isTeleporting) {
            setTimeout(() => {
                container.scrollTo({ left: newScrollLeft, behavior: 'auto' });
                setIsTeleporting(false);
            }, 300);
        }
    }, [moviesList.length, isTeleporting, numToDuplicate]); // Added numToDuplicate to dependencies

    // Effect to trigger fetching the list of movies
    useEffect(() => {
        if (contentType === "movies") {
            fetchMoviesList(); // Call the fetch function from the hook
        }
    }, [contentType, fetchMoviesList]); // Depend on contentType and fetchMoviesList (from hook)

    // 2. Effect for slide carousel auto-advance
    useEffect(() => {
        if (contentType === "slide" && calculatedTotalItems > 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                goToNextItem();
            }, 5000);
            return () => {
                clearInterval(intervalRef.current);
            };
        } else {
            clearInterval(intervalRef.current);
        }
    }, [calculatedTotalItems, goToNextItem, contentType]);

    // 3. Effect for movie carousel auto-scroll (optional)
    useEffect(() => {
        if (contentType === "movies" && moviesList.length > numToDuplicate) {
            const autoScrollInterval = setInterval(() => {
                scrollMovieList('next');
            }, 8000);
            return () => clearInterval(autoScrollInterval);
        }
    }, [contentType, moviesList.length, scrollMovieList, numToDuplicate]);

    // 4. Effect to initialize movie carousel scroll position
    useEffect(() => {
        if (contentType === "movies" && movieListRef.current && moviesList.length > 0) {
            const itemWidth = movieListRef.current.querySelector('.cmp-movie-card')?.offsetWidth || 250;
            const gap = parseFloat(getComputedStyle(movieListRef.current).gap) || 20;
            movieListRef.current.scrollTo({
                left: numToDuplicate * (itemWidth + gap),
                behavior: 'auto'
            });
        }
    }, [contentType, moviesList.length, numToDuplicate]);

    // --- CONDITIONAL RENDERING (AFTER ALL HOOKS ARE CALLED) ---
    if (contentType === "movies") {
        if (moviesListLoading) {
            return (
                <div className="carousel-placeholder">
                    <p>Carregando filmes para o carrossel...</p>
                </div>
            );
        }

        if (moviesListError) {
            return (
                <div className="carousel-placeholder carousel-error">
                    <p>Erro ao carregar filmes para o carrossel. Por favor, tente novamente.</p>
                </div>
            );
        }

        if (moviesList.length === 0) {
            return (
                <div className="carousel-placeholder">
                    <p>Nenhum filme configurado ou encontrado para o carrossel.</p>
                    {props.cqPath && <p>Caminho do componente: {props.cqPath}</p>}
                </div>
            );
        }
    } else if (contentType === "slide" && calculatedTotalItems === 0) {
        return (
            <div className="carousel-placeholder">
                <p>Nenhum slide configurado para o carrossel.</p>
                {props.cqPath && <p>Caminho do componente: {props.cqPath}</p>}
            </div>
        );
    }

    // --- MAIN RENDER ---
    return (
        <div>
            {/* --- SLIDE CONTENT --- */}
            {contentType === "slide" && (
                <div className="carousel-container carousel--slide-type">
                    <div className="carousel-slides-wrapper">
                        {carouselData.map((item, index) => (
                            <CarouselItem key={index} {...item} isActive={index === activeIndex} />
                        ))}
                    </div>

                    {calculatedTotalItems > 1 && (
                        <>
                            <button className="carousel-control prev" onClick={goToPrevItem} aria-label="Item Anterior">
                                &#10094;
                            </button>
                            <button className="carousel-control next" onClick={goToNextItem} aria-label="Próximo Item">
                                &#10095;
                            </button>
                            <div className="carousel-indicators">
                                {carouselData.map((_, index) => (
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
            )}

            {/* --- MOVIE CONTENT --- */}
            {contentType === "movies" && (
                <div className="carousel-container carousel--movie-type">
                    <h2 className="carousel-movie-section-title">PROGRAMAÇÃO</h2>

                    <div className="carousel-movie-list-wrapper" ref={movieListRef}>
                        {carouselData.map((movie, index) => (
                            <MovieDisplay key={`${movie._path || movie.title}-${index}`} movie={movie} />
                        ))}
                    </div>

                    {moviesList.length > numToDuplicate && (
                        <>
                            <button className="carousel-control prev" onClick={() => scrollMovieList('prev')} aria-label="Anterior">
                                &#10094;
                            </button>
                            <button className="carousel-control next" onClick={() => scrollMovieList('next')} aria-label="Próximo">
                                &#10095;
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

MapTo(RESOURCE_TYPE)(Carousel);

export default Carousel;