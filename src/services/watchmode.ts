const API_KEY = process.env.NEXT_PUBLIC_WATCHMODE_API_KEY || "cbJJ7Uvi3G6XTrMK6IiEAQdj1lUR7XwD7xO4FM89";
const BASE_URL = "https://api.watchmode.com/v1";

export interface Source {
  source_id: number;
  name: string;
  type: "sub" | "free" | "rent" | "purchase";
  region: string;
  web_url: string;
  price?: number | null;
  format?: string;
}

export interface MovieItem {
  id: number;
  title: string;
  year?: number;
  poster?: string;
  rating?: number;
}

export interface MovieResult extends MovieItem {
  plot: string;
  rating: number;
  trailer: string | null;
  genreName?: string;
  originalLanguage?: string;
  freeSources: Source[];
  subSources: Source[];
  rentSources: Source[];
  vpnFreeSources: Source[]; // US/GB legal free sources (like Tubi, Pluto TV)
  genreRegionalRecommendations: MovieItem[];
  genreGlobalRecommendations: MovieItem[];
}

const GENRE_MAP: Record<string, number> = {
  action: 1,
  adventure: 2,
  animation: 3,
  comedy: 4,
  crime: 5,
  documentary: 6,
  drama: 7,
  family: 8,
  fantasy: 9,
  history: 10,
  horror: 11,
  music: 12,
  mystery: 13,
  romance: 14,
  scifi: 15,
  "sci-fi": 15,
  thriller: 17,
  war: 18,
  western: 19,
};

const fetchPostersForList = async (titles: any[]) => {
  return Promise.all(
    titles.slice(0, 6).map(async (item: any) => {
      try {
        const res = await fetch(`${BASE_URL}/title/${item.id}/details/?apiKey=${API_KEY}`);
        const data = await res.json();
        return {
          id: item.id,
          title: item.title,
          year: item.year,
          poster: data.poster || undefined,
          rating: data.user_rating,
        };
      } catch {
        return {
          id: item.id,
          title: item.title,
          year: item.year,
          poster: undefined,
        };
      }
    })
  );
};

export async function fetchMovieByIdOrTitle(
  queryOrId: string | number,
  region: string = "IN"
): Promise<MovieResult | null> {
  if (!API_KEY) throw new Error("Watchmode API Key missing.");

  let targetId: number | null = null;
  let fallbackPoster: string | undefined = undefined;

  if (typeof queryOrId === "number") {
    targetId = queryOrId;
  } else {
    const cleanQuery = queryOrId.trim().toLowerCase();

    // Direct genre keyword match
    if (GENRE_MAP[cleanQuery]) {
      const genreId = GENRE_MAP[cleanQuery];
      const listRes = await fetch(
        `${BASE_URL}/list-titles/?apiKey=${API_KEY}&genres=${genreId}&types=movie&sort_by=popularity_desc&limit=1`
      );
      const listData = await listRes.json();
      if (listData?.titles?.[0]) {
        targetId = listData.titles[0].id;
      }
    }

    if (!targetId) {
      const searchRes = await fetch(
        `${BASE_URL}/autocomplete-search/?apiKey=${API_KEY}&search_value=${encodeURIComponent(queryOrId)}&search_type=1`
      );
      const searchData = await searchRes.json();
      const match = searchData.results?.[0];
      if (match) {
        targetId = match.id;
        fallbackPoster = match.image_url;
      }
    }
  }

  if (!targetId) return null;

  // Fetch full details + sources
  const detailRes = await fetch(
    `${BASE_URL}/title/${targetId}/details/?apiKey=${API_KEY}&append_to_response=sources`
  );
  const movie = await detailRes.json();

  const genreId = movie.genres?.[0];
  const genreName = movie.genre_names?.[0] || "Featured";
  const movieLang = (movie.original_language || "en").toLowerCase();

  // Recommendations: Same Genre + Same Language
  let genreRegionalRecommendations: MovieItem[] = [];
  try {
    const regionalUrl = genreId
      ? `${BASE_URL}/list-titles/?apiKey=${API_KEY}&genres=${genreId}&languages=${movieLang}&types=movie&sort_by=popularity_desc&limit=10`
      : `${BASE_URL}/list-titles/?apiKey=${API_KEY}&languages=${movieLang}&types=movie&sort_by=popularity_desc&limit=10`;

    const regRes = await fetch(regionalUrl);
    const regData = await regRes.json();
    if (regData?.titles) {
      const filtered = regData.titles.filter((t: any) => t.id !== movie.id);
      genreRegionalRecommendations = await fetchPostersForList(filtered);
    }
  } catch (err) {
    console.error("Genre + Regional error:", err);
  }

  // Recommendations: Same Genre Worldwide Best
  let genreGlobalRecommendations: MovieItem[] = [];
  try {
    const globalUrl = genreId
      ? `${BASE_URL}/list-titles/?apiKey=${API_KEY}&genres=${genreId}&types=movie&sort_by=popularity_desc&limit=12`
      : `${BASE_URL}/list-titles/?apiKey=${API_KEY}&types=movie&sort_by=popularity_desc&limit=12`;

    const globRes = await fetch(globalUrl);
    const globData = await globRes.json();
    if (globData?.titles) {
      const pickedIds = new Set([movie.id, ...genreRegionalRecommendations.map((m) => m.id)]);
      const filtered = globData.titles.filter((t: any) => !pickedIds.has(t.id));
      genreGlobalRecommendations = await fetchPostersForList(filtered);
    }
  } catch (err) {
    console.error("Genre + Global error:", err);
  }

  const allSources: Source[] = movie.sources || [];
  const regionalSources = allSources.filter((s) => s.region === region);

  // VPN Free: Check if free on US/GB when not free in selected region
  const freeSources = regionalSources.filter((s) => s.type === "free");
  const vpnFreeSources =
    freeSources.length === 0
      ? allSources.filter((s) => s.type === "free" && (s.region === "US" || s.region === "GB"))
      : [];

  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    plot: movie.plot_overview,
    poster: movie.poster || fallbackPoster,
    rating: movie.user_rating,
    trailer: movie.trailer,
    genreName,
    originalLanguage: movieLang.toUpperCase(),
    freeSources,
    subSources: regionalSources.filter((s) => s.type === "sub"),
    rentSources: regionalSources.filter((s) => s.type === "rent"),
    vpnFreeSources,
    genreRegionalRecommendations,
    genreGlobalRecommendations,
  };
}