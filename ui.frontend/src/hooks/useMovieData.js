import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const getAemHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:4502';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
};

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

const GET_FILME_BY_PATH_QUERY = `
   query GetFilmeByPath($path: String!) {
          filmeByPath(_path: $path) {
            item{
              _path
              title
              poster{
                ... on ImageRef{
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

// Custom Hook for fetching movie data
export const useMoviesData = () => {
    const [moviesList, setMoviesList] = useState([]);
    const [moviesListLoading, setMoviesListLoading] = useState(false);
    const [moviesListError, setMoviesListError] = useState(false);

    // Function to fetch the list of movies
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
                console.error("useMoviesData: No movie items found or unexpected GraphQL response for list.", response.data);
            }
        } catch (err) {
            setMoviesListError(true);
            console.error("useMoviesData: Error fetching movie list:", err);
        } finally {
            setMoviesListLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    // Function to fetch a single movie by path
    const fetchMovieByPath = useCallback(async (path) => {
        if (!path) return null; // Don't fetch if no path is provided

        try {
            const response = await axios.post(graphqlEndpoint, {
                query: GET_FILME_BY_PATH_QUERY,
                variables: { path: path }
            }, { withCredentials: true });

            if (response.data?.data?.filmeByPath) {
                const data = response.data.data.filmeByPath;
                return {
                    ...data,
                    poster: data.poster ? `${getAemHost()}${data.poster._path}` : ''
                };
            } else {
                console.error("useMoviesData: Failed to fetch Content Fragment data by path or data is empty.", response.data);
                return null;
            }
        } catch (err) {
            console.error("useMoviesData: Error fetching Content Fragment by path:", err);
            return null;
        }
    }, []); // Empty dependency array means this function is created once

    return {
        moviesList,
        moviesListLoading,
        moviesListError,
        fetchMoviesList, // Function to trigger list fetch
        fetchMovieByPath // Function to fetch a single movie
    };
};