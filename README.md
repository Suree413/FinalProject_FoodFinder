# FoodFinder

FoodFinder helps users find meals from TheMealDB, filter recipes by ingredients,
and keep a persistent queue and saved list. The frontend is React + Vite; the
Express backend validates requests, normalizes responses, and caches successful
TheMealDB responses for five minutes.

## Run locally

Install dependencies once:

```sh
npm install
```

Run the API and frontend in separate terminals:

```sh
npm run server
npm run dev
```

Vite proxies same-origin `/api` requests and the legacy root-level endpoints to
`http://localhost:3000`. Keep both processes running during local development.
If port 5173 is occupied, Vite prints a different local URL; open the URL it
prints.

## Deploy to Vercel

Import the repository into Vercel and use the project root as the Root
Directory. `vercel.json` builds the Vite frontend into `dist` and rewrites
client-side routes to `index.html`; `api/[...path].js` exposes the existing
Express routes as a Vercel Function. It also maps the existing root-level
`/meals`, `/watchlist`, `/history`, and `/undo` endpoints to that function.
The frontend keeps using relative URLs, so production requests go to the same
Vercel domain instead of `localhost`.

No environment variables are required for the default TheMealDB public API
key. If you have a different TheMealDB API key, set `THEMEALDB_API_KEY` in
Vercel Project Settings → Environment Variables for the environments you use.
This is a server-only variable; do not prefix it with `VITE_`.

Vercel Functions are stateless and may run on different instances. The active
React app stores Queue and Saved Recipes in browser Local Storage and uses its
client-side Stack/Hash Table implementations; those features do not depend on
the legacy in-memory Queue/Stack endpoints in `server.js`. The legacy endpoints
remain available for compatibility, but their in-memory Queue/Stack state is
not durable across Vercel Function instances.

## Project structure

```text
Food_Finder/
├── server.js
├── vite.config.js
├── legacy-dashboard.html
├── dashboard.js
└── src/
    ├── App.jsx
    ├── components/
    │   ├── Loading.jsx
    │   ├── MealCard.jsx
    │   ├── Navigation.jsx
    │   └── SearchBar.jsx
    ├── context/
    │   ├── navigationHistoryContext.js
    │   └── RouteHistoryProvider.jsx
    ├── pages/
    │   ├── Home.jsx
    │   ├── IngredientFinder.jsx
    │   ├── MealDetail.jsx
    │   ├── Queue.jsx
    │   └── SavedRecipes.jsx
    ├── services/
    │   └── mealApi.js
    └── utils/
        ├── Graph.js
        ├── HashTable.js
        ├── MealQueue.js
        ├── Stack.js
        └── mealStorage.js
```

The previous standalone dashboard is retained as `legacy-dashboard.html` and
`dashboard.js`; the active app entry is `index.html` → `src/main.jsx` → `App`.

## Component tree and React data flow

```text
App
├── Navigation (links derived from Graph)
└── Routes
    ├── Home
    │   ├── SearchBar
    │   ├── Loading
    │   └── MealCard*
    ├── IngredientFinder
    │   ├── SearchBar
    │   ├── Loading
    │   └── MealCard*
    ├── MealDetail
    │   └── Loading
    ├── Queue
    │   └── MealCard*
    └── SavedRecipes
        └── MealCard*
```

- `useState` keeps each page's search inputs, results, loading/error messages,
  filters, and persistent-list view state.
- `useEffect` loads Home's Category/Area options and Meal Detail data when its
  route ID changes. Meal Detail aborts an obsolete request if the route changes.
- `SearchBar` receives `children`, `onSubmit`, `loading`, `submitLabel`, and
  optional `extraActions`. The page owns the callback and state updates.
- `MealCard` receives a `meal` and optional `order`, `actionLabel`,
  `onAction(meal)`, or an `actions` list of labeled callbacks. It links to Meal
  Detail and reports actions to its parent. Home cards can add meals directly
  to Queue or Saved Recipes.
- `Loading` receives a `message` and exposes it as an accessible status.

## API flow

```text
Development:  React page → /api → Vite proxy → Express server.js → TheMealDB
Production:   React page → /api → Vercel Function → Express server.js → TheMealDB
                          ← normalized JSON ←                 ← cached response
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/search?q=<name>` | Search meals by name |
| GET | `/api/random` | Get a random meal |
| GET | `/api/meals?search=&category=&area=` | Search/filter meal lists |
| GET | `/api/meal/:id` | Get a meal's details |
| GET | `/api/ingredients?i=<ingredient>` | Find meals by ingredient |
| GET | `/api/ingredient-list` | List selectable ingredients |
| POST | `/api/ingredient-search` | Search by included and/or excluded ingredients |
| GET | `/api/categories` | List meal categories |
| GET | `/api/areas` | List meal areas |

The legacy dashboard endpoints (`/meals`, `/watchlist`, `/history`, and
`/undo`) are also proxied in development and rewritten to the Function on
Vercel.

The API validates required search terms and numeric meal IDs, returns explicit
HTTP errors, normalizes TheMealDB's response, and caches successful responses
in memory for five minutes.

TheMealDB's ingredient filter accepts one ingredient per request and returns
meal summaries. Ingredient Finder intersects those candidate IDs, loads full
meal details, and verifies the actual ingredient fields before returning
matches. For searches that only exclude ingredients, Express uses the API's
first-letter meal search because TheMealDB has no negative-ingredient filter.

## Data structures and complexity

- **Graph:** `src/utils/Graph.js` stores the five page nodes and their outgoing
  edges as an adjacency list. `Navigation` reads the current node's neighbors
  to build links. Looking up a node is O(1); rendering its links is O(degree).
- **Stack:** `src/utils/Stack.js` stores visited route paths. Meal Detail's Back
  action pops the latest route (LIFO); push/pop are amortized O(1). A direct
  visit with no previous route falls back to Home.
- **Queue:** `src/utils/MealQueue.js` implements FIFO with a head index.
  Enqueue/peek/dequeue are amortized O(1); removing an arbitrary item is O(n).
- **Hash table:** `src/utils/HashTable.js` uses separate chaining and Meal ID
  keys for duplicate checks in Queue and Saved Recipes. Lookup/insert/remove
  are O(1) on average and O(n) in the worst case.
- **Local Storage:** `foodfinder_queue` and `foodfinder_saved` hold separate
  JSON arrays. Queue and Saved Recipes survive refreshes.

## UX changes: Before → After

1. **Before:** `index.html` displayed the standalone dashboard and loaded a
   classic script, which Vite warned it could not bundle; the React pages were
   not the active entry. **After:** the root entry mounts React, while the
   previous dashboard remains available separately. The production build now
   bundles the React app.
2. **Before:** the Express file used CommonJS `require` even though the package
   is configured as an ES module, and Express was not declared as a dependency.
   **After:** the backend uses ES module imports, has an explicit `server`
   script, and responds through Vite's `/api` proxy.
3. **Before:** users could not filter Home results by Category/Area or sort
   A–Z/Z–A in the active React page. **After:** the Home page provides those
   controls; filter options include values found in actual search results
   because TheMealDB's Area list and meal details can use different labels.
4. **Before:** Home opened with an empty list and waited for the user to submit
   a search. **After:** it loads recommended meals from TheMealDB on entry and
   shows an explicit loading, error, or no-results state.

## Problems found and fixes

- The browser's connection-refused page meant no Vite process was listening.
  Start both commands under “Run locally”; use the URL Vite prints.
- Home also made no meal-search request on initial load. It now fetches real
  recommendations through Express and distinguishes an API error from a valid
  empty search result.
- The initial production build transformed only the legacy HTML/script, so a
  successful build did not mean the React app was included. The React entry
  script is now explicitly loaded as a module.
- Queue and Saved Recipes previously used separate hand-written array logic.
  They now share the Queue/Hash Table implementations and the same persistent
  Local Storage keys used by Meal Detail.

## Presentation team contributions

No member names are listed, as requested. Contributions are documented at the
project level and are not attributed to individuals.

## Validation

```sh
npm run build
npm run lint
```

The app was also exercised in a browser for API-backed search, ingredient
intersection/exclusion, filters and sorting, Stack Back, Queue Peek/Dequeue,
duplicate prevention, and persistence after refresh.
