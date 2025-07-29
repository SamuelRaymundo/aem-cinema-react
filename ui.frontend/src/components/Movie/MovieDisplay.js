import React, { useEffect, useState, useCallback } from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';
import axios from 'axios';
import './MovieDisplay.css';

const getAemHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:4502';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
};

const graphqlEndpoint = `${getAemHost()}/content/cq:graphql/aem-cinema-react/endpoint.json`;

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

const GET_FILME_LIST_FULL_QUERY = `
    query GetFilmeListFull($gender: String) {
        filmeList(filter: { gender: { _expressions: [{ value: $gender }] } }) { 
            items {
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


const formatTitleForUrl = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};


const MOVIE_DETAIL_PAGE_PATH = '/content/aem-cinema-react/us/en/home/filme.html';
const MOVIE_LIST_PAGE_PATH = '/content/aem-cinema-react/us/en/home/programacao.html';

const MovieDisplay = ({ movie, fragmentPath }) => {
    const [fetchedMovieData, setFetchedMovieData] = useState(null);
    const [movieList, setMovieList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const [selectedGender, setSelectedGender] = useState(null);

    const currentMovieData = movie || fetchedMovieData;

    const isDetailPage = typeof window !== 'undefined' &&
        window.location.pathname === MOVIE_DETAIL_PAGE_PATH &&
        new URLSearchParams(window.location.search).has('slug');

    const isMovieListPage = typeof window !== 'undefined' &&
        window.location.pathname === MOVIE_LIST_PAGE_PATH;


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

        if (isMovieListPage) {
            console.log("MovieDisplay Debug: Movie List Page detected. Fetching movies with filter.");
            const fetchMovieList = async () => {
                setLoading(true);
                setError(false);
                setMovieList([]);
                setFetchedMovieData(null);
                try {
                    const variables = {};
                    if (selectedGender) {
                        variables.gender = selectedGender;
                    }

                    const response = await axios.post(graphqlEndpoint, {
                        query: GET_FILME_LIST_FULL_QUERY,
                        variables: variables
                    }, { withCredentials: true });

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
                    } else {
                        setError(true);
                        console.error("MovieDisplay Debug: Failed to fetch movie list or 'items' is empty/null.", response.data);
                    }
                } catch (err) {
                    setError(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchMovieList();
            return;
        }

        let targetFragmentSlug = null;
        if (isDetailPage) {
            targetFragmentSlug = new URLSearchParams(window.location.search).get('slug');
            if (!targetFragmentSlug) {
                setLoading(false);
                setFetchedMovieData(null);
                return;
            }
        } else if (fragmentPath) {
            const pathParts = fragmentPath.split('/');
            targetFragmentSlug = pathParts[pathParts.length - 1];
        }

        if (targetFragmentSlug) {
            const cfNameFromSlug = formatTitleForUrl(targetFragmentSlug);
            const targetFragmentPath = `/content/dam/aem-cinema-react/movies-/${cfNameFromSlug}`;
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
                    query = GET_FILME_BY_PATH_NO_SINOPSE_QUERY;
                }

                try {

                    const response = await axios.post(graphqlEndpoint, {
                        query: query,
                        variables: { path: targetFragmentPath }
                    }, { withCredentials: true });


                    if (response.data?.data?.filmeByPath?.item) {
                        const processedData = dataProcessor(response.data.data.filmeByPath.item);
                        setFetchedMovieData(processedData);
                    } else {
                        setError(true);
                    }
                } catch (err) {
                    setError(true);
                } finally {
                    setLoading(false);

                }
            };
            fetchMovieData();
        } else if (!isMovieListPage && !movie) {
            setLoading(false);
            setFetchedMovieData(null);
        }
    }, [movie, fragmentPath, isDetailPage, isMovieListPage, selectedGender]);

    const handlePosterClick = useCallback((clickedMovie) => {
        const movieToNavigate = clickedMovie || currentMovieData;

        const formattedTitle = formatTitleForUrl(movieToNavigate.title);
        const navigateTo = `${getAemHost()}${MOVIE_DETAIL_PAGE_PATH}?slug=${formattedTitle}`;

        if (window.location.href.includes('/editor.html')) {
            window.location.assign(`${getAemHost()}/editor.html${MOVIE_DETAIL_PAGE_PATH}?slug=${formattedTitle}&wcmmode=disabled`);
        } else {
            window.location.assign(`${navigateTo}&wcmmode=disabled`);
        }
    }, [currentMovieData, isDetailPage]);

    const handleGenderChange = useCallback((event) => {
        const newGender = event.target.value;
        setSelectedGender(newGender === "" ? null : newGender);
    }, []);


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
                <p>Erro ao carregar os detalhes do filme. Verifique a seleção ou o caminho do Content Fragment.</p>
            </div>
        );
    }

    if (!currentMovieData && !movieList.length && !isDetailPage && !isMovieListPage && fragmentPath) {
        return (
            <div className="cmp-movie-card cmp-movie__placeholder">
                <p>Configure o componente Filme: Selecione um Content Fragment 'Filme' no diálogo.</p>
            </div>
        );
    }

    if (isMovieListPage) {

        const availableGenders = [ "Aventura", "Comedia", "Drama","Terror", "Animacao"];

        if (movieList.length === 0 && !loading) {
            console.log("MovieDisplay Debug: Rendering: Movie list page, but no movies found for current filter.");
            return (
                <div className="cmp-movie-list-container cmp-movie__placeholder">
                    <h1>Programação de Filmes</h1>
                    <div className="cmp-movie-filter-controls">
                        <label htmlFor="gender-filter">Filtrar por Gênero:</label>
                        <select id="gender-filter" onChange={handleGenderChange} value={selectedGender || ""}>
                            <option value="">Todos os Gêneros</option>
                            {availableGenders.map(gender => (
                                <option key={gender} value={gender}>{gender}</option>
                            ))}
                        </select>
                    </div>
                    <p>Nenhum filme disponível para o filtro selecionado.</p>
                </div>
            );
        }
        return (
            <div className="cmp-movie-list-container">
                <h1 className>Programação de Filmes</h1>
                <div className="cmp-movie-filter-controls">
                    <label htmlFor="gender-filter">Filtrar por Gênero:</label>
                    <select id="gender-filter" onChange={handleGenderChange} value={selectedGender || ""}>
                        <option value="">Todos os Gêneros</option>
                        {availableGenders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                        ))}
                    </select>
                </div>
                <div className="cmp-movie-list">
                    {movieList.map((movieItem) => {
                        const ageGroupColorClass = movieItem.ageGroup ? getAgeGroupColorClass(movieItem.ageGroup) : '';
                        return (
                            <div className="cmp-movie-card" key={movieItem._path} onClick={() => handlePosterClick(movieItem)}>

                                <div className="cmp-movie__poster-title-block">
                                    {movieItem.poster && (
                                        <div className="cmp-movie__poster-section">
                                            <img className="cmp-movie__poster" src={movieItem.poster} alt={`${movieItem.title || 'Movie'} Poster`} />

                                            {movieItem.ageGroup && (
                                                <p className={`cmp-movie__age-group-overlay ${ageGroupColorClass}`}>
                                                    {movieItem.ageGroup}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>


                                <div className="cmp-movie__sinopse-meta-block">
                                    <h2 className="cmp-movie__title">
                                        {movieItem.title}
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

    if (!currentMovieData) {
        if (isDetailPage) {
            return (
                <div className="cmp-movie-card cmp-movie__placeholder cmp-movie__error">
                    <p>Filme não encontrado para o ID fornecido na URL.</p>
                </div>
            );
        }
        return null;
    }

    const { title, poster, ageGroup, gender, movieTime, sinopse } = currentMovieData;
    const ageGroupColorClass = ageGroup ? getAgeGroupColorClass(ageGroup) : '';

    return (
        <div className={`cmp-movie-card ${isDetailPage ? 'cmp-movie-card--detail-page' : ''}`}>
            {poster && (
                <div className="cmp-movie__poster-section" onClick={() => handlePosterClick(currentMovieData)} style={{ cursor: isDetailPage ? 'default' : 'pointer' }}>
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

const MOVIE_RESOURCE_TYPE = 'aem-cinema-react/components/movie';
MapTo(MOVIE_RESOURCE_TYPE)(MovieDisplay);

export default MovieDisplay;