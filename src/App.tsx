import { useState, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ⚠️ REPLACE THESE TWO LINES WITH YOUR OWN VALUES
const SUPABASE_URL = "https://yvcpcihvqyzvafzincaz.supabase.co";
const SUPABASE_KEY = "sb_publishable_yMxLucuuWAcYn5ZBvjjkeg_Y222vxHn";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SECTORS = ["All", "Healthcare", "Tech", "Education", "Finance", "Hospitality", "Other"];

const avatarColors = ["#e05c2a", "#2a7de0", "#2ac97d", "#c92a7d", "#c9a12a", "#7d2ac9"];
function getColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

function Avatar({ initials }) {
  const color = getColor(initials || "?");
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700,
      color: "#fff", flexShrink: 0, letterSpacing: 1,
    }}>{initials || "?"}</div>
  );
}

function Badge({ children, color = "#e05c2a" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      border: `1.5px solid ${color}`, color, fontSize: 11,
      fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: 0.5,
    }}>{children}</span>
  );
}

function Card({ post, onSave, savedIds }) {
  const [hovered, setHovered] = useState(false);
  const isSaved = savedIds.includes(post.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1f2e" : "#141822",
        border: `1.5px solid ${hovered ? "#e05c2a" : "#252b3b"}`,
        borderRadius: 16, padding: "24px 28px",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Avatar initials={post.initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#f0ece0", marginBottom: 4 }}>
                {post.role}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge>{post.sector}</Badge>
                <Badge color="#6b7de0">📍 {post.location}</Badge>
                <Badge color="#2ac97d">⏱ Leaving in {post.leaving_in}</Badge>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace" }}>
              {new Date(post.created_at).toLocaleDateString("en-GB")}
            </div>
          </div>

          {post.reason && (
            <div style={{ fontSize: 13, color: "#8a93b0", marginBottom: 12, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              <span style={{ color: "#555e7a", marginRight: 6 }}>Reason:</span>{post.reason}
            </div>
          )}

          {post.notes && (
            <div style={{
              fontSize: 13, color: "#b0b8cc", fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.7, background: "#0d1018", borderRadius: 10,
              padding: "12px 16px", borderLeft: "3px solid #e05c2a", marginBottom: 16,
            }}>
              "{post.notes}"
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onSave(post.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: isSaved ? "#e05c2a" : "transparent",
                border: `1.5px solid ${isSaved ? "#e05c2a" : "#353d52"}`,
                color: isSaved ? "#fff" : "#8a93b0",
                borderRadius: 8, padding: "7px 16px", fontSize: 13,
                fontFamily: "'DM Mono', monospace", cursor: "pointer",
                transition: "all 0.15s ease", fontWeight: 600,
              }}
            >
              🔔 {isSaved ? "Saved" : "Alert me"} · {post.saves || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostForm({ onPost, onClose }) {
  const [form, setForm] = useState({ role: "", sector: "Healthcare", location: "", leaving_in: "", reason: "", notes: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    width: "100%", background: "#0d1018", border: "1.5px solid #252b3b",
    borderRadius: 10, padding: "11px 14px", color: "#f0ece0",
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace",
    marginBottom: 6, display: "block", letterSpacing: 0.5,
  };

  async function handleSubmit() {
    if (!form.role || !form.location || !form.leaving_in) {
      setError("Please fill in role, location and leaving date.");
      return;
    }
    setLoading(true);
    setError("");
    const initials = form.email
      ? form.email.slice(0, 2).toUpperCase()
      : form.role.slice(0, 2).toUpperCase();

    const { error: err } = await supabase.from("posts").insert([{
      role: form.role,
      sector: form.sector,
      location: form.location,
      leaving_in: form.leaving_in,
      reason: form.reason,
      notes: form.notes,
      initials,
      saves: 0,
    }]);

    setLoading(false);
    if (err) { setError("Something went wrong. Try again."); return; }
    onPost();
    onClose();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }}>
      <div style={{
        background: "#141822", border: "1.5px solid #252b3b",
        borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0ece0", marginBottom: 6 }}>
          I'm leaving my role
        </div>
        <div style={{ fontSize: 13, color: "#555e7a", marginBottom: 28 }}>
          Let the right person know before it's even advertised.
        </div>

        {error && (
          <div style={{ background: "#2a1010", border: "1.5px solid #e05c2a", borderRadius: 10, padding: "10px 14px", color: "#e05c2a", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>JOB TITLE *</label>
            <input style={inputStyle} placeholder="e.g. District Nurse" value={form.role} onChange={e => update("role", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>SECTOR</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.sector} onChange={e => update("sector", e.target.value)}>
                {SECTORS.filter(s => s !== "All").map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>LOCATION *</label>
              <input style={inputStyle} placeholder="e.g. Bristol, UK" value={form.location} onChange={e => update("location", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>LEAVING IN *</label>
              <input style={inputStyle} placeholder="e.g. 4 weeks" value={form.leaving_in} onChange={e => update("leaving_in", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>REASON</label>
              <input style={inputStyle} placeholder="e.g. Career change" value={form.reason} onChange={e => update("reason", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>INSIDER NOTES (optional)</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
              placeholder="What should the next person know?"
              value={form.notes}
              onChange={e => update("notes", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>YOUR EMAIL (optional — for alerts only)</label>
            <input style={inputStyle} placeholder="stays private, never shown" type="email" value={form.email} onChange={e => update("email", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1, background: loading ? "#7a3015" : "#e05c2a", border: "none",
              borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace",
              fontSize: 14, fontWeight: 700, padding: "13px 0", cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Posting..." : "Post anonymously →"}
          </button>
          <button onClick={onClose} style={{
            background: "transparent", border: "1.5px solid #252b3b",
            borderRadius: 10, color: "#555e7a", fontFamily: "'DM Mono', monospace",
            fontSize: 14, padding: "13px 20px", cursor: "pointer",
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertForm({ onClose }) {
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("Healthcare");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    await supabase.from("saved_posts").insert([{ post_id: null, user_email: email, sector }]);
    setLoading(false);
    setDone(true);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }}>
      <div style={{
        background: "#141822", border: "1.5px solid #252b3b",
        borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 420,
      }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔔</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0ece0", marginBottom: 8 }}>You're on the list</div>
            <div style={{ fontSize: 13, color: "#555e7a", marginBottom: 24 }}>We'll email you when a {sector} role is posted near you.</div>
            <button onClick={onClose} style={{
              background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff",
              fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
              padding: "12px 32px", cursor: "pointer",
            }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0ece0", marginBottom: 6 }}>Get alerts</div>
            <div style={{ fontSize: 13, color: "#555e7a", marginBottom: 24 }}>We'll notify you the moment someone in your sector posts a handoff.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace", marginBottom: 6, display: "block" }}>YOUR EMAIL</label>
                <input
                  style={{ width: "100%", background: "#0d1018", border: "1.5px solid #252b3b", borderRadius: 10, padding: "11px 14px", color: "#f0ece0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  placeholder="you@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace", marginBottom: 6, display: "block" }}>SECTOR</label>
                <select
                  style={{ width: "100%", background: "#0d1018", border: "1.5px solid #252b3b", borderRadius: 10, padding: "11px 14px", color: "#f0ece0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", cursor: "pointer" }}
                  value={sector} onChange={e => setSector(e.target.value)}
                >
                  {SECTORS.filter(s => s !== "All").map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={handleSubmit} disabled={loading} style={{
                flex: 1, background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff",
                fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
                padding: "13px 0", cursor: "pointer",
              }}>{loading ? "Saving..." : "Notify me →"}</button>
              <button onClick={onClose} style={{
                background: "transparent", border: "1.5px solid #252b3b", borderRadius: 10,
                color: "#555e7a", fontFamily: "'DM Mono', monospace", fontSize: 14,
                padding: "13px 20px", cursor: "pointer",
              }}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, []);

  async function handleSave(postId) {
    if (savedIds.includes(postId)) {
      setSavedIds(ids => ids.filter(id => id !== postId));
      await supabase.from("posts").update({ saves: (posts.find(p => p.id === postId)?.saves || 1) - 1 }).eq("id", postId);
    } else {
      setSavedIds(ids => [...ids, postId]);
      await supabase.from("posts").update({ saves: (posts.find(p => p.id === postId)?.saves || 0) + 1 }).eq("id", postId);
    }
    fetchPosts();
  }

  const filtered = posts.filter(p => {
    const matchSector = sector === "All" || p.sector === sector;
    const matchSearch = !search || p.role.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    return matchSector && matchSearch;
  });

  const healthcarePosts = posts.filter(p => p.sector === "Healthcare").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1018" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: "1.5px solid #1a1f2e", padding: "0 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#f0ece0" }}>
              hand<span style={{ color: "#e05c2a" }}>off</span>
            </span>
            <span style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace" }}>beta</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowAlert(true)} style={{
              background: "transparent", border: "1.5px solid #252b3b", borderRadius: 10,
              color: "#8a93b0", fontFamily: "'DM Mono', monospace", fontSize: 13,
              fontWeight: 700, padding: "9px 16px", cursor: "pointer",
            }}>🔔 Alerts</button>
            <button onClick={() => setShowForm(true)} style={{
              background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff",
              fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
              padding: "9px 20px", cursor: "pointer",
            }}>+ I'm leaving</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900, color: "#f0ece0", lineHeight: 1.15, margin: "0 0 12px",
          }}>
            Jobs before they're<br /><span style={{ color: "#e05c2a" }}>even advertised.</span>
          </h1>
          <p style={{ color: "#555e7a", fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 480 }}>
            Real people announcing they're leaving — so you can get ahead of the queue. No recruiters. No job boards.
          </p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            style={{
              flex: 1, minWidth: 180, background: "#141822", border: "1.5px solid #252b3b",
              borderRadius: 10, padding: "10px 14px", color: "#f0ece0",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none",
            }}
            placeholder="🔍  Search role or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)} style={{
              background: sector === s ? "#e05c2a" : "#141822",
              border: `1.5px solid ${sector === s ? "#e05c2a" : "#252b3b"}`,
              color: sector === s ? "#fff" : "#8a93b0",
              borderRadius: 8, padding: "8px 14px",
              fontFamily: "'DM Mono', monospace", fontSize: 12,
              cursor: "pointer", fontWeight: 600, transition: "all 0.15s",
            }}>{s}</button>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 24, marginBottom: 28, padding: "14px 20px",
          background: "#141822", borderRadius: 12, border: "1.5px solid #1a1f2e",
        }}>
          {[
            { label: "Live posts", value: posts.length },
            { label: "Healthcare", value: healthcarePosts },
            { label: "This week", value: posts.length },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#e05c2a", fontFamily: "'Playfair Display', serif" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#555e7a", padding: "60px 0", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
              Loading posts...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555e7a", padding: "60px 0", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
              No posts yet — be the first to post a handoff. 👆
            </div>
          ) : filtered.map(post => (
            <Card key={post.id} post={post} onSave={handleSave} savedIds={savedIds} />
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: 48, padding: "32px", background: "#141822",
          border: "1.5px solid #252b3b", borderRadius: 16, textAlign: "center",
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#f0ece0", marginBottom: 8 }}>
            Leaving a role soon?
          </div>
          <div style={{ fontSize: 13, color: "#555e7a", marginBottom: 20 }}>
            Give someone else the jump. Post anonymously in 60 seconds.
          </div>
          <button onClick={() => setShowForm(true)} style={{
            background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff",
            fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
            padding: "12px 32px", cursor: "pointer",
          }}>Post your handoff →</button>
        </div>
      </div>

      {showForm && <PostForm onPost={fetchPosts} onClose={() => setShowForm(false)} />}
      {showAlert && <AlertForm onClose={() => setShowAlert(false)} />}
    </div>
  );
}
