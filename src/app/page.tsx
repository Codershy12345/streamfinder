"use client";

import { useState } from "react";
import { fetchMovieByIdOrTitle, MovieResult, MovieItem } from "@/services/watchmode";

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [movie, setMovie] = useState<MovieResult | null>(null);
  const [error, setError] = useState("");

  const popularGenres = ["Action", "Comedy", "Horror", "Sci-Fi", "Romance", "Thriller"];

  const executeLookup = async (identifier: string | number) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchMovieByIdOrTitle(identifier, region);
      if (data) {
        setMovie(data);
        if (typeof identifier === "string") {
          setQuery(data.title);
        }
      } else {
        setError("No movie or genre found. Try another search!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load movie details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeLookup(query);
  };

  const handleMovieCardClick = (id: number, title: string) => {
    setQuery(title);
    executeLookup(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenreBadgeClick = (genre: string) => {
    setQuery(genre);
    executeLookup(genre);
  };

  const renderMovieGrid = (list: MovieItem[] = []) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {list.map((item) => (
        <div
          key={item.id}
          onClick={() => handleMovieCardClick(item.id, item.title)}
          className="group bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-lg p-2.5 cursor-pointer hover:scale-105 transition duration-200 flex flex-col justify-between shadow"
        >
          {item.poster ? (
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-36 object-cover rounded mb-2 group-hover:opacity-90"
            />
          ) : (
            <div className="w-full h-36 bg-slate-800 rounded mb-2 flex items-center justify-center text-xs text-slate-500 text-center px-1">
              No Poster
            </div>
          )}
          <div>
            <p className="text-xs font-semibold line-clamp-2 text-slate-200 group-hover:text-indigo-300 transition">
              {item.title}
            </p>
            <div className="flex justify-between items-center mt-1">
              {item.year && <span className="text-[10px] text-slate-500">({item.year})</span>}
              {item.rating && <span className="text-[10px] text-yellow-400 font-medium">★ {item.rating}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-indigo-400">
          StreamFinder & Recommender
        </h1>
        <p className="text-slate-400 text-sm">
          Discover where to stream, legal free alternatives, and cheap rent options.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search movie title or genre (e.g. Inception, Sci-Fi, RRR)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="IN">India (IN)</option>
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {/* Quick Genre Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-xs text-slate-500">Quick Genres:</span>
          {popularGenres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleGenreBadgeClick(g)}
              className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            >
              {g}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>

      {movie && (
        <div className="w-full max-w-4xl space-y-10">
          {/* Main Movie Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {movie.poster && (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-48 rounded-lg shadow-md object-cover mx-auto sm:mx-0"
                />
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{movie.title}</h2>
                  <span className="text-slate-500">({movie.year})</span>
                  {movie.genreName && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-950 border border-indigo-700 text-indigo-300 rounded">
                      {movie.genreName}
                    </span>
                  )}
                  {movie.originalLanguage && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded">
                      Lang: {movie.originalLanguage}
                    </span>
                  )}
                </div>
                {movie.rating && (
                  <p className="text-yellow-400 text-sm mt-1">Rating: {movie.rating}/10</p>
                )}
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">{movie.plot}</p>
              </div>
            </div>

            {movie.trailer && (
              <div>
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:underline"
                >
                  Watch Official Trailer &rarr;
                </a>
              </div>
            )}

            {/* Providers & Smart Alternatives */}
            <div className="border-t border-slate-800 pt-5 space-y-5">
              
              {/* 1. Free Streams or YouTube Smart Search */}
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>Free Legal Streams ({region})</span>
                </h3>
                {(movie.freeSources || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {movie.freeSources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.web_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs rounded-full hover:bg-emerald-900 transition"
                      >
                        {s.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      No direct free streams listed in {region}. Check YouTube for full movie legal uploads:
                    </p>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        movie.title + " full movie " + (movie.originalLanguage || "")
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-950 border border-red-700 hover:bg-red-900 text-red-300 text-xs font-medium rounded transition whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Search on YouTube
                    </a>
                  </div>
                )}
              </div>

              {/* 2. Global Free via VPN (Tubi, Pluto TV etc.) */}
              {(movie.vpnFreeSources || []).length > 0 && (
                <div className="bg-indigo-950/30 border border-indigo-900/60 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded font-bold uppercase tracking-wider">
                      VPN Free Tip
                    </span>
                    <p className="text-xs text-indigo-300">
                      This movie is 100% legally free in other regions on ad-supported channels:
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {movie.vpnFreeSources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.web_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-indigo-900/50 border border-indigo-700 text-indigo-200 text-xs rounded-full hover:bg-indigo-800 transition"
                      >
                        {s.name} ({s.region})
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Subscription Platforms + Plan Perks */}
              <div>
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                  Subscription Platforms ({region})
                </h3>
                {(movie.subSources || []).length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {movie.subSources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.web_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-indigo-950/60 border border-indigo-700 text-indigo-300 text-xs rounded-full hover:bg-indigo-900 transition"
                        >
                          {s.name}
                        </a>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tip: Check if your mobile recharge (Jio / Airtel) or home fiber includes free access to these platforms.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No active subscription streams found for this region.</p>
                )}
              </div>

              {/* 4. Affordable Rent / Buy (Cheapest Option) */}
              {(movie.rentSources || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                    No Subscription? Rent Cheaply ({region})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.rentSources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.web_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-amber-950/40 border border-amber-800 text-amber-300 text-xs rounded-full hover:bg-amber-900 transition"
                      >
                        Rent on {s.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Recommendations: Same Genre + Regional */}
          {(movie.genreRegionalRecommendations || []).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                <h3 className="text-lg font-bold text-slate-200">
                  Top {movie.genreName} Movies in {movie.originalLanguage}
                </h3>
              </div>
              {renderMovieGrid(movie.genreRegionalRecommendations)}
            </div>
          )}

          {/* Recommendations: Same Genre Worldwide Best */}
          {(movie.genreGlobalRecommendations || []).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-lg font-bold text-slate-200">
                  All-Time Best {movie.genreName} Movies Worldwide
                </h3>
              </div>
              {renderMovieGrid(movie.genreGlobalRecommendations)}
            </div>
          )}
        </div>
      )}
    </main>
  );
}