import React, {useEffect, useState, useCallback, useRef} from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import CarouselItem from "../CarouselItem/CarouselItem";
import MovieDisplay from "../Movie/MovieDisplay";
import axios from 'axios';

import './Carousel.css'

const RESOURCE_TYPE = 'aem-cinema-react/components/carousel'

const getAemHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:4502';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
};

const Carousel = (props) => {
    console.log('Carousel: Component Rendered');
    console.log('Carousel: Props received:', props);

    const [activeIndex, setActiveIndex] = useState(0);
    const [fetchedMoviesData, setFetchedMoviesData] = useState([]); // State to hold fetched movie data
    const [loadingMovies, setLoadingMovies] = useState(false);     // Loading state for movies
    const [errorFetchingMovies, setErrorFetchingMovies] = useState(false); // Error state for movies

    const movieListRef = useRef(null);

    // ... (goToNextItem and goToPrevItem for 'slide' type remain the same) ...

    // NEW: Functions to handle scrolling for the movie list
    const scrollMovieList = useCallback((direction) => {
        if (movieListRef.current) {
            const scrollAmount = 300; // Adjust this value based on how much you want to scroll per click
                                      // A good value might be the width of one card + its gap
            if (direction === 'next') {
                movieListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else {
                movieListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    }, []);

    const contentType = props.contentType;
    console.log('Carousel: Current contentType:', contentType);


    // --- useEffect to fetch movies when contentType is 'movies' ---
    useEffect(() => {
        console.log('Carousel useEffect: contentType changed or component mounted. Checking fetch condition...');
        if (contentType === "movies") {
            console.log('Carousel useEffect: contentType is "movies", initiating movie fetch.');
            const fetchMovies = async () => {
                setLoadingMovies(true);
                setErrorFetchingMovies(false);
                setFetchedMoviesData([]); // Clear previous data on new fetch attempt
                console.log('Carousel fetchMovies: Setting loadingMovies to true.');

                try {
                    const graphqlEndpoint = `${getAemHost()}/content/cq:graphql/aem-cinema-react/endpoint.json`;
                    const query = `
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
                    console.log('Carousel fetchMovies: GraphQL Endpoint:', graphqlEndpoint);
                    console.log('Carousel fetchMovies: GraphQL Query:', query);


                    const response = await axios.post(graphqlEndpoint, {
                        query: query
                    }, {
                        withCredentials: true
                    });

                    console.log('Carousel fetchMovies: GraphQL Response:', response);

                    if (response.data && response.data.data && response.data.data.filmeList && response.data.data.filmeList.items) {
                        const moviesWithFullPosterPaths = response.data.data.filmeList.items.map(movie => ({
                            ...movie,
                            poster: movie.poster ? `${getAemHost()}${movie.poster._path}` : ''
                        }));
                        setFetchedMoviesData(moviesWithFullPosterPaths);
                        console.log('Carousel fetchMovies: Successfully fetched movies. Data:', moviesWithFullPosterPaths);
                    } else {
                        setErrorFetchingMovies(true);
                        console.error("Carousel: Failed to fetch movie list or data is empty.", response.data);
                        console.log('Carousel fetchMovies: Setting errorFetchingMovies to true (data empty/malformed).');
                    }
                } catch (err) {
                    console.error("Carousel: Error fetching movie list:", err);
                    setErrorFetchingMovies(true);
                    console.log('Carousel fetchMovies: Setting errorFetchingMovies to true (network error).');
                } finally {
                    setLoadingMovies(false);
                    console.log('Carousel fetchMovies: Setting loadingMovies to false.');
                }
            };
            fetchMovies();
        } else {
            console.log('Carousel useEffect: contentType is not "movies", skipping movie fetch.');
        }
    }, [contentType]);

    let assets = [];
    let allFetchedMovies = []; // For the horizontal movie list
    let slidesForCarousel = []; // For the slide carousel

    // --- Data Assignment Logic ---
    console.log('Carousel: Applying Data Assignment Logic...');
    if (contentType === "movies") {
        if (!loadingMovies && !errorFetchingMovies) {
            allFetchedMovies = fetchedMoviesData; // Use the entire fetched list for horizontal display
            console.log('Carousel Data Logic (Movies): Using all fetchedMoviesData for horizontal display:', allFetchedMovies);
        } else {
            console.log('Carousel Data Logic (Movies): Not assigning, loadingMovies:', loadingMovies, 'errorFetchingMovies:', errorFetchingMovies);
        }
    } else if (contentType === "slide") {
        assets = props.slides || [];
        slidesForCarousel = assets; // Use assets directly for individual slides
        console.log('Carousel Data Logic (Slides): Using props.slides as assets:', assets);
    }

    let carouselData = [];
    let calculatedTotalItems = 0;

    // --- Determine active carousel data and total items ---
    if (contentType === "movies") {
        carouselData = allFetchedMovies; // This holds the flat list of all movies
        calculatedTotalItems = carouselData.length; // Total count of individual movies
        console.log('Carousel: carouselData set to allFetchedMovies:', carouselData);
    } else if (contentType === "slide") {
        carouselData = slidesForCarousel; // This holds the individual slides
        calculatedTotalItems = carouselData.length; // Total count of slides
        console.log('Carousel: carouselData set to slides assets:', carouselData);
    }
    console.log('Carousel: Calculated Total Items for Carousel:', calculatedTotalItems);


    // These functions are for the "slide" type's automatic advance and button logic.
    const goToNextItem = useCallback(() => {
        setActiveIndex((prevIndex) => {
            if (calculatedTotalItems === 0) return 0;
            const newIndex = (prevIndex + 1) % calculatedTotalItems;
            console.log('Carousel goToNextItem: Old Index:', prevIndex, 'New Index:', newIndex);
            return newIndex;
        });
    }, [calculatedTotalItems]);

    const goToPrevItem = useCallback(() => {
        setActiveIndex((prevIndex) => {
            if (calculatedTotalItems === 0) return 0;
            const newIndex = (prevIndex - 1 + calculatedTotalItems) % calculatedTotalItems;
            console.log('Carousel goToPrevItem: Old Index:', prevIndex, 'New Index:', newIndex);
            return newIndex;
        });
    }, [calculatedTotalItems]);

    // Auto-advance interval (only for 'slide' type)
    useEffect(() => {
        console.log('Carousel Interval Effect: Checking calculatedTotalItems for auto-advance:', calculatedTotalItems);
        if (contentType === "slide" && calculatedTotalItems > 1) {
            console.log('Carousel Interval Effect: Auto-advance interval set for slide type.');
            const interval = setInterval(() => {
                goToNextItem();
            }, 5000);
            return () => {
                clearInterval(interval);
                console.log('Carousel Interval Effect: Auto-advance interval cleared.');
            };
        } else {
            console.log('Carousel Interval Effect: Skipping auto-advance (not slide type or not enough items).');
        }
    }, [calculatedTotalItems, goToNextItem, contentType]);


    console.log('Carousel: Checking conditional rendering for loading/error/empty states.');
    // Conditional rendering for loading/error/empty states
    if (contentType === "movies") {
        if (loadingMovies) {
            console.log('Carousel Render: Displaying movie loading state.');
            return (
                <div className="carousel-placeholder">
                    <p>Carregando filmes para o carrossel...</p>
                </div>
            );
        }

        if (errorFetchingMovies) {
            console.log('Carousel Render: Displaying movie error state.');
            return (
                <div className="carousel-placeholder carousel-error">
                    <p>Erro ao carregar filmes para o carrossel. Por favor, tente novamente.</p>
                </div>
            );
        }

        if (calculatedTotalItems === 0) {
            console.log('Carousel Render: Displaying no movies found state.');
            return (
                <div className="carousel-placeholder">
                    <p>Nenhum filme configurado ou encontrado para o carrossel.</p>
                    {props.cqPath && <p>Caminho do componente: {props.cqPath}</p>}
                </div>
            );
        }
    } else if (contentType === "slide" && calculatedTotalItems === 0) {
        console.log('Carousel Render: Displaying no slides found state.');
        return (
            <div className="carousel-placeholder">
                <p>Nenhum slide configurado para o carrossel.</p>
                {props.cqPath && <p>Caminho do componente: {props.cqPath}</p>}
            </div>
        );
    }

    console.log('Carousel Render: Rendering main carousel content.');
    return (
        <div>
            {/* --- SLIDE CONTENT --- */}
            {contentType === "slide" && (
                <div className="carousel-container carousel--slide-type">
                    <div className="carousel-slides-wrapper">
                        {carouselData.map((item, index) => (
                            // Using the original CarouselItem for the slide type
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
                    {/* Title for the movie section */}
                    <h2 className="carousel-movie-section-title">PROGRAMAÇÃO</h2>

                    <div className="carousel-movie-list-wrapper">
                        {carouselData.map((movie, index) => (
                            <MovieDisplay key={index} movie={movie} />
                        ))}
                    </div>

                    {/* Navigation buttons for horizontal scroll.
                        Note: These buttons won't automatically scroll the list without
                        additional JavaScript logic (e.g., using useRef and scrollIntoView or scrollLeft).
                        For now, they just render and you'll need to add scroll event handlers.
                    */}
                    {calculatedTotalItems > 3 && ( // Only show buttons if there are more movies than can fit in one view
                        <>
                            <button className="carousel-control prev" aria-label="Anterior">
                                &#10094;
                            </button>
                            <button className="carousel-control next" aria-label="Próximo">
                                &#10095;
                            </button>
                            {/* Indicators are typically not used for a continuous scrollable list */}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

MapTo(RESOURCE_TYPE)(Carousel);

export default Carousel;