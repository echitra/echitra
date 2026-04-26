"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const EMPTY_FORM = {
  title: "", poster: "", banner: "", year: "", genre: "",
  language: "English", rating: "", cast: "", description: "",
  trailer: "", downlink: "", watch: "", type: "movie",
  tags: "", featured: false,
};

export default function Admin() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [seasons, setSeasons] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("add"); // add | manage
  const [editId, setEditId] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [msg, setMsg] = useState(null); // {type: 'success'|'error', text}

  useEffect(() => {
    if (localStorage.getItem("admin-auth") !== "true") router.push("/login");
    else fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/movies?limit=100");
      const data = await res.json();
      setMovies(Array.isArray(data.movies) ? data.movies : []);
    } catch { setMovies([]); }
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  // Season helpers
  const addSeason = () => setSeasons([...seasons, { seasonNumber: seasons.length + 1, episodes: [] }]);
  const removeSeason = (si) => setSeasons(seasons.filter((_, i) => i !== si));
  const addEpisode = (si) => {
    const u = [...seasons];
    u[si].episodes.push({ title: "", video: "", download: "" });
    setSeasons(u);
  };
  const removeEpisode = (si, ei) => {
    const u = [...seasons];
    u[si].episodes = u[si].episodes.filter((_, i) => i !== ei);
    setSeasons(u);
  };
  const updateEpisode = (si, ei, field, val) => {
    const u = [...seasons];
    u[si].episodes[ei][field] = val;
    setSeasons(u);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return showMsg("error", "Title is required");
    setLoading(true);

    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
      seasons: form.type === "series" ? seasons : [],
    };

    try {
      let res;
      if (editId) {
        res = await fetch("/api/movies", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
      } else {
        res = await fetch("/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showMsg("success", editId ? "Updated successfully!" : "Added successfully!");
        setForm(EMPTY_FORM);
        setSeasons([]);
        setEditId(null);
        setTab("manage");
        fetchMovies();
      } else {
        const d = await res.json();
        showMsg("error", d.error || "Something went wrong");
      }
    } catch {
      showMsg("error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie) => {
    setForm({
      title: movie.title || "",
      poster: movie.poster || "",
      banner: movie.banner || "",
      year: movie.year || "",
      genre: movie.genre || "",
      language: movie.language || "English",
      rating: movie.rating || "",
      cast: Array.isArray(movie.cast) ? movie.cast.join(", ") : (movie.cast || ""),
      description: movie.description || "",
      trailer: movie.trailer || "",
      downlink: movie.downlink || "",
      watch: movie.watch || "",
      type: movie.type || "movie",
      tags: Array.isArray(movie.tags) ? movie.tags.join(", ") : "",
      featured: movie.featured || false,
    });
    setSeasons(movie.seasons || []);
    setEditId(movie._id);
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/movies?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("success", `"${title}" deleted`);
        fetchMovies();
      } else showMsg("error", "Delete failed");
    } catch { showMsg("error", "Network error"); }
  };

  const filtered = movies.filter(m =>
    m.title?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const inputStyle = {
    width: "100%", background: "#0d0d0d", border: "1px solid #222",
    borderRadius: "8px", padding: "10px 14px", color: "#fff",
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none",
    transition: "border-color 0.2s",
  };
  const labelStyle = { fontSize: "11px", color: "#666", fontWeight: 700, letterSpacing: "1px", marginBottom: "6px", display: "block" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background: #080808; font-family: 'DM Sans', sans-serif; color: #fff; }
        input:focus, textarea:focus, select:focus { border-color: #e50914 !important; }
        input[type=checkbox] { width:auto; accent-color: #e50914; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media(max-width:600px) { .grid2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* TOAST */}
      {msg && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: msg.type === "success" ? "#0d2b0d" : "#2b0d0d",
          border: `1px solid ${msg.type === "success" ? "#1a5c1a" : "#5c1a1a"}`,
          color: msg.type === "success" ? "#4ade80" : "#f87171",
          padding: "12px 20px", borderRadius: "10px", fontSize: "13px",
          fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          animation: "fadeUp 0.3s ease"
        }}>
          {msg.type === "success" ? "✅" : "❌"} {msg.text}
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: "#e50914" }}>ECHITRA ADMIN</div>
            <div style={{ fontSize: 12, color: "#555" }}>Content Management Panel</div>
          </div>
          <button onClick={() => { localStorage.removeItem("admin-auth"); router.push("/login"); }}
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>
            Sign Out
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["add", "manage"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "#e50914" : "#111",
              color: "#fff", border: `1px solid ${tab === t ? "#e50914" : "#222"}`,
              borderRadius: 8, padding: "9px 22px", cursor: "pointer",
              fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
              fontFamily: "'DM Sans', sans-serif"
            }}>
              {t === "add" ? (editId ? "✏️ Edit Content" : "➕ Add Content") : `📋 Manage (${movies.length})`}
            </button>
          ))}
        </div>

        {/* ADD / EDIT FORM */}
        {tab === "add" && (
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 14, padding: 28 }}>
            {editId && (
              <div style={{ background: "#1a0d00", border: "1px solid #3a2000", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#f59e0b" }}>
                ✏️ Editing existing content · <button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setSeasons([]); }} style={{ background: "none", border: "none", color: "#e50914", cursor: "pointer", fontSize: 13 }}>Cancel edit</button>
              </div>
            )}

            {/* TYPE */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Content Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["movie", "series"].map(t => (
                  <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
                    background: form.type === t ? "#e50914" : "#111",
                    color: "#fff", border: `1px solid ${form.type === t ? "#e50914" : "#333"}`,
                    borderRadius: 8, padding: "9px 20px", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif"
                  }}>
                    {t === "movie" ? "🎬 Movie" : "📺 Series"}
                  </button>
                ))}
              </div>
            </div>

            {/* BASIC INFO */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Movie or series title" style={inputStyle} />
            </div>

            <div className="grid2" style={{ marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Poster URL</label>
                <input name="poster" value={form.poster} onChange={handleChange} placeholder="https://..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Banner URL</label>
                <input name="banner" value={form.banner} onChange={handleChange} placeholder="https://... (wide image)" style={inputStyle} />
              </div>
            </div>

            <div className="grid2" style={{ marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Year</label>
                <input name="year" value={form.year} onChange={handleChange} placeholder="2024" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Rating (e.g. 8.5)</label>
                <input name="rating" value={form.rating} onChange={handleChange} placeholder="8.5" style={inputStyle} />
              </div>
            </div>

            <div className="grid2" style={{ marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Genre</label>
                <input name="genre" value={form.genre} onChange={handleChange} placeholder="Action, Drama..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Language</label>
                <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
                  {["English","Hindi","Telugu","Tamil","Malayalam","Kannada","Bengali","Marathi","Other"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cast (comma separated)</label>
              <input name="cast" value={form.cast} onChange={handleChange} placeholder="Actor 1, Actor 2..." style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="Trending, New, Top Rated..." style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Plot summary..." rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {/* MOVIE ONLY */}
            {form.type === "movie" && (
              <div style={{ marginBottom: 16, background: "#080808", borderRadius: 10, padding: 16, border: "1px solid #1a1a1a" }}>
                <div style={{ fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>MOVIE LINKS</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Trailer URL (YouTube)</label>
                  <input name="trailer" value={form.trailer} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." style={inputStyle} />
                </div>
                <div className="grid2">
                  <div>
                    <label style={labelStyle}>Watch Link</label>
                    <input name="watch" value={form.watch} onChange={handleChange} placeholder="https://..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Download Link</label>
                    <input name="downlink" value={form.downlink} onChange={handleChange} placeholder="https://..." style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                Feature on homepage hero banner
              </label>
            </div>

            {/* SERIES SEASONS */}
            {form.type === "series" && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>Seasons & Episodes</div>
                  <button onClick={addSeason} style={{
                    background: "#1a1a1a", border: "1px solid #333", color: "#fff",
                    borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif"
                  }}>+ Add Season</button>
                </div>

                {seasons.map((season, si) => (
                  <div key={si} style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#f5c518", letterSpacing: 1 }}>
                        Season {season.seasonNumber}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => addEpisode(si)} style={{ background: "#111", border: "1px solid #333", color: "#aaa", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>+ Episode</button>
                        <button onClick={() => removeSeason(si)} style={{ background: "#2b0d0d", border: "1px solid #5c1a1a", color: "#f87171", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>✕</button>
                      </div>
                    </div>

                    {season.episodes.map((ep, ei) => (
                      <div key={ei} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: "#555", fontWeight: 700 }}>EP {ei + 1}</span>
                          <button onClick={() => removeEpisode(si, ei)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <input placeholder="Episode title" value={ep.title} onChange={e => updateEpisode(si, ei, "title", e.target.value)} style={inputStyle} />
                        </div>
                        <div className="grid2">
                          <input placeholder="Watch link" value={ep.video} onChange={e => updateEpisode(si, ei, "video", e.target.value)} style={inputStyle} />
                          <input placeholder="Download link" value={ep.download} onChange={e => updateEpisode(si, ei, "download", e.target.value)} style={inputStyle} />
                        </div>
                      </div>
                    ))}

                    {season.episodes.length === 0 && (
                      <div style={{ textAlign: "center", padding: "16px 0", color: "#333", fontSize: 13 }}>No episodes yet</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SUBMIT */}
            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", background: loading ? "#333" : "#e50914",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "14px", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 700, letterSpacing: 1,
              fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s"
            }}>
              {loading ? "Saving..." : editId ? "💾 Update Content" : "🚀 Publish Content"}
            </button>
          </div>
        )}

        {/* MANAGE */}
        {tab === "manage" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <input
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search by title..."
                style={{ ...inputStyle, maxWidth: 360 }}
              />
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>No content found</div>
            ) : (
              filtered.map(m => (
                <div key={m._id} style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: 12, padding: 16, marginBottom: 12,
                  display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap"
                }}>
                  {/* POSTER THUMB */}
                  <div style={{ width: 50, height: 70, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#111" }}>
                    {m.poster ? (
                      <img src={m.poster} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎥</div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: "#fff" }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      {m.type === "series" ? "📺 Series" : "🎬 Movie"} · {m.year || "—"} · {m.genre || "—"} · {m.language || "—"}
                    </div>
                    {m.seasons?.length > 0 && (
                      <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                        {m.seasons.length} season(s) · {m.seasons.reduce((a, s) => a + (s.episodes?.length || 0), 0)} episodes
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleEdit(m)} style={{
                      background: "#111", border: "1px solid #333", color: "#aaa",
                      borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif"
                    }}>✏️ Edit</button>
                    <button onClick={() => handleDelete(m._id, m.title)} style={{
                      background: "#1a0808", border: "1px solid #3a1515", color: "#f87171",
                      borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif"
                    }}>🗑️ Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
