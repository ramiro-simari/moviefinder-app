const movieInput = document.getElementById("movieInput");
const searchBtn = document.getElementById("searchBtn");
const moviesContainer = document.getElementById("moviesContainer");
const loading = document.getElementById("loading");
const featuredTitle = document.getElementById("featuredTitle");
const resultsInfo = document.getElementById("resultsInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const filterButtons = document.querySelectorAll(".filter-btn");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const heroButton = document.getElementById("heroButton");


const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const API_KEY = "2a6f5482";
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

let debounceTimer;
let currentPage = 1;
let currentQuery = "";

/* EVENTS */

window.addEventListener("DOMContentLoaded", () => {
    loadInitialMovies();
});

searchBtn.addEventListener("click", searchMovies);

closeModal.addEventListener("click", () => {
    movieModal.classList.add("hidden");
});

movieModal.addEventListener("click", (e) => {
    if (e.target === movieModal) {
        movieModal.classList.add("hidden");
    }
});

movieInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchMovies();
    }
});

movieInput.addEventListener("input", () => {

    clearTimeout(debounceTimer);

    const query = movieInput.value.trim();

    if (query.length === 0) {

        resultsInfo.textContent = "";

        loadInitialMovies();
        return;
    }

    debounceTimer = setTimeout(() => {

        if (query.length >= 3) {

            currentPage = 1;
            searchMovies();
        }

    }, 500);
});

prevBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        searchMovies();
    }

});

nextBtn.addEventListener("click", () => {

    currentPage++;

    searchMovies();

});

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        movieInput.value =
            button.dataset.search;

        currentPage = 1;

        searchMovies();
    });

});

/* INITIAL MOVIES */

async function loadInitialMovies() {

    const defaultSearches = [
        "batman",
        "star wars",
        "harry potter",
        "avengers",
        "matrix",
        "jurassic park",
        "spiderman",
        "lord of the rings",
        "transformers",
        "pirates of the caribbean"
    ];

    const randomSearch =
        defaultSearches[
            Math.floor(
                Math.random() *
                defaultSearches.length
            )
        ];

    try {

        const response =
            await fetch(
                `${API_URL}&s=${randomSearch}`
            );

        const data =
            await response.json();

        renderMovies(data.Search || []);

        featuredTitle.textContent =
            "Featured Collection";

        resultsInfo.textContent =
            randomSearch.toUpperCase();

        pageInfo.textContent = "";

    } catch (error) {

        console.error(error);

        showError(
            "Error loading movies."
        );
    }
}

/* SEARCH MOVIES */

async function searchMovies() {

    const query = movieInput.value.trim();

    if (!query) return;

    currentQuery = query;

    showLoading();
    showSkeletons();

    try {

        const response =
            await fetch(
                `${API_URL}&s=${query}&page=${currentPage}`
            );

        const data =
            await response.json();

        if (!data.Search) {

            showError(
                `No movies found for "${query}"`
            );

            return;
        }

        featuredTitle.textContent =
            "Search Results";

        resultsInfo.textContent =
            `${data.totalResults} results for "${query}"`;

        renderMovies(data.Search);

        updatePagination(
            Number(data.totalResults)
        );

    } catch (error) {

        console.error(error);

        showError(
            "Error loading movies."
        );

    } finally {

        hideLoading();
    }
}

/* SKELETON LOADING */

function showSkeletons() {

    moviesContainer.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        moviesContainer.innerHTML += `
            <div class="skeleton-card"></div>
        `;
    }
}

/* RENDER MOVIES */

function renderMovies(movies) {

    moviesContainer.innerHTML = "";

    movies.forEach(movie => {

        const card =
            createMovieCard(movie);

        moviesContainer.appendChild(card);
    });
}

/* PAGINATION */

function updatePagination(totalResults) {

    const totalPages =
        Math.ceil(totalResults / 10);

    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevBtn.disabled =
        currentPage === 1;

    nextBtn.disabled =
        currentPage === totalPages;
}

/* CREATE CARD */

function createMovieCard(movie) {

    const card =
        document.createElement("div");

    const poster =
        movie.Poster !== "N/A"
            ? movie.Poster
            : "https://placehold.co/300x450/1f2937/ffffff?text=No+Poster";

    card.classList.add("movie-card");

    card.innerHTML = `
        <img
            src="${poster}"
            alt="${movie.Title}"
        >

        <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        </div>
    `;

    card.addEventListener("click", () => {
        getMovieDetails(movie.imdbID);
    });

    return card;
}

/* MOVIE DETAILS */

async function getMovieDetails(id) {

    try {

        const response =
            await fetch(`${API_URL}&i=${id}`);

        const movie =
            await response.json();

        showMovieModal(movie);

    } catch (error) {

        console.error(error);
    }
}

/* MODAL */

function showMovieModal(movie) {

    const trailerUrl =
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
            movie.Title + " official trailer"
        )}`;

    modalBody.innerHTML = `
        <div class="modal-layout">

            <img
                src="${movie.Poster}"
                alt="${movie.Title}"
                class="modal-poster"
            >

            <div class="modal-info">

                <h2>${movie.Title}</h2>

                <div class="movie-details">

                    <span class="detail-badge">
                        ⭐ ${movie.imdbRating}
                    </span>

                    <span class="detail-badge">
                        🎬 ${movie.Director}
                    </span>

                    <span class="detail-badge">
                        🎭 ${movie.Genre}
                    </span>

                    <span class="detail-badge">
                        📅 ${movie.Year}
                    </span>

                    <span class="detail-badge">
                        ⏱ ${movie.Runtime}
                    </span>

                    <span class="detail-badge">
                        🌎 ${movie.Country}
                    </span>

                    <span class="detail-badge">
                        🗣 ${movie.Language}
                    </span>

                    <span class="detail-badge">
                        👥 ${movie.Actors}
                    </span>

                    <span class="detail-badge">
                        🏆 ${movie.Awards}
                    </span>

                </div>

                <p class="plot">
                    ${movie.Plot}
                </p>

                <p class="box-office">
                    💰 Box Office: ${movie.BoxOffice}
                </p>

                <a
                    href="${trailerUrl}"
                    target="_blank"
                    class="trailer-btn"
                >
                    ▶ Watch Trailer
                </a>

            </div>

        </div>
    `;

    movieModal.classList.remove("hidden");

    document.addEventListener("keydown", (e) => {

        if (
            e.key === "Escape" &&
            !movieModal.classList.contains("hidden")
        ) {
            movieModal.classList.add("hidden");
        }

    });
}

/* HELPERS */

function showLoading() {
    loading.classList.remove("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

function showError(message) {

    moviesContainer.innerHTML = `
        <p class="error-message">
            ${message}
        </p>
    `;
}