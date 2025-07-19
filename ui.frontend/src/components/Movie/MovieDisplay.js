// components/MovieDisplay/MovieDisplay.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MovieDisplay.css'; // Crie este CSS ou use seu Movie.css existente

const getAemHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:4502';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
};

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

const MovieDisplay = ({ fragmentPath, cqPath }) => { // Remova 'MapTo' daqui se ele for apenas um sub-componente
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!fragmentPath) {
            console.warn("MovieDisplay: No Content Fragment path provided.");
            setLoading(false);
            setMovieData(null);
            return;
        }

        const fetchMovieFragment = async () => {
            setLoading(true);
            setError(false);
            setMovieData(null);

            try {
                const graphqlEndpoint = `${getAemHost()}/content/cq:graphql/aem-cinema-react/endpoint.json`;
                // Certifique-se de que a query está correta e corresponde ao seu modelo de CF
                const query = `
                    query GetFilmeByPath($path: String!) {
                        filmeByPath(_path: $path) {
                            item {
                                title
                                poster {
                                    _path
                                }
                                ageGroup
                                gender
                                movieTime
                                synopsis {
                                    html
                                }
                            }
                        }
                    }
                `;

                const response = await axios.post(graphqlEndpoint, {
                    query: query,
                    variables: {
                        path: fragmentPath
                    }
                }, {
                    withCredentials: true
                });

                if (response.data && response.data.data && response.data.data.filmeByPath && response.data.data.filmeByPath.item) {
                    const fetchedData = response.data.data.filmeByPath.item;
                    setMovieData({
                        title: fetchedData.title,
                        poster: fetchedData.poster ? `${getAemHost()}${fetchedData.poster._path}` : '',
                        ageGroup: fetchedData.ageGroup,
                        gender: fetchedData.gender,
                        movieTime: fetchedData.movieTime,
                        synopsis: fetchedData.synopsis ? fetchedData.synopsis.html : ''
                    });
                } else {
                    setError(true);
                    console.error("MovieDisplay: Failed to fetch Content Fragment data or data is empty.", response.data);
                }
            } catch (err) {
                console.error("MovieDisplay: Error fetching Content Fragment:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieFragment();
    }, [fragmentPath]); // Dependência: fragmentPath

    if (!cqPath && !fragmentPath) {
        return null; // ou um placeholder se preferir
    }

    if (loading) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder">
                <p>Carregando detalhes do filme...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder cmp-movie__error">
                <p>Erro ao carregar os detalhes do filme. Verifique a seleção do Content Fragment.</p>
            </div>
        );
    }

    const hasContent = movieData && (movieData.title || movieData.poster || movieData.gender || movieData.movieTime || movieData.ageGroup);

    if (!hasContent) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder">
                <p>Configure o componente Filme: Selecione um Content Fragment 'Filme' no diálogo.</p>
            </div>
        );
    }

    const { title, poster, ageGroup, gender, movieTime, synopsis } = movieData;
    const ageGroupColorClass = ageGroup ? getAgeGroupColorClass(ageGroup) : '';

    return (
        <div className="cmp-movie-card">
            {poster && (
                <div className="cmp-movie__poster-section">
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
                {synopsis && <div className="cmp-movie__synopsis" dangerouslySetInnerHTML={{ __html: synopsis }} />}
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