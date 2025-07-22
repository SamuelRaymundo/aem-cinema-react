// components/MovieDisplay/MovieDisplay.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MovieDisplay.css';

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

// MovieDisplay now accepts a 'movie' prop (for data already fetched by parent)
// or 'fragmentPath' (for standalone fetching).
const MovieDisplay = ({ movie, fragmentPath, cqPath }) => {
    const [fetchedMovieData, setFetchedMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Prioritize the 'movie' prop if it's provided, otherwise use fetched data
    const currentMovieData = movie || fetchedMovieData;

    useEffect(() => {
        // If a 'movie' prop is provided, we don't need to fetch.
        // This is the case when Carousel passes pre-fetched movie data.
        if (movie) {
            setLoading(false);
            setFetchedMovieData(null); // Clear any previous fetched state if now using prop
            return;
        }

        // Only proceed with fetching if fragmentPath is provided AND no 'movie' prop is present
        if (fragmentPath) {
            const fetchMovieFragment = async () => {
                setLoading(true);
                setError(false);
                setFetchedMovieData(null);

                try {
                    const graphqlEndpoint = `${getAemHost()}/content/cq:graphql/aem-cinema-react/endpoint.json`;
                    // Adjust query based on your actual AEM GraphQL schema.
                    // This assumes 'filmeByPath' directly returns the item, not wrapped in 'item'.
                    // If it's wrapped, adjust 'fetchedData' access below.
                    const query = `
                        query GetFilmeByPath($path: String!) {
                          filmeByPath(_path: $path) {
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
                    // Alternative if 'filmeList' with filter is your only option for single item:
                    /*
                    const query = `
                        query GetFilmeList($path: String!) {
                            filmeList(filter: {_path: {EQ: $path}}) {
                                items {
                                    title
                                    poster { ... on ImageRef { _path mimeType } }
                                    ageGroup
                                    gender
                                    movieTime
                                    synopsis { json }
                                }
                            }
                        }
                    `;
                    */

                    const response = await axios.post(graphqlEndpoint, {
                        query: query,
                        variables: {
                            path: fragmentPath
                        }
                    }, {
                        withCredentials: true
                    });

                    let fetchedData = null;
                    // Adjust access based on your actual GraphQL response structure
                    if (response.data?.data?.filmeByPath) { // For 'filmeByPath' directly
                        fetchedData = response.data.data.filmeByPath;
                    }
                    // For 'filmeList' with filter:
                    // if (response.data?.data?.filmeList?.items?.length > 0) {
                    //    fetchedData = response.data.data.filmeList.items[0];
                    // }


                    if (fetchedData) {
                        setFetchedMovieData({
                            title: fetchedData.title,
                            poster: fetchedData.poster ? `${getAemHost()}${fetchedData.poster._path}` : '',
                            ageGroup: fetchedData.ageGroup,
                            gender: fetchedData.gender,
                            movieTime: fetchedData.movieTime,
                            synopsis: fetchedData.synopsis?.json?.html || '' // Access rich text HTML
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
        } else {
            // No fragmentPath and no 'movie' prop, so nothing to do.
            setLoading(false);
            setFetchedMovieData(null);
        }
    }, [fragmentPath, movie]); // Depend on fragmentPath or 'movie' prop changing

    // Render loading/error/placeholder states only if data is being fetched (i.e., no 'movie' prop)
    // If 'movie' prop is present, these states are irrelevant as data is already available.
    if (!movie && loading) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder">
                <p>Carregando detalhes do filme...</p>
            </div>
        );
    }

    if (!movie && error) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder cmp-movie__error">
                <p>Erro ao carregar os detalhes do filme. Verifique a seleção do Content Fragment.</p>
            </div>
        );
    }

    // This condition handles cases where no movie data (either from prop or fetched) is available.
    // Also covers the initial state if neither `movie` nor `fragmentPath` are provided.
    const hasContent = currentMovieData && (currentMovieData.title || currentMovieData.poster || currentMovieData.gender || currentMovieData.movieTime || currentMovieData.ageGroup || currentMovieData.synopsis);

    if (!hasContent) {
        // This message is primarily for authoring mode when fragmentPath is expected
        // but nothing is configured, or for standalone MovieDisplay with no movie prop.
        if (fragmentPath) { // Only show this if we expected a fragment
            return (
                <div className="cmp-movie-card cmp-movie__placeholder">
                    <p>Configure o componente Filme: Selecione um Content Fragment 'Filme' no diálogo.</p>
                </div>
            );
        }
        return null; // Don't render anything if no data and no fragmentPath to prompt config
    }

    const { title, poster, ageGroup, gender, movieTime, synopsis } = currentMovieData;
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