"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const GENRES = ["All", "Action", "Drama", "Comedy", "Thriller", "Sci-Fi", "Horror", "Romance", "Animation"];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== "all") params.set("type", type);
      if (genre !== "All") params.set("genre", genre);
      if (search) params.set("search", search);
      params.set("limit", "50");

      const res = await fetch(`/api/movies?${params}`);
      const data = await res.json();
      const list = Array.isArray(data.movies) ? data.movies : [];
      setMovies(list);
      if (list.length > 0) setFeatured(list.slice(0, 3));
    } catch (err) {
      console.error("Fetch error:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [type, genre, search]);

  useEffect(() => {
    const t = setTimeout(fetchMovies, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchMovies, search]);

  useEffect(() => {
    if (!featured || featured.length < 2) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured]);

  const hero = featured?.[heroIndex];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --gold: #f5c518;
          --red: #e50914;
          --bg: #080808;
          --card: #111;
          --border: #1e1e1e;
          --text: #fff;
          --muted: #888;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: var(--red); border-radius: 3px; }

        /* HERO */
        .hero {
          position: relative;
          height: 520px;
          overflow: hidden;
        }
        .hero-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity 0.8s ease;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(8,8,8,0.95) 35%, transparent 75%),
                      linear-gradient(to top, #080808 0%, transparent 55%);
        }
        .hero-content {
          position: absolute;
          bottom: 80px; left: 5%;
          max-width: 480px;
          animation: fadeUp 0.6s ease;
        }
        .hero-badge {
          display: inline-block;
          background: var(--red);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 4px 12px;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px;
          line-height: 1;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .hero-meta {
          color: var(--muted);
          font-size: 13px;
          margin-bottom: 14px;
          display: flex; gap: 12px; flex-wrap: wrap;
        }
        .hero-desc {
          color: #bbb;
          font-size: 13px;
          line-height: 1.7;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hero-btns { display: flex; gap: 10px; }
        .btn-primary {
          background: var(--red); color: #fff;
          border: none; border-radius: 8px;
          padding: 11px 24px; cursor: pointer;
          font-weight: 700; font-size: 13px;
          letter-spacing: 0.5px; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #c8000f; }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #fff; border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; padding: 11px 20px;
          font-weight: 600; font-size: 13px;
          text-decoration: none; transition: background 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); }
        .hero-dots {
          position: absolute; bottom: 28px; left: 5%;
          display: flex; gap: 8px;
        }
        .dot {
          height: 6px; border-radius: 3px;
          background: #444; cursor: pointer;
          transition: all 0.3s;
        }
        .dot.active { width: 24px; background: var(--red); }
        .dot:not(.active) { width: 6px; }

        /* FILTERS */
        .filters {
          padding: 24px 5% 0;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
        }
        .search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #141414; border: 1px solid #222;
          border-radius: 10px; padding: 10px 16px;
          flex: 1; max-width: 340px;
        }
        .search-wrap input {
          background: none; border: none; outline: none;
          color: #fff; font-size: 13px; width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .search-wrap input::placeholder { color: #555; }
        .genre-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .genre-btn {
          background: #141414; border: 1px solid #222;
          color: #888; border-radius: 20px;
          padding: 7px 16px; cursor: pointer;
          font-size: 12px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .genre-btn.active {
          background: var(--red); color: #fff;
          border-color: var(--red);
        }
        .type-tabs {
          display: flex; gap: 6px;
        }
        .type-btn {
          background: #141414; border: 1px solid #222;
          color: #888; border-radius: 8px;
          padding: 7px 14px; cursor: pointer;
          font-size: 12px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .type-btn.active {
          background: #1e1e1e; color: #fff;
          border-color: #444;
        }

        /* SECTION */
        .section { padding: 28px 5%; }
        .section-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px; letter-spacing: 1px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-title::before {
          content: '';
          display: block; width: 4px; height: 24px;
          background: var(--red); border-radius: 2px;
        }
        .count-badge {
          background: #1a1a1a; color: var(--muted);
          font-size: 12px; padding: 3px 10px;
          border-radius: 20px; font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        /* GRID */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
        }

        /* CARD */
        .card {
          background: var(--card);
          border-radius: 10px; overflow: hidden;
          aspect-ratio: 2/3; position: relative;
          cursor: pointer; text-decoration: none; color: #fff;
          border: 1px solid var(--border);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px rgba(229,9,20,0.2);
          border-color: #333;
        }
        .card img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .card:hover img { transform: scale(1.06); }
        .card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%);
        }
        .card-play {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
          background: rgba(0,0,0,0.3);
        }
        .card:hover .card-play { opacity: 1; }
        .play-circle {
          width: 46px; height: 46px; border-radius: 50%;
          background: var(--red); display: flex;
          align-items: center; justify-content: center;
        }
        .card-rating {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.75);
          border-radius: 6px; padding: 3px 7px;
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; gap: 3px;
          color: var(--gold);
        }
        .card-type {
          position: absolute; top: 8px; left: 8px;
          background: var(--red); color: #fff;
          font-size: 9px; font-weight: 700;
          letter-spacing: 1px; padding: 3px 7px;
          border-radius: 4px;
        }
        .card-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 12px 10px 10px;
        }
        .card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; letter-spacing: 0.5px;
          margin-bottom: 3px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-meta {
          color: var(--muted); font-size: 10px;
          display: flex; justify-content: space-between;
        }
        .no-poster {
          height: 100%; display: flex;
          align-items: center; justify-content: center;
          font-size: 36px; background: #0d0d0d;
        }

        /* EMPTY */
        .empty {
          text-align: center; padding: 80px 20px;
          color: #333;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-text { font-size: 16px; }

        /* LOADING */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
        }
        .skeleton {
          background: #111; border-radius: 10px;
          aspect-ratio: 2/3; overflow: hidden;
          position: relative;
        }
        .skeleton::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .hero { height: 400px; }
          .hero-title { font-size: 36px; }
          .hero-content { bottom: 60px; }
          .filters { flex-direction: column; align-items: stretch; }
          .search-wrap { max-width: 100%; }
        }
        
        .logo {
  position: absolute;
  top: 20px;
  right: 30px;
  z-index: 20;
}

.logo img {
  height: 70px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
}
      `}</style>

      {/* HERO BANNER */}
      {hero && (
        <div className="hero">
          <Link href="/" className="logo">
  <img src="/logof.png" alt="logo" />
</Link>
          <img
            key={heroIndex}
            className="hero-img"
            src={hero.banner || hero.poster || "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1200&q=80"}
            alt={hero.title}
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-badge">{hero.type === "series" ? "📺 SERIES" : "🎬 MOVIE"}</span>
            <h1 className="hero-title">{hero.title}</h1>
            <div className="hero-meta">
              {hero.rating && <span>⭐ {hero.rating}</span>}
              {hero.year && <span>{hero.year}</span>}
              {hero.genre && <span>{hero.genre}</span>}
              {hero.language && <span>{hero.language}</span>}
            </div>
            {hero.description && <p className="hero-desc">{hero.description}</p>}
            <div className="hero-btns">
              <Link href={`/movies?id=${hero._id}`} className="btn-primary">
                ▶ Watch Now
              </Link>
              <Link href={`/movies?id=${hero._id}`} className="btn-secondary">
                More Info
              </Link>
            </div>
          </div>
          {featured && featured.length > 1 && (
            <div className="hero-dots">
              {featured.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === heroIndex ? "active" : ""}`}
                  onClick={() => setHeroIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* FILTERS */}
      <div className="filters">
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="Search movies, series..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="type-tabs">
            {["all", "movie", "series"].map(t => (
              <button key={t} className={`type-btn ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
                {t === "all" ? "All" : t === "movie" ? "🎬 Movies" : "📺 Series"}
              </button>
            ))}
          </div>
        </div>
        <div className="genre-tabs">
          {GENRES.map(g => (
            <button key={g} className={`genre-btn ${genre === g ? "active" : ""}`} onClick={() => setGenre(g)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* MOVIE GRID */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">
            {search ? `Results for "${search}"` : genre !== "All" ? genre : "All Content"}
          </div>
          {!loading && <span className="count-badge">{movies.length} titles</span>}
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : movies.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎬</div>
            <div className="empty-text">No content found</div>
          </div>
        ) : (
          <div className="grid">
            {movies.map(m => (
              <Link key={m._id} href={`/movies?id=${m._id}`} className="card">
                {m.poster ? (
                  <img src={m.poster} alt={m.title} loading="lazy" />
                ) : (
                  <div className="no-poster">🎥</div>
                )}
                <div className="card-overlay" />
                <div className="card-play">
                  <div className="play-circle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div className="card-type">{m.type === "series" ? "SERIES" : "MOVIE"}</div>
                {m.rating && (
                  <div className="card-rating">⭐ {m.rating}</div>
                )}
                <div className="card-info">
                  <div className="card-title">{m.title}</div>
                  <div className="card-meta">
                    <span>{m.genre || "—"}</span>
                    <span>{m.year || ""}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "32px 20px", borderTop: "1px solid #111", color: "#333", fontSize: "12px", letterSpacing: "1px" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#e50914", marginBottom: "8px" }}>ECHITRA</div>
        © {new Date().getFullYear()} Echitra · For entertainment purposes only
      </footer>
    </>
  );
}
