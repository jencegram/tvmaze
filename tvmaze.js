"use strict";

// Selecting DOM elements with jQuery
const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */


// Function that searches for TV show based on search term using TVMaze API
async function getShowsByTerm(term) {
  const response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  // Map over the response data and get the info for each show
  const shows = response.data.map((result) => {
    const show = result.show;
    // Default image URL if no image is available
    const image = show.image ? show.image.medium : "https://tinyurl.com/tv-missing";
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: image,
    };
  });
  // Returns array of show objects
  return shows;
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  // Empty the shows list element to remove any previous shows
  $showsList.empty();

  // Loop through each show in the array and create the necessary HTML markup
  for (let show of shows) {
    const $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <img class="card-img-top" src="${show.image}" alt="${show.name}">
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary episodes-button">Episodes</button>
           </div>
         </div>
       </div>
      `);

    // Add the HTML markup to the shows list element in the DOM
    $showsList.append($item);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForDisplay() {
  // Listen for form submission and handle it
  $searchForm.on("submit", async function handleSearch(event) {
    event.preventDefault();
    // Get the search term from the input field
    const searchTerm = $("#search-query").val();
    // Hide  episodes area (only shows if the user clicks on the episodes button)
    $("#episodes-area").hide();
    // Get the TV shows that match the search term
    const shows = await getShowsByTerm(searchTerm);
    // Displays the TV shows on the page
    populateShows(shows);
  });
}

// Invoke the searchForDisplay function to set up the search functionality
searchForDisplay();

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodes(showId) {
  // Send a GET request to the TV Maze API for the episodes of the specified show
  const response = await axios.get(`http://api.tvmaze.com/shows/${showId}/episodes`);
  // Map over the response data and extract the necessary information for each episode
  const episodes = response.data.map((episode) => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
  });
  // Return an array of episode objects
  return episodes;
}

/** Given list of episodes, create markup for each and to DOM */
function populateEpisodes(episodes) {
  // Select the episodes list element and empty it to remove any previous episodes
  const $episodesList = $("#episodes-list");
  $episodesList.empty();
  // Loop through each episode in  array and create necessary HTML markup
  for (let episode of episodes) {
    const $item = $(
      `<li>${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>`
    );
    // Add the HTML markup to the episodes list element in the DOM
    $episodesList.append($item);
  }

  // Show the episodes area on the page
  $episodesArea.show();
}


/** Handle click on episodes button: get episodes for show and display */
async function getEpisodesandDisplay(evt) {
  // Get the button that was clicked and the corresponding card element
  const $button = $(evt.target);
  const $card = $button.closest(".card");
  // Get the ID of the TV show from the data-show-id attribute of the card
  const showId = $card.data("show-id");
  // Get the episodes for the TV show from the TV Maze API
  const episodes = await getEpisodes(showId);
  // Display the episodes on the page
  populateEpisodes(episodes);
}

// Listen for click events on the episodes buttons and calls getEpisodesandDisplay function. 
$showsList.on("click", ".episodes-button", getEpisodesandDisplay);