/* ============================================================
   Wanderlynx Travel - travel_recommendation.js
   JavaScript Essentials, final project.
   Handles: fetching the JSON data, keyword search, rendering
   the recommendation cards, and clearing the results.
   ============================================================ */

const API_URL = "./travel_recommendation_api.json";

/* The data is fetched once and cached here. */
let travelData = null;

/* Words the user might type, mapped to a key of the JSON file.
   Prefixes are used so that "beach", "Beaches" and "BEACHES"
   all resolve to the same category. */
const CATEGORY_PREFIXES = {
  beaches: ["beach", "playa", "seaside", "shore", "coast", "island"],
  temples: ["temple", "templ", "shrine", "pagoda", "monaster"],
  countries: ["country", "countr", "nation", "city", "citi", "destination"]
};

const CATEGORY_LABELS = {
  beaches: "Beaches you should see",
  temples: "Temples worth the trip",
  countries: "Countries and cities we love"
};

/* ---------- Data loading ---------- */

async function loadTravelData() {
  if (travelData) return travelData;

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Could not load " + API_URL + " (status " + response.status + ")");
  }
  travelData = await response.json();
  return travelData;
}

/* ---------- Search helpers ---------- */

/* Turns every entry of the JSON into one flat list of
   { name, imageUrl, description, timeZone, category } objects. */
function flattenData(data) {
  const items = [];

  (data.countries || []).forEach(function (country) {
    (country.cities || []).forEach(function (city) {
      items.push(Object.assign({}, city, { category: "countries", country: country.name }));
    });
  });

  (data.temples || []).forEach(function (temple) {
    items.push(Object.assign({}, temple, { category: "temples" }));
  });

  (data.beaches || []).forEach(function (beach) {
    items.push(Object.assign({}, beach, { category: "beaches" }));
  });

  return items;
}

/* Returns "beaches", "temples", "countries" or null. */
function detectCategory(keyword) {
  const word = keyword.trim().toLowerCase();
  if (!word) return null;

  for (const category in CATEGORY_PREFIXES) {
    const found = CATEGORY_PREFIXES[category].some(function (prefix) {
      return word.startsWith(prefix) || prefix.startsWith(word);
    });
    if (found) return category;
  }
  return null;
}

/* Category first; if the word is not a category, fall back to a
   free-text match on the destination or country name. */
function searchDestinations(data, keyword) {
  const all = flattenData(data);
  const category = detectCategory(keyword);

  if (category) {
    return {
      title: CATEGORY_LABELS[category],
      items: all.filter(function (item) { return item.category === category; })
    };
  }

  const word = keyword.trim().toLowerCase();
  const matches = all.filter(function (item) {
    return item.name.toLowerCase().includes(word) ||
      (item.country || "").toLowerCase().includes(word);
  });

  return { title: "Results for " + keyword.trim(), items: matches };
}

/* Local time at the destination, e.g. "Tue, 14:32". */
function localTime(timeZone) {
  if (!timeZone) return "";
  try {
    return new Date().toLocaleString("en-US", {
      timeZone: timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  } catch (error) {
    console.warn("Unknown time zone:", timeZone);
    return "";
  }
}

/* ---------- Rendering ---------- */

function renderResults(result) {
  const section = document.getElementById("resultsSection");
  const container = document.getElementById("results");
  const title = document.getElementById("resultsTitle");
  const count = document.getElementById("resultsCount");
  if (!section || !container) return;

  container.innerHTML = "";
  section.hidden = false;
  title.textContent = result.title;

  if (result.items.length === 0) {
    count.textContent = "";
    container.innerHTML =
      '<p class="empty">No destination matched that search. Try <strong>beach</strong>, ' +
      '<strong>temple</strong> or <strong>country</strong>.</p>';
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  count.textContent =
    result.items.length + (result.items.length === 1 ? " recommendation" : " recommendations");

  result.items.forEach(function (item) {
    const time = localTime(item.timeZone);

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML =
      '<img src="' + item.imageUrl + '" alt="' + item.name + '">' +
      '<div class="card-body">' +
        '<h3>' + item.name + '</h3>' +
        (time ? '<p class="card-time">Local time &middot; ' + time + '</p>' : '') +
        '<p>' + item.description + '</p>' +
      '</div>';

    container.appendChild(card);
  });

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Event handlers ---------- */

async function handleSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const keyword = input.value.trim();
  if (!keyword) {
    alert("Please type a keyword such as beach, temple or country.");
    input.focus();
    return;
  }

  /* The nav bar is shared by the three pages. From About Us or
     Contact Us the search is handed over to the home page. */
  if (!document.getElementById("results")) {
    window.location.href = "./index.html?search=" + encodeURIComponent(keyword);
    return;
  }

  try {
    const data = await loadTravelData();
    renderResults(searchDestinations(data, keyword));
  } catch (error) {
    console.error(error);
    alert("Sorry, the recommendations could not be loaded. Please try again.");
  }
}

function handleClear() {
  const input = document.getElementById("searchInput");
  const section = document.getElementById("resultsSection");
  const container = document.getElementById("results");

  if (input) input.value = "";
  if (container) container.innerHTML = "";
  if (section) section.hidden = true;

  const hero = document.getElementById("hero");
  if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Wiring ---------- */

document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");
  const input = document.getElementById("searchInput");
  const heroBeachBtn = document.getElementById("heroBeachBtn");

  if (searchBtn) searchBtn.addEventListener("click", handleSearch);
  if (clearBtn) clearBtn.addEventListener("click", handleClear);

  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    });
  }

  if (heroBeachBtn) {
    heroBeachBtn.addEventListener("click", function () {
      input.value = "beach";
      handleSearch();
    });
  }

  /* Search terms arriving from another page: index.html?search=temple */
  const fromQuery = new URLSearchParams(window.location.search).get("search");
  if (fromQuery && input && document.getElementById("results")) {
    input.value = fromQuery;
    handleSearch();
  }
});
