import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import axios from 'axios'; // Import axios directly here
import CarouselItem from "../CarouselItem/CarouselItem";
import MovieDisplay from "../Movie/MovieDisplay";

import './Carousel.css';

// Helper to get AEM Host
const getAemHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:4502';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
};

// GraphQL endpoint for your AEM project
const graphqlEndpoint = `${getAemHost()}/content/cq:graphql/aem-cinema-react/endpoint.json`;

const GET_FILME_LIST_QUERY = `
    query GetFilmeList {
        filmeList {
            items {
                _path
                title
                poster {
                    ... on ImageRef {
                        _path
                        mimeType
                    }
                }
                ageGroup
                gender
                movieTime
            }
        }
    }
`;

const Carousel = (props) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // States for movie list data directly within Carousel
    const [moviesList, setMoviesList] = useState([]);
    const [moviesListLoading, setMoviesListLoading] = useState(false);
    const [moviesListError, setMoviesListError] = useState(false);

    const movieListRef = useRef(null);
    const intervalRef = useRef(null);
    const [isTeleporting, setIsTeleporting] = useState(false);

    const contentType = props.contentType;

    let carouselData = [];
    let calculatedTotalItems = 0;
    const numToDuplicate = 4;

    // Function to fetch the list of movies (now internal to Carousel)
    const fetchMoviesList = useCallback(async () => {
        setMoviesListLoading(true);
        setMoviesListError(false);
        setMoviesList([]);
        try {
            const response = await axios.post(graphqlEndpoint, { query: GET_FILME_LIST_QUERY }, { withCredentials: true });
            if (response.data?.data?.filmeList?.items) {
                const moviesWithFullPosterPaths = response.data.data.filmeList.items.map(movie => ({
                    ...movie,
                    poster: movie.poster ? `${getAemHost()}${movie.poster._path}` : ''
                }));
                setMoviesList(moviesWithFullPosterPaths);
            } else {
                setMoviesListError(true);
                console.error("Carousel: No movie items found or unexpected GraphQL response for list.", response.data);
            }
        } catch (err) {
            setMoviesListError(true);
            console.error("Carousel: Error fetching movie list:", err);
        } finally {
            setMoviesListLoading(false);
        }
    }, []); // Empty dependency array, function created once

    // Prepare data based on content type
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
    }, [moviesList.length, isTeleporting, numToDuplicate]);

    // Effect to trigger fetching the list of movies for 'movies' content type
    useEffect(() => {
        if (contentType === "movies") {
            fetchMoviesList(); // Call the fetch function directly from here
        }
    }, [contentType, fetchMoviesList]);

    // Effect for generic slide carousel auto-advance
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

    // Effect for movie carousel auto-scroll
    useEffect(() => {
        if (contentType === "movies" && moviesList.length > numToDuplicate) {
            const autoScrollInterval = setInterval(() => {
                scrollMovieList('next');
            }, 8000);
            return () => clearInterval(autoScrollInterval);
        }
    }, [contentType, moviesList.length, scrollMovieList, numToDuplicate]);

    // Effect to initialize movie carousel scroll position
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

    // --- CONDITIONAL RENDERING FOR LOADING/ERROR/EMPTY STATES ---
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

    // --- MAIN RENDER LOGIC ---
    const programacaoPage = "http://localhost:4502/content/aem-cinema-react/us/en/home/programacao.html?wcmmode=disabled"
    return (
        <div>
            {/* Render for SLIDE content type */}
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

            {/* Render for MOVIE content type */}
            {contentType === "movies" && (
                <div className="carousel-container carousel--movie-type">
                    <h2 className="carousel-movie-section-title">
                        <a href={programacaoPage}>PROGRAMAÇÃO</a>
                    </h2>

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

// Map the React Carousel component to the AEM component's sling:resourceType
const CAROUSEL_RESOURCE_TYPE_AEM = 'aem-cinema-react/components/carousel';
MapTo(CAROUSEL_RESOURCE_TYPE_AEM)(Carousel);

export default Carousel;