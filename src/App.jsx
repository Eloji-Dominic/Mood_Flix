import { useEffect, useState } from "react";
import HeroImg from "/hero.png";
import Search from "./components/Search";
import './App.css';
import Spinner from "./components/Spinner";
import ErrorMessage from "./components/ErrorMessage";
import MovieCard from "./components/MovieCard";
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";


const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? trendingMovies.length - 1 : prevIndex - 1));
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === trendingMovies.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [trendingMovies.length]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm)
   , 700,
   [searchTerm]
  )

  const API_BASE_URL = "https://api.themoviedb.org/3";
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage(false);

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?&sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      const data = await response.json();

      setMovieList(data.results || []);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      if (data.response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      setErrorMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch(error){
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, [])

  return (
    <main>
      {/* <div className="pattern" /> */}
      <div>
        <h2 className="mt-[20px] sm:mx-auto mb-[20px]">Trending Movies</h2>

        {trendingMovies.length > 0 && (
          <div className="slider-container movie-card">
            <div className="photos-container">
              {trendingMovies.map((movie, index) => {
                return (
                  <div
                    className={`photo-item ${
                      index === currentIndex ? "active" : ""
                    }`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      opacity: index === currentIndex ? 1 : 0,
                      transition: "opacity 1s ease-in-out",
                    }}
                    key={movie.$id}
                  >
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                );
              })}
            </div>
            {/* <button className="prev-btn" onClick={handlePrev}>
              &lt;
            </button>
            <button className="next-btn" onClick={handleNext}>
              &gt;
            </button> */}
          </div>
        )}
      </div>

      <div className="wrapper">
        <header>
          {/* <img src={HeroImg} alt="Hero banner" /> */}
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies">
          {/* Movie listings will go here */}
          <h2 className="mt-[40px] mb-[40px]">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <ErrorMessage fetchMovies={fetchMovies} />
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
