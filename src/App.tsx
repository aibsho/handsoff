import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yvcpcihvqyzvafzincaz.supabase.co";
const SUPABASE_KEY = "sb_publishable_yMxLucuuWAcYn5ZBvjjkeg_Y222vxHn";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SECTORS = ["All", "Healthcare", "Tech", "Education", "Finance", "Hospitality", "Other"];
const avatarColors = ["#e05c2a", "#2a7de0", "#2ac97d", "#c92a7d", "#c9a12a", "#7d2ac9"];

interface Post {
  id: string;
  created_at: string;
  role: string;
  sector: string;
  location: string;
  leaving_in: string;
  reason?: string;
  notes?: string;
  initials?: string;
  saves: number;
}

function getColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

function Avatar({ initials }: { initials?: string }) {
  const color = getColor(initials || "?");
  return (
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: 1 }}>
      {initials || "?"}
    </div>
  );
}

function Badge({ children, color = "#e05c2a" }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, border: `1.5px solid ${color}`, color, fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: 0.5 }}>
      {children}
    </span>
  );
}

function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputStyle: React.CSSProperties = { width: "100%", background: "#0d1018", border: "1.5px solid #252b3b", borderRadius: 10, padding: "11px 14px", color: "#f0ece0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace", marginBottom: 6, display: "block", letterSpacing: 0.5 };

  async function handleSubmit() {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) { setMessage("Check your email to confirm your account, then log in."); setMode("login"); }
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) { onSuccess(data.user); onClose(); }
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: "#141822", border: "1.5px solid #252b3b", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 420 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#f0ece0", marginBottom: 6 }}>{mode === "signup" ? "Join Handoff" : "Welcome back"}</div>
        <div style={{ fontSize: 13, color: "#555e7a", marginBottom: 28 }}>{mode === "signup" ? "Create a free account to post your handoff or set up alerts." : "Sign in to your account."}</div>
        {error && <div style={{ background: "#2a1010", border: "1.5px solid #e05c2a", borderRadius: 10, padding: "10px 14px", color: "#e05c2a", fontSize: 13, marginBottom: 16 }}>{error}</div>}
        {message && <div style={{ background: "#0a2a1a", border: "1.5px solid #2ac97d", borderRadius: 10, padding: "10px 14px", color: "#2ac97d", fontSize: 13, marginBottom: 16 }}>{message}</div>}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          <div>
            <label style={labelStyle}>EMAIL</label>
            <input style={inputStyle} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>PASSWORD</label>
            <input style={inputStyle} type="password" placeholder="at least 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, padding: "13px 0", cursor: "pointer" }}>
            {loading ? "..." : mode === "signup" ? "Create account →" : "Sign in →"}
          </button>
          <button onClick={onClose} style={{ background: "transparent", border: "1.5px solid #252b3b", borderRadius: 10, color: "#555e7a", fontFamily: "'DM Mono', monospace", fontSize: 14, padding: "13px 20px", cursor: "pointer" }}>Cancel</button>
        </div>
        <div style={{ textAlign: "center" as const, marginTop: 16, fontSize: 13, color: "#555e7a" }}>
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); setMessage(""); }} style={{ color: "#e05c2a", cursor: "pointer", fontWeight: 600 }}>
            {mode === "signup" ? "Sign in" : "Sign up free"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PremiumModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: "#141822", border: "1.5px solid #e05c2a", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center" as const, marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#f0ece0", marginBottom: 8 }}>Go Premium</div>
          <div style={{ fontSize: 14, color: "#555e7a" }}>Be the first to know. Every time.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 28 }}>
          {[
            { icon: "⚡", text: "Instant alerts — notified the second a post goes live" },
            { icon: "🎯", text: "Sector filters — only get alerts for roles you care about" },
            { icon: "📍", text: "Location alerts — never miss a role near you" },
            { icon: "👁", text: "See posts 48hrs before free users" },
            { icon: "🔒", text: "Direct message the person leaving (coming soon)" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ fontSize: 14, color: "#b0b8cc", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" as const, marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#e05c2a", fontWeight: 900 }}>£4.99<span style={{ fontSize: 16, color: "#555e7a" }}>/month</span></div>
          <div style={{ fontSize: 12, color: "#555e7a", marginTop: 4 }}>Cancel anytime. No commitment.</div>
        </div>
        <button style={{ width: "100%", background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, padding: "14px 0", cursor: "pointer", marginBottom: 10 }}>
          Start free trial → (coming soon)
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "1.5px solid #252b3b", borderRadius: 10, color: "#555e7a", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "11px 0", cursor: "pointer" }}>Maybe later</button>
      </div>
    </div>
  );
}

function PostForm({ onPost, onClose, user }: { onPost: () => void; onClose: () => void; user: User }) {
  const [form, setForm] = useState({ role: "", sector: "Healthcare", location: "", leaving_in: "", reason: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle: React.CSSProperties = { width: "100%", background: "#0d1018", border: "1.5px solid #252b3b", borderRadius: 10, padding: "11px 14px", color: "#f0ece0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace", marginBottom: 6, display: "block", letterSpacing: 0.5 };

  async function handleSubmit() {
    if (!form.role || !form.location || !form.leaving_in) { setError("Please fill in role, location and leaving date."); return; }
    setLoading(true); setError("");
    const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "AN";
    const { error: err } = await supabase.from("posts").insert([{ ...form, initials, saves: 0, user_id: user.id }]);
    setLoading(false);
    if (err) { setError("Something went wrong. Try again."); return; }
    onPost(); onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: "#141822", border: "1.5px solid #252b3b", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0ece0", marginBottom: 6 }}>I'm leaving my role</div>
        <div style={{ fontSize: 13, color: "#555e7a", marginBottom: 28 }}>Give someone the inside track. Your name is never shown.</div>
        {error && <div style={{ background: "#2a1010", border: "1.5px solid #e05c2a", borderRadius: 10, padding: "10px 14px", color: "#e05c2a", fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 18 }}>
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
            <label style={labelStyle}>INSIDER NOTES — the real stuff ✨</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} placeholder="What's the team like? Is the manager good? What would you tell your replacement? This is what makes Handoff different from Indeed." value={form.notes} onChange={e => update("notes", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, background: loading ? "#7a3015" : "#e05c2a", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, padding: "13px 0", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Posting..." : "Post anonymously →"}
          </button>
          <button onClick={onClose} style={{ background: "transparent", border: "1.5px solid #252b3b", borderRadius: 10, color: "#555e7a", fontFamily: "'DM Mono', monospace", fontSize: 14, padding: "13px 20px", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Card({ post, onSave, savedIds }: { post: Post; onSave: (id: string) => void; savedIds: string[] }) {
  const [hovered, setHovered] = useState(false);
  const isSaved = savedIds.includes(post.id);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? "#1a1f2e" : "#141822", border: `1.5px solid ${hovered ? "#e05c2a" : "#252b3b"}`, borderRadius: 16, padding: "24px 28px", transition: "all 0.2s ease" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Avatar initials={post.initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 8, marginBottom: 8 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#f0ece0" }}>{post.role}</div>
            <div style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace" }}>{new Date(post.created_at).toLocaleDateString("en-GB")}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 }}>
            <Badge>{post.sector}</Badge>
            <Badge color="#6b7de0">📍 {post.location}</Badge>
            <Badge color="#2ac97d">⏱ Leaving in {post.leaving_in}</Badge>
          </div>
          {post.reason && <div style={{ fontSize: 13, color: "#8a93b0", marginBottom: 10, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}><span style={{ color: "#555e7a", marginRight: 6 }}>Reason:</span>{post.reason}</div>}
          {post.notes && (
            <div style={{ fontSize: 13, color: "#b0b8cc", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, background: "#0d1018", borderRadius: 10, padding: "12px 16px", borderLeft: "3px solid #e05c2a", marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "#e05c2a", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: 6 }}>INSIDER NOTE ✨</span>
              "{post.notes}"
            </div>
          )}
          <button onClick={() => onSave(post.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: isSaved ? "#e05c2a" : "transparent", border: `1.5px solid ${isSaved ? "#e05c2a" : "#353d52"}`, color: isSaved ? "#fff" : "#8a93b0", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer", transition: "all 0.15s ease", fontWeight: 600 }}>
            🔔 {isSaved ? "Saved" : "Save"} · {post.saves || 0}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("All");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session?.user) setUser(data.session.user); });
    supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); });
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) || []);
    setLoading(false);
  }

  async function handleSave(postId: string) {
    if (!user) { setShowAuth(true); return; }
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (savedIds.includes(postId)) {
      setSavedIds(ids => ids.filter(id => id !== postId));
      await supabase.from("posts").update({ saves: Math.max(0, post.saves - 1) }).eq("id", postId);
    } else {
      setSavedIds(ids => [...ids, postId]);
      await supabase.from("posts").update({ saves: post.saves + 1 }).eq("id", postId);
    }
    fetchPosts();
  }

  function handlePostClick() {
    if (!user) { setShowAuth(true); return; }
    setShowForm(true);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const filtered = posts.filter(p => {
    const matchSector = sector === "All" || p.sector === sector;
    const matchSearch = !search || p.role.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    return matchSector && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0d1018" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;600&display=swap" rel="stylesheet" />

      <div style={{ borderBottom: "1.5px solid #1a1f2e", padding: "0 24px", position: "sticky", top: 0, background: "#0d1018", zIndex: 50 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#f0ece0" }}>hand<span style={{ color: "#e05c2a" }}>off</span></span>
            <span style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace" }}>beta</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {user ? (
              <>
                <button onClick={() => setShowPremium(true)} style={{ background: "linear-gradient(135deg, #e05c2a, #c9a12a)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, padding: "8px 14px", cursor: "pointer" }}>⚡ Premium</button>
                <button onClick={handlePostClick} style={{ background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, padding: "9px 20px", cursor: "pointer" }}>+ I'm leaving</button>
                <button onClick={handleSignOut} style={{ background: "transparent", border: "1.5px solid #252b3b", borderRadius: 10, color: "#555e7a", fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "8px 14px", cursor: "pointer" }}>Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)} style={{ background: "transparent", border: "1.5px solid #252b3b", borderRadius: 10, color: "#8a93b0", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, padding: "9px 16px", cursor: "pointer" }}>Sign in</button>
                <button onClick={handlePostClick} style={{ background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, padding: "9px 20px", cursor: "pointer" }}>+ I'm leaving</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: "#f0ece0", lineHeight: 1.15, margin: "0 0 16px" }}>
            Jobs before they're<br /><span style={{ color: "#e05c2a" }}>even advertised.</span>
          </h1>
          <p style={{ color: "#8a93b0", fontSize: 16, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 520 }}>
            Indeed shows you what companies want you to know.<br />
            <strong style={{ color: "#f0ece0" }}>Handoff shows you what the person who actually did the job wants you to know.</strong>
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
            {[{ icon: "⚡", text: "Before it's advertised" }, { icon: "🤝", text: "Real insider notes" }, { icon: "🎯", text: "Zero competition" }].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, background: "#141822", border: "1.5px solid #252b3b", borderRadius: 20, padding: "8px 16px" }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "#b0b8cc", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { step: "01", title: "Someone leaves", desc: "They post anonymously — role, location, when they're going, and the real story." },
            { step: "02", title: "You get alerted", desc: "Instant notification before the job hits Indeed, LinkedIn or any job board." },
            { step: "03", title: "You go first", desc: "Research the role, reach out, and apply before anyone else even knows." },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ background: "#141822", border: "1.5px solid #1a1f2e", borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#e05c2a", marginBottom: 8 }}>{step}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#f0ece0", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#555e7a", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" as const }}>
          <input style={{ flex: 1, minWidth: 180, background: "#141822", border: "1.5px solid #252b3b", borderRadius: 10, padding: "10px 14px", color: "#f0ece0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none" }} placeholder="🔍  Search role or location..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 24 }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)} style={{ background: sector === s ? "#e05c2a" : "#141822", border: `1.5px solid ${sector === s ? "#e05c2a" : "#252b3b"}`, color: sector === s ? "#fff" : "#8a93b0", borderRadius: 8, padding: "8px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.15s" }}>{s}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 28, padding: "14px 20px", background: "#141822", borderRadius: 12, border: "1.5px solid #1a1f2e" }}>
          {[{ label: "Live posts", value: posts.length }, { label: "Healthcare", value: posts.filter(p => p.sector === "Healthcare").length }, { label: "This week", value: posts.length }].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#e05c2a", fontFamily: "'Playfair Display', serif" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#555e7a", fontFamily: "'DM Mono', monospace" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: "center" as const, color: "#555e7a", padding: "60px 0", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>Loading posts...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center" as const, color: "#555e7a", padding: "60px 0", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
              No posts yet in this sector.<br />
              <span onClick={handlePostClick} style={{ color: "#e05c2a", cursor: "pointer" }}>Be the first to post a handoff →</span>
            </div>
          ) : filtered.map(post => (
            <Card key={post.id} post={post} onSave={handleSave} savedIds={savedIds} />
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "36px 32px", background: "#141822", border: "1.5px solid #252b3b", borderRadius: 16, textAlign: "center" as const }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0ece0", marginBottom: 8 }}>Leaving a role soon?</div>
          <div style={{ fontSize: 14, color: "#555e7a", marginBottom: 8, lineHeight: 1.6 }}>Pass the torch. Give someone the inside track.<br /><strong style={{ color: "#8a93b0" }}>Anonymous. Free. 60 seconds.</strong></div>
          <div style={{ fontSize: 12, color: "#3a4255", marginBottom: 24 }}>This is what Indeed can never have — the honest story from someone who actually did the job.</div>
          <button onClick={handlePostClick} style={{ background: "#e05c2a", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, padding: "13px 36px", cursor: "pointer" }}>Post your handoff →</button>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={(u) => setUser(u)} />}
      {showForm && user && <PostForm onPost={fetchPosts} onClose={() => setShowForm(false)} user={user} />}
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </div>
  );
}
