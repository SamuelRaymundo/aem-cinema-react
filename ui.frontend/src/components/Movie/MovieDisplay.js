import React, { useEffect, useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import axios from 'axios';
import './MovieDisplay.css';

// Helper to get AEM Host (for constructing absolute URLs)
const getAemHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:4502';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
};

// GraphQL endpoint for your AEM project
const graphqlEndpoint = `${getAemHost()}/content/cq:graphql/aem-cinema-react/endpoint.json`;

// GraphQL Query para detalhes completos do filme (inclui sinopse)
const GET_FILME_BY_PATH_FULL_QUERY = `
   query GetFilmeByPathFull($path: String!) {
          filmeByPath(_path: $path) {
            item{
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
              sinopse {
                html
                markdown
                plaintext
                json
              }
            }
          }
        }
`;

// GraphQL Query para detalhes do filme SEM a sinopse (para listagens)
const GET_FILME_BY_PATH_NO_SINOPSE_QUERY = `
   query GetFilmeByPathNoSinopse($path: String!) {
          filmeByPath(_path: $path) {
            item{
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

// GraphQL Query para obter a lista completa de filmes (com sinopse, se necessário)
const GET_FILME_LIST_FULL_QUERY = `
    query GetFilmeListFull {
        filmeList{
            items{
              _path
              title
              poster{
                ... on ImageRef {
                  _path
                  mimeType
                }
              }
              gender
              ageGroup
              movieTime
              sinopse {
                html
                markdown
                plaintext
                json
              }
            }
        }
    }
`;

// Helper for age group color styling
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

// Function to format the movie title into a URL-friendly slug
const formatTitleForUrl = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except alphanumeric, space, hyphen
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/-+/g, '-');       // Remove multiple hyphens
};

// Base path for your generic movie detail page. This is the ACTUAL AEM page path.
const MOVIE_DETAIL_PAGE_PATH = '/content/aem-cinema-react/us/en/home/filme.html';
const MOVIE_LIST_PAGE_PATH = '/content/aem-cinema-react/us/en/home/programacao.html';

const MovieDisplay = ({ movie, fragmentPath }) => {
    const [fetchedMovieData, setFetchedMovieData] = useState(null); // For single movie fetch (detail/standalone)
    const [movieList, setMovieList] = useState([]); // For list of movies on programacao page
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const currentMovieData = movie || fetchedMovieData;

    const isDetailPage = typeof window !== 'undefined' &&
        window.location.pathname === MOVIE_DETAIL_PAGE_PATH &&
        new URLSearchParams(window.location.search).has('slug');

    const isMovieListPage = typeof window !== 'undefined' &&
        window.location.pathname === MOVIE_LIST_PAGE_PATH;

    useEffect(() => {
        console.log("MovieDisplay Debug: --- COMPONENT MOUNT/UPDATE ---");
        console.log(`MovieDisplay Debug: Current URL: ${window.location.pathname}${window.location.search}`);
        console.log(`MovieDisplay Debug: isDetailPage detected as: ${isDetailPage}`);
        console.log(`MovieDisplay Debug: isMovieListPage detected as: ${isMovieListPage}`);
        console.log(`MovieDisplay Debug: 'movie' prop received (from Carousel/List):`, movie);
        console.log(`MovieDisplay Debug: 'fragmentPath' prop received (from AEM dialog):`, fragmentPath);
        console.log("MovieDisplay Debug: -----------------------------");
    }, [isDetailPage, isMovieListPage, movie, fragmentPath]);

    useEffect(() => {
        console.log("MovieDisplay Debug: Entering data fetching useEffect.");

        if (movie && !isMovieListPage) {
            console.log("MovieDisplay Debug: Using 'movie' prop data (from list/carousel). No new fetch needed.");
            setLoading(false);
            setError(false);
            setFetchedMovieData(null);
            setMovieList([]);
            return;
        }

        // --- Logic for Movie List Page ---
        if (isMovieListPage) {
            console.log("MovieDisplay Debug: Movie List Page detected. Fetching all movies.");
            const fetchMovieList = async () => {
                setLoading(true);
                setError(false);
                setMovieList([]);
                setFetchedMovieData(null);

                try {
                    console.log(`MovieDisplay Debug: Sending GraphQL query for list to ${graphqlEndpoint}`);
                    const response = await axios.post(graphqlEndpoint, {
                        query: GET_FILME_LIST_FULL_QUERY
                    }, { withCredentials: true });

                    console.log("MovieDisplay Debug: GraphQL List Response received:", response.data);

                    if (response.data?.data?.filmeList?.items) {
                        const processedList = response.data.data.filmeList.items.map(item => ({
                            ...item,
                            poster: item.poster ? `${getAemHost()}${item.poster._path}` : '',
                            sinopse: item.sinopse ? {
                                ...item.sinopse,
                                html: item.sinopse.html ? item.sinopse.html.replace(/src="\/content/g, `src="${getAemHost()}/content`) : ''
                            } : null
                        }));
                        setMovieList(processedList);
                        console.log("MovieDisplay Debug: Movie list successfully processed and set:", processedList);
                    } else {
                        setError(true);
                        console.error("MovieDisplay Debug: Failed to fetch movie list or 'items' is empty/null.", response.data);
                        if (response.data?.errors) {
                            console.error("MovieDisplay Debug: GraphQL Errors array:", response.data.errors);
                        }
                    }
                } catch (err) {
                    setError(true);
                    console.error("MovieDisplay Debug: Error fetching movie list via Axios:", err);
                } finally {
                    setLoading(false);
                    console.log("MovieDisplay Debug: Movie list fetching completed. Loading state set to false.");
                }
            };
            fetchMovieList();
            return;
        }

        // --- Logic for Detail Page or Standalone Component ---
        let targetFragmentSlug = null;
        if (isDetailPage) {
            targetFragmentSlug = new URLSearchParams(window.location.search).get('slug');
            console.log(`MovieDisplay Debug: Detail page detected. Slug from URL: '${targetFragmentSlug}'`);
            if (!targetFragmentSlug) {
                console.warn("MovieDisplay Debug: 'slug' query parameter not found on detail page despite being classified as detail page.");
                setLoading(false);
                setFetchedMovieData(null);
                return;
            }
        } else if (fragmentPath) {
            const pathParts = fragmentPath.split('/');
            targetFragmentSlug = pathParts[pathParts.length - 1];
            console.log(`MovieDisplay Debug: Using 'fragmentPath' prop for standalone display. Original: '${fragmentPath}', Extracted slug: '${targetFragmentSlug}'`);
        }

        if (targetFragmentSlug) {
            const cfNameFromSlug = formatTitleForUrl(targetFragmentSlug);
            const targetFragmentPath = `/content/dam/aem-cinema-react/movies-/${cfNameFromSlug}`;
            console.log(`MovieDisplay Debug: Constructed Content Fragment path for GraphQL: '${targetFragmentPath}'`);

            const fetchMovieData = async () => {
                setLoading(true);
                setError(false);
                setFetchedMovieData(null);
                setMovieList([]);
                let query;
                let dataProcessor = (item) => ({
                    ...item,
                    poster: item.poster ? `${getAemHost()}${item.poster._path}` : ''
                });

                if (isDetailPage) {
                    console.log("MovieDisplay Debug: Fetching FULL movie details (from slug) for detail page.");
                    query = GET_FILME_BY_PATH_FULL_QUERY;
                    dataProcessor = (item) => ({
                        ...item,
                        poster: item.poster ? `${getAemHost()}${item.poster._path}` : '',
                        sinopse: item.sinopse ? {
                            ...item.sinopse,
                            html: item.sinopse.html ? item.sinopse.html.replace(/src="\/content/g, `src="${getAemHost()}/content`) : ''
                        } : null
                    });
                } else {
                    console.log("MovieDisplay Debug: Fetching movie details WITHOUT sinopse (from fragmentPath prop) for standalone card.");
                    query = GET_FILME_BY_PATH_NO_SINOPSE_QUERY;
                }

                try {
                    console.log(`MovieDisplay Debug: Sending GraphQL query to ${graphqlEndpoint}`);
                    console.log("MovieDisplay Debug: Query variables:", { path: targetFragmentPath });

                    const response = await axios.post(graphqlEndpoint, {
                        query: query,
                        variables: { path: targetFragmentPath }
                    }, { withCredentials: true });

                    console.log("MovieDisplay Debug: GraphQL Response received:", response.data);

                    if (response.data?.data?.filmeByPath?.item) {
                        const processedData = dataProcessor(response.data.data.filmeByPath.item);
                        setFetchedMovieData(processedData);
                        console.log("MovieDisplay Debug: Movie data successfully processed and set:", processedData);
                    } else {
                        setError(true);
                        console.error("MovieDisplay Debug: Failed to fetch Content Fragment data or 'item' is empty/null.", response.data);
                        if (response.data?.errors) {
                            console.error("MovieDisplay Debug: GraphQL Errors array:", response.data.errors);
                        }
                    }
                } catch (err) {
                    setError(true);
                    console.error("MovieDisplay Debug: Error fetching Content Fragment via Axios:", err);
                    if (err.response) {
                        console.error("MovieDisplay Debug: Axios response error status:", err.response.status);
                        console.error("MovieDisplay Debug: Axios response error data:", err.response.data);
                    } else if (err.request) {
                        console.error("MovieDisplay Debug: Axios no response received. Request:", err.request);
                    } else {
                        console.error("MovieDisplay Debug: Axios request setup error:", err.message);
                    }
                } finally {
                    setLoading(false);
                    console.log("MovieDisplay Debug: Fetching completed. Loading state set to false.");
                }
            };
            fetchMovieData();
        } else if (!isMovieListPage && !movie) {
            console.log("MovieDisplay Debug: No valid source for movie data found (neither prop, nor URL slug, nor fragmentPath prop, nor list page). Not fetching single movie.");
            setLoading(false);
            setFetchedMovieData(null);
        }
    }, [movie, fragmentPath, isDetailPage, isMovieListPage]);

    const handlePosterClick = useCallback((clickedMovie) => {
        const movieToNavigate = clickedMovie || currentMovieData;

        if (!movieToNavigate?._path || !movieToNavigate?.title || isDetailPage) {
            if (isDetailPage) {
                console.log("MovieDisplay Debug: handlePosterClick: Already on detail page, not navigating.");
            } else {
                console.warn("MovieDisplay Debug: handlePosterClick: Cannot navigate, movie _path or title is missing.");
            }
            return;
        }

        const formattedTitle = formatTitleForUrl(movieToNavigate.title);
        const navigateTo = `${getAemHost()}${MOVIE_DETAIL_PAGE_PATH}?slug=${formattedTitle}`;

        console.log("MovieDisplay Debug: handlePosterClick: Navigating to movie detail page:", navigateTo);

        if (window.location.href.includes('/editor.html')) {
            window.location.assign(`${getAemHost()}/editor.html${MOVIE_DETAIL_PAGE_PATH}?slug=${formattedTitle}&wcmmode=disabled`);
        } else {
            window.location.assign(`${navigateTo}&wcmmode=disabled`);
        }
    }, [currentMovieData, isDetailPage]);

    if (loading) {
        console.log("MovieDisplay Debug: Rendering: Loading state.");
        return (
            <div className="cmp-movie-card cmp-movie__placeholder">
                <p>Carregando detalhes do filme...</p>
            </div>
        );
    }

    if (error) {
        console.log("MovieDisplay Debug: Rendering: Error state.");
        return (
            <div className="cmp-movie-card cmp-movie__placeholder cmp-movie__error">
                <p>Erro ao carregar os detalhes do filme. Verifique a seleção ou o caminho do Content Fragment.</p>
            </div>
        );
    }

    if (!currentMovieData && !movieList.length && !isDetailPage && !isMovieListPage && fragmentPath) {
        console.log("MovieDisplay Debug: Rendering: Configuration prompt (no data, but fragmentPath provided).");
        return (
            <div className="cmp-movie-card cmp-movie__placeholder">
                <p>Configure o componente Filme: Selecione um Content Fragment 'Filme' no diálogo.</p>
            </div>
        );
    }

    // Render logic for the Movie List Page
    if (isMovieListPage) {
        if (movieList.length === 0) {
            console.log("MovieDisplay Debug: Rendering: Movie list page, but no movies found.");
            return (
                <div className="cmp-movie-list-container cmp-movie__placeholder">
                    <p>Nenhum filme disponível no momento.</p>
                </div>
            );
        }
        console.log("MovieDisplay Debug: Rendering: Movie list page with movies.");
        return (
            <div className="cmp-movie-list-container">
                <h1>Programação de Filmes</h1>
                <div className="cmp-movie-list">
                    {movieList.map((movieItem) => {
                        const ageGroupColorClass = movieItem.ageGroup ? getAgeGroupColorClass(movieItem.ageGroup) : '';
                        return (
                            <div className="cmp-movie-card" key={movieItem._path} onClick={() => handlePosterClick(movieItem)}>
                                {/* New wrapper for poster and title/age group block */}
                                <div className="cmp-movie__poster-title-block">
                                    {movieItem.poster && (
                                        <div className="cmp-movie__poster-section">
                                            <img className="cmp-movie__poster" src={movieItem.poster} alt={`${movieItem.title || 'Movie'} Poster`} />
                                            {/* Age group overlay remains on poster for list view */}
                                            {movieItem.ageGroup && (
                                                <p className={`cmp-movie__age-group-overlay ${ageGroupColorClass}`}>
                                                    {movieItem.ageGroup}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* New wrapper for meta-info and sinopse block */}
                                <div className="cmp-movie__sinopse-meta-block">
                                    <h2 className="cmp-movie__title">
                                        {movieItem.title}
                                        {/* Age group badge next to title if desired, currently overlayed */}
                                    </h2>
                                    <div className="cmp-movie__meta-info">
                                        {movieItem.gender && <span className="cmp-movie__gender">{movieItem.gender}</span>}
                                        {movieItem.gender && movieItem.movieTime && <span className="cmp-movie__meta-separator"> • </span>}
                                        {movieItem.movieTime && <span className="cmp-movie__time">{movieItem.movieTime}m</span>}
                                    </div>
                                    {movieItem.sinopse && movieItem.sinopse.html && (
                                        <div
                                            className="cmp-movie__sinopse"
                                            dangerouslySetInnerHTML={{ __html: movieItem.sinopse.html }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Don't render anything if no data is available and no configuration prompt is applicable
    if (!currentMovieData) {
        console.log("MovieDisplay Debug: Rendering: No data available to render (single movie context).");
        if (isDetailPage) {
            console.log("MovieDisplay Debug: Rendering: Detail page, but movie not found for slug.");
            return (
                <div className="cmp-movie-card cmp-movie__placeholder cmp-movie__error">
                    <p>Filme não encontrado para o ID fornecido na URL.</p>
                </div>
            );
        }
        return null;
    }

    // Log the sinopse content just before rendering (final check)
    console.log("MovieDisplay Debug: currentMovieData (at final render):", currentMovieData);
    console.log("MovieDisplay Debug: isDetailPage (at final render):", isDetailPage);


    // Destructure movie data for rendering a single movie
    const { title, poster, ageGroup, gender, movieTime, sinopse } = currentMovieData;
    const ageGroupColorClass = ageGroup ? getAgeGroupColorClass(ageGroup) : '';

    console.log(`MovieDisplay Debug: Rendering: Single movie found - ${title}`);

    return (
        <div className={`cmp-movie-card ${isDetailPage ? 'cmp-movie-card--detail-page' : ''}`}>
            {poster && (
                <div className="cmp-movie__poster-section" onClick={() => handlePosterClick(currentMovieData)} style={{ cursor: isDetailPage ? 'default' : 'pointer' }}>
                    <img className="cmp-movie__poster" src={poster} alt={`${title || 'Movie'} Poster`} />
                    {/* Age group remains as an overlay for non-list views */}
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
                    {isDetailPage && <h4>Sinopse</h4>}
                </div>
                {isDetailPage && sinopse && sinopse.html && (
                    <div
                        className="cmp-movie__sinopse"
                        dangerouslySetInnerHTML={{ __html: sinopse.html }}
                    />
                )}
            </div>
        </div>
    );
};

// Map the React component to the AEM component's sling:resourceType
const MOVIE_RESOURCE_TYPE = 'aem-cinema-react/components/movie';
MapTo(MOVIE_RESOURCE_TYPE)(MovieDisplay);

export default MovieDisplay;