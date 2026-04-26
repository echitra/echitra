// app/movies/page.js
import { getClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Link from "next/link";

export async function generateMetadata({ searchParams }) {
  const { id } = await searchParams;
  if (!id || !ObjectId.isValid(id)) return { title: "Movie Not Found" };

  try {
    const client = await getClient();
    const db = client.db("moviepalace");
    const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) });
    if (!movie) return { title: "Movie Not Found" };

    return {
      title: `${movie.title} (${movie.year || ""}) · Echitra`,
      description: movie.description || `Watch ${movie.title} on Echitra`,
      openGraph: {
        title: movie.title,
        description: movie.description,
        images: movie.poster ? [{ url: movie.poster }] : [],
      },
    };
  } catch {
    return { title: "Echitra" };
  }
}

export default async function MoviePage({ searchParams }) {
  const { id } = await searchParams;

  if (!id || !ObjectId.isValid(id)) {
    return (
      <div style={{ color: "white", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <p style={{ fontSize: 18, color: "#888" }}>Invalid movie ID</p>
        <Link href="/" style={{ color: "#e50914", marginTop: 16, display: "inline-block" }}>← Go Home</Link>
      </div>
    );
  }

  const client = await getClient();
  const db = client.db("moviepalace");
  const movie = await db.collection("movies").findOne({ _id: new ObjectId(id) });

  if (!movie) {
    return (
      <div style={{ color: "white", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
        <p style={{ fontSize: 18, color: "#888" }}>Movie not found</p>
        <Link href="/" style={{ color: "#e50914", marginTop: 16, display: "inline-block" }}>← Go Home</Link>
      </div>
    );
  }

  // Fetch related movies (same genre)
  let related = [];
  if (movie.genre) {
    related = await db.collection("movies")
      .find({ genre: { $regex: movie.genre, $options: "i" }, _id: { $ne: movie._id } })
      .limit(8)
      .toArray();
  }

  const type = movie.type || "movie";

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtu.be/")) return "https://www.youtube.com/embed/" + url.split("youtu.be/")[1].split("?")[0];
    if (url.includes("watch?v=")) return "https://www.youtube.com/embed/" + url.split("watch?v=")[1].split("&")[0];
    return url;
  };

  const castList = movie.cast
    ? (Array.isArray(movie.cast) ? movie.cast : movie.cast.split(",")).map(c => c.trim()).filter(Boolean)
    : [];

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
          --muted: #888;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: #fff; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: var(--red); border-radius: 3px; }

        .banner {
          position: relative; height: 420px; overflow: hidden;
        }
        .banner img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .banner-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, #080808 0%, rgba(8,8,8,0.5) 60%, transparent 100%);
        }
        .back-btn {
          position: absolute; top: 20px; left: 20px;
          background: rgba(0,0,0,0.6); color: #fff;
          border: 1px solid #333; border-radius: 8px;
          padding: 8px 16px; text-decoration: none;
          font-size: 13px; font-weight: 600;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .back-btn:hover { background: rgba(0,0,0,0.9); }

        .content { max-width: 1100px; margin: 0 auto; padding: 0 20px 60px; }

        .top-section {
          display: flex; gap: 28px; margin-top: -120px;
          position: relative; z-index: 10;
          flex-wrap: wrap;
        }

        .poster-wrap {
          flex-shrink: 0; width: 200px;
        }
        .poster-wrap img {
          width: 100%; border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8);
          border: 2px solid #222;
        }
        .no-poster-box {
          width: 200px; height: 300px;
          background: #111; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 48px; border: 2px solid #222;
        }

        .info { flex: 1; padding-top: 100px; }
        .type-badge {
          display: inline-block;
          background: var(--red); color: #fff;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; padding: 4px 12px;
          border-radius: 4px; margin-bottom: 10px;
        }
        .movie-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px; letter-spacing: 2px;
          line-height: 1; margin-bottom: 12px;
        }
        .meta-row {
          display: flex; gap: 14px; flex-wrap: wrap;
          color: var(--muted); font-size: 13px;
          margin-bottom: 16px; align-items: center;
        }
        .meta-item { display: flex; align-items: center; gap: 5px; }
        .rating-badge {
          background: #1a1400; color: var(--gold);
          border: 1px solid #3a2e00;
          padding: 4px 10px; border-radius: 6px;
          font-weight: 700; font-size: 14px;
        }

        .action-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .btn {
          padding: 11px 22px; border-radius: 8px;
          text-decoration: none; font-weight: 700;
          font-size: 13px; display: inline-flex;
          align-items: center; gap: 7px; transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .btn-watch { background: var(--red); color: #fff; }
        .btn-watch:hover { background: #c8000f; }
        .btn-download { background: #1a1a1a; color: #fff; border: 1px solid #333; }
        .btn-download:hover { background: #252525; }

        .desc { color: #bbb; font-size: 14px; line-height: 1.8; margin-bottom: 24px; }

        .label {
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          color: var(--muted); text-transform: uppercase; margin-bottom: 10px;
        }

        .cast-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
        .chip {
          background: #141414; border: 1px solid #222;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; color: #ccc;
        }

        .divider { border: none; border-top: 1px solid #1a1a1a; margin: 32px 0; }

        /* VIDEO */
        .video-section { margin-top: 32px; }
        .video-wrap {
          width: 100%; aspect-ratio: 16/9;
          border-radius: 12px; overflow: hidden;
          background: #0d0d0d; border: 1px solid #1e1e1e;
        }
        .video-wrap iframe { width: 100%; height: 100%; border: none; }

        /* SEASONS */
        .season-block { margin-bottom: 32px; }
        .season-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 1px;
          color: var(--gold); margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .episode-card {
          background: #0d0d0d; border: 1px solid #1a1a1a;
          border-radius: 10px; padding: 14px 16px;
          margin-bottom: 10px; display: flex;
          align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
          transition: border-color 0.2s;
        }
        .episode-card:hover { border-color: #333; }
        .episode-title { font-size: 14px; font-weight: 600; color: #ddd; }
        .episode-num { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .episode-btns { display: flex; gap: 8px; }

        /* RELATED */
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 14px;
        }
        .rel-card {
          background: #111; border-radius: 8px; overflow: hidden;
          aspect-ratio: 2/3; position: relative;
          text-decoration: none; color: #fff;
          border: 1px solid #1e1e1e; cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .rel-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 16px 32px rgba(229,9,20,0.2);
        }
        .rel-card img { width: 100%; height: 100%; object-fit: cover; }
        .rel-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%);
        }
        .rel-title {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 10px 8px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; letter-spacing: 0.5px;
        }
        .rel-meta { font-size: 10px; color: var(--muted); font-family: 'DM Sans', sans-serif; }

        @media (max-width: 600px) {
          .banner { height: 280px; }
          .top-section { flex-direction: column; margin-top: -60px; }
          .poster-wrap, .no-poster-box { width: 130px; }
          .no-poster-box { height: 195px; }
          .info { padding-top: 0; }
          .movie-title { font-size: 30px; }
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

      {/* BANNER */}
      <div className="banner">
        <Link href="/" className="logo">
  <img src="/logof.png" alt="logo" />
</Link>
        <img
          src={movie.banner || movie.poster || "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80"}
          alt={movie.title}
        />
        <div className="banner-overlay" />
        <Link href="/" className="back-btn">← Back</Link>
      </div>

      <div className="content">
        <div className="top-section">
          {/* POSTER */}
          <div className="poster-wrap">
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} />
            ) : (
              <div className="no-poster-box">🎥</div>
            )}
          </div>

          {/* INFO */}
          <div className="info">
            <span className="type-badge">{type === "series" ? "📺 SERIES" : "🎬 MOVIE"}</span>
            <h1 className="movie-title">{movie.title}</h1>

            <div className="meta-row">
              {movie.rating && <span className="rating-badge">⭐ {movie.rating}</span>}
              {movie.year && <span className="meta-item">📅 {movie.year}</span>}
              {movie.genre && <span className="meta-item">🎭 {movie.genre}</span>}
              {movie.language && <span className="meta-item">🌐 {movie.language}</span>}
            </div>

            {/* MOVIE BUTTONS */}
            {type === "movie" && (
              <div className="action-btns">
                {movie.watch && (
                  <a className="btn btn-watch" href={movie.watch} target="_blank" rel="noopener noreferrer">
                    ▶ Watch Now
                  </a>
                )}
                {movie.downlink && (
                  <a className="btn btn-download" href={movie.downlink} target="_blank" rel="noopener noreferrer">
                    ⬇ Download
                  </a>
                )}
              </div>
            )}

            {movie.description && <p className="desc">{movie.description}</p>}

            {/* CAST */}
            {castList.length > 0 && (
              <div>
                <div className="label">Cast</div>
                <div className="cast-chips">
                  {castList.map((c, i) => <span key={i} className="chip">{c}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="divider" />

        {/* TRAILER / EPISODES */}
        <div className="video-section">
          {type === "movie" ? (
            <>
              <div className="label">Trailer</div>
              <div className="video-wrap">
                {movie.trailer ? (
                  <iframe src={getEmbedUrl(movie.trailer)} allowFullScreen />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", flexDirection: "column", gap: 12 }}>
                    <span style={{ fontSize: 36 }}>🎬</span>
                    <span style={{ fontSize: 14 }}>No trailer available</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="label">Episodes</div>
              {movie.seasons?.length > 0 ? (
                movie.seasons.map((season, si) => (
                  <div key={si} className="season-block">
                    <div className="season-title">
                      <span>Season {season.seasonNumber}</span>
                      <span style={{ fontSize: 14, color: "#555", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                        {season.episodes?.length || 0} episodes
                      </span>
                    </div>
                    {season.episodes?.map((ep, ei) => (
                      <div key={ei} className="episode-card">
                        <div>
                          <div className="episode-title">{ep.title || `Episode ${ei + 1}`}</div>
                          <div className="episode-num">S{season.seasonNumber} · E{ei + 1}</div>
                        </div>
                        <div className="episode-btns">
                          {ep.video && (
                            <a href={ep.video} target="_blank" rel="noopener noreferrer" className="btn btn-watch" style={{ padding: "8px 16px", fontSize: "12px" }}>
                              ▶ Watch
                            </a>
                          )}
                          {ep.download && (
                            <a href={ep.download} target="_blank" rel="noopener noreferrer" className="btn btn-download" style={{ padding: "8px 16px", fontSize: "12px" }}>
                              ⬇ Download
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p style={{ color: "#444", padding: "40px 0", textAlign: "center" }}>No episodes added yet.</p>
              )}
            </>
          )}
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <>
            <hr className="divider" />
            <div className="label">More like this</div>
            <div className="related-grid" style={{ marginTop: 12 }}>
              {related.map(m => (
                <Link key={m._id} href={`/movies?id=${m._id}`} className="rel-card">
                  {m.poster ? (
                    <img src={m.poster} alt={m.title} loading="lazy" />
                  ) : (
                    <div style={{ height: "100%", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎥</div>
                  )}
                  <div className="rel-overlay" />
                  <div className="rel-title">
                    {m.title}
                    <div className="rel-meta">{m.year}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
