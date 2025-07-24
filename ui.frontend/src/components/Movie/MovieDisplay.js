import React, { useEffect, useState, useCallback } from 'react';
import { useMoviesData } from '../../hooks/useMovieData'; // Import the new hook
import './MovieDisplay.css';

// Helper to get AEM Host (kept for the poster path construction, though mostly handled by hook)
const getAemHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:4502';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
};

// Helper for age group color
const getAgeGroupColorClass = (ageGroup) => {
    switch (String(ageGroup).toUpperCase()) {
        case 'L': return 'cmp-movie__age-group-overlay--green';
        case '10': return 'cmp-movie__age-group-overlay--blue';
        case '12': return 'cmp-movie__age-group-overlay--yellow';
        case '14': return 'cmp-movie__age-group-overlay--orange';
        case '16': return 'cmp-movie__age-group-overlay--red';
        case '18': return 'cmp-movie__age-group-overlay--black';
        default: return '';
    }
};

const MovieDisplay = ({ movie, fragmentPath }) => {
    const [fetchedMovieData, setFetchedMovieData] = useState(null);
    const [loadingSingleMovie, setLoadingSingleMovie] = useState(false); // New state for single movie fetch
    const [errorSingleMovie, setErrorSingleMovie] = useState(false); // New state for single movie fetch

    const { fetchMovieByPath } = useMoviesData(); // Use the custom hook

    // Determine the movie data to display: prioritize 'movie' prop, then fetched data
    const currentMovieData = movie || fetchedMovieData;

    useEffect(() => {
        // If 'movie' prop is provided, use it directly. This means data comes from parent (Carousel).
        if (movie) {
            setLoadingSingleMovie(false);
            setErrorSingleMovie(false);
            setFetchedMovieData(null); // Clear any potentially stale fetched data
            return;
        }

        // If 'fragmentPath' is provided (and no 'movie' prop), fetch the movie details.
        // This is for standalone MovieDisplay or the new movie detail page.
        if (fragmentPath) {
            const getAndSetMovie = async () => {
                setLoadingSingleMovie(true);
                setErrorSingleMovie(false);
                const data = await fetchMovieByPath(fragmentPath);
                if (data) {
                    setFetchedMovieData(data);
                } else {
                    setErrorSingleMovie(true);
                }
                setLoadingSingleMovie(false);
            };
            getAndSetMovie();
        } else {
            // No fragmentPath and no 'movie' prop means no movie to display.
            setLoadingSingleMovie(false);
            setFetchedMovieData(null);
        }
    }, [movie, fragmentPath, fetchMovieByPath]); // Depend on relevant props and the hook function

    // Function to handle poster click and navigate
    const handlePosterClick = useCallback(() => {
        if (!currentMovieData?._path) {
            console.warn("MovieDisplay: Cannot navigate, movie _path is missing.");
            return;
        }

        // The target URL for the detail page.
        // Using the same query parameter approach.
        const targetPageBase = '/content/aem-cinema-react/us/en/home';
        const navigateTo = `http://localhost:4502/content/aem-cinema-react/us/en/home/filme-.html?wcmmode=disabled`;

        console.log("current movie data", currentMovieData)
        console.log("path:", currentMovieData._path);

        if (window.location.href.includes('/editor.html')) {
            window.location.assign(`${getAemHost()}/editor.html${navigateTo}`);
        } else {
            window.location.assign(navigateTo);
        }
    }, [currentMovieData]); // Depend on currentMovieData to ensure _path is up-to-date

    // Render loading/error/placeholder states only if data is being fetched by THIS component
    if (!movie && loadingSingleMovie) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder">
                <p>Carregando detalhes do filme...</p>
            </div>
        );
    }

    if (!movie && errorSingleMovie) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder cmp-movie__error">
                <p>Erro ao carregar os detalhes do filme. Verifique a seleção ou o caminho do Content Fragment.</p>
            </div>
        );
    }

    if (!currentMovieData) {
        // This handles cases where no movie data (from prop or fetched) is available.
        // It also ensures that if fragmentPath was provided but nothing was found, it shows a message.
        if (fragmentPath) {
            return (
                <div className="cmp-movie-card cmp-movie__placeholder">
                    <p>Configure o componente Filme: Selecione um Content Fragment 'Filme' no diálogo.</p>
                </div>
            );
        }
        return null; // Don't render anything if no data and no fragmentPath to prompt config
    }

    const { title, poster, ageGroup, gender, movieTime} = currentMovieData;
    const ageGroupColorClass = ageGroup ? getAgeGroupColorClass(ageGroup) : '';

    return (
        <div className="cmp-movie-card">
            {poster && (
                <div className="cmp-movie__poster-section" onClick={handlePosterClick} style={{ cursor: 'pointer' }}>
                    <img className="cmp-movie__poster" src={poster} alt={`${title || 'Movie'} Poster`} />
                    {ageGroup && (
                        <p className={`cmp-movie__age-group-overlay ${ageGroupColorClass}`}>
                            {ageGroup}
                        </p>
                    )}
                </div>
            )}

            <div className="cmp-movie__details-section">
                {title && <h2 className="cmp-movie__title">{title}</h2>}
                <div className="cmp-movie__meta-info">
                    {gender && <span className="cmp-movie__gender">{gender}</span>}
                    {gender && movieTime && <span className="cmp-movie__meta-separator"> • </span>}
                    {movieTime && <span className="cmp-movie__time">{movieTime}m</span>}
                </div>
            </div>
        </div>
    );
};

export default MovieDisplay;