import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import {
  Leaf, Bell, BarChart3, CreditCard, Users, Truck, CheckCircle2, ArrowRight,
  Brain, Zap, Shield, X, AlertTriangle, Navigation, Smartphone, Calendar,
  Building2, Radio, Mail, Clock, TrendingUp, MessageSquare, UserCheck,
  Package, Wrench, Star, ChevronDown, Activity, LayoutDashboard, Banknote,
  FileText, Route, MapPin, ScanLine, BarChart2, Trash2,Phone
} from "lucide-react";

/* ─── Bin + map data (Islamabad, F-7 / F-8 sectors) ────────────────────── */
const BINS = [
  { id: "B-01", pos: [33.7320, 73.0580], pct: 94, area: "F-6/3, Islamabad" },
  { id: "B-02", pos: [33.7180, 73.0420], pct: 67, area: "F-8/4" },
  { id: "B-03", pos: [33.7290, 73.0390], pct: 22, area: "F-7/3" },
  { id: "B-04", pos: [33.7160, 73.0570], pct: 48, area: "F-9 Sector" },
  { id: "B-05", pos: [33.7130, 73.0490], pct: 13, area: "F-8 Markaz" },
  { id: "B-06", pos: [33.7340, 73.0460], pct: 82, area: "F-6/2" },
];
const DEPOT = [33.7110, 73.0430];
const MAP_CENTER = [33.7225, 73.0495];

function binColor(pct) {
  if (pct > 80) return "#dc2626";
  if (pct > 55) return "#d97706";
  return "#16a34a";
}

// Interpolate between a list of road waypoints
function makeRouteFromWaypoints(waypoints) {
  const pts = [];
  for (let w = 0; w < waypoints.length - 1; w++) {
    const [ax, ay] = waypoints[w];
    const [bx, by] = waypoints[w + 1];
    const N = 12;
    for (let i = w === 0 ? 0 : 1; i <= N; i++) {
      pts.push([ax + (bx - ax) * i / N, ay + (by - ay) * i / N]);
    }
  }
  return pts;
}

// Road-following routes — Depot (F-8 south) → Khayaban-e-Iqbal → Kohsar Rd → F-6/3
const ROUTE_TO_TARGET = makeRouteFromWaypoints([
  [33.7110, 73.0430], // Depot
  [33.7110, 73.0490], // East on local road
  [33.7200, 73.0490], // North on Khayaban-e-Iqbal
  [33.7200, 73.0545], // East on F-7/F-6 boundary road
  [33.7320, 73.0545], // North on Kohsar Road
  [33.7320, 73.0580], // East into F-6/3
]);

const ROUTE_TO_DEPOT = makeRouteFromWaypoints([
  [33.7320, 73.0580], // From B-01
  [33.7320, 73.0545], // West out of F-6/3
  [33.7200, 73.0545], // South on Kohsar Road
  [33.7200, 73.0490], // West on F-7/F-6 boundary
  [33.7110, 73.0490], // South on Khayaban-e-Iqbal
  [33.7110, 73.0430], // Return to Depot
]);

function createBinIcon(pct) {
  const c = pct > 80 ? "#dc2626" : pct > 55 ? "#d97706" : "#16a34a";
  const bg = pct > 80 ? "#fef2f2" : pct > 55 ? "#fffbeb" : "#f0fdf4";
  const fillH = Math.max(3, Math.round(18 * pct / 100));
  const fillY = 11 + (18 - fillH);
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.22))"><svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="0" width="10" height="4" rx="2" fill="${c}"/><rect x="2" y="3" width="24" height="5" rx="2.5" fill="${c}"/><rect x="4" y="8" width="20" height="22" rx="3" fill="${bg}" stroke="${c}" stroke-width="1.5"/><rect x="6" y="${fillY}" width="16" height="${fillH}" rx="2" fill="${c}" opacity="0.85"/><line x1="11" y1="10" x2="11" y2="28" stroke="${c}" stroke-width="0.8" opacity="0.35"/><line x1="17" y1="10" x2="17" y2="28" stroke="${c}" stroke-width="0.8" opacity="0.35"/><polygon points="14,36 10,30 18,30" fill="${c}"/></svg></div>`,
    iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38], className: "",
  });
}

function createTruckIcon(active = false) {
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 2px 6px rgba(98,77,227,0.4))"><svg width="40" height="28" viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="4" width="26" height="18" rx="3" fill="#624DE3" stroke="white" stroke-width="1.5"/><rect x="24" y="8" width="16" height="14" rx="3" fill="#7c6fe0" stroke="white" stroke-width="1.5"/><rect x="26" y="10" width="12" height="7" rx="1.5" fill="rgba(255,255,255,0.45)"/><circle cx="8" cy="24" r="4" fill="#1e293b" stroke="white" stroke-width="1.5"/><circle cx="8" cy="24" r="1.5" fill="white"/><circle cx="20" cy="24" r="4" fill="#1e293b" stroke="white" stroke-width="1.5"/><circle cx="20" cy="24" r="1.5" fill="white"/><circle cx="32" cy="24" r="4" fill="#1e293b" stroke="white" stroke-width="1.5"/><circle cx="32" cy="24" r="1.5" fill="white"/>${active ? `<circle cx="37" cy="5" r="3" fill="#16a34a"><animate attributeName="opacity" values="1;0.15;1" dur="0.9s" repeatCount="indefinite"/></circle>` : ""}</svg></div>`,
    iconSize: [40, 28], iconAnchor: [20, 24], popupAnchor: [0, -26], className: "",
  });
}

/* ─── Intersection observer ─────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.4);
  const ran = useRef(false);
  useEffect(() => {
    if (!visible || ran.current) return;
    ran.current = true;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1800, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(ease * end));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Reveal wrapper ─────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {}, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Section pill label ─────────────────────────────────────────────────── */
function Pill({ children, color = "#624DE3" }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: `${color}0f`, border: `1px solid ${color}28`,
      borderRadius: 999, padding: "5px 14px",
      fontSize: 11, fontWeight: 700, color,
      letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 18,
    }}>
      {children}
    </div>
  );
}

/* ─── Live map demo ──────────────────────────────────────────────────────── */
function LiveMap() {
  const [truckPos, setTruckPos] = useState(DEPOT);
  const [binPcts, setBinPcts] = useState(BINS.map(b => b.pct));
  const [phase, setPhase] = useState("idle");
  const [notif, setNotif] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const animRef = useRef(null);
  const cancelRef = useRef(false);

  // Start with precomputed grid waypoints; OSRM upgrades silently in background
  const routeRef = useRef({ toTarget: ROUTE_TO_TARGET, toDepot: ROUTE_TO_DEPOT });

  useEffect(() => {
    const ctrl = new AbortController();
    const fetchRoute = async (from, to) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        if (data.routes?.[0]) return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      } catch (_) { /* silent fallback to precomputed */ }
      return null;
    };
    Promise.all([fetchRoute(DEPOT, BINS[0].pos), fetchRoute(BINS[0].pos, DEPOT)]).then(([r1, r2]) => {
      if (r1) routeRef.current.toTarget = r1;
      if (r2) routeRef.current.toDepot = r2;
    });
    return () => ctrl.abort();
  }, []);

  const binIcons  = useMemo(() => BINS.map((_, i) => createBinIcon(binPcts[i])), [binPcts]);
  const truckIcon = useMemo(() => createTruckIcon(phase === "enroute" || phase === "collecting"), [phase]);

  const animateAlong = useCallback((coords, ms) => new Promise(resolve => {
    const start = performance.now();
    const tick = (now) => {
      if (cancelRef.current) { resolve(); return; }
      const t = Math.min((now - start) / ms, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const raw = ease * (coords.length - 1);
      const lo = Math.floor(raw), hi = Math.min(lo + 1, coords.length - 1);
      const s = raw - lo;
      setTruckPos([coords[lo][0] + (coords[hi][0] - coords[lo][0]) * s, coords[lo][1] + (coords[hi][1] - coords[lo][1]) * s]);
      if (t < 1) { animRef.current = requestAnimationFrame(tick); }
      else { setTruckPos(coords[coords.length - 1]); resolve(); }
    };
    animRef.current = requestAnimationFrame(tick);
  }), []);

  const wait = useCallback((ms) => new Promise(r => setTimeout(r, ms)), []);

  useEffect(() => {
    cancelRef.current = false;
    const run = async () => {
      while (!cancelRef.current) {
        await wait(2500);
        if (cancelRef.current) break;
        setPhase("alerting"); setNotif({ color: "#dc2626", text: "Bin B-01 at 94% — alert triggered" });
        await wait(2000); if (cancelRef.current) break;
        setPhase("dispatching"); setNotif({ color: "#624DE3", text: "Nearest driver dispatched to B-01" }); setRouteCoords(routeRef.current.toTarget);
        await wait(700); if (cancelRef.current) break;
        setPhase("enroute"); setNotif({ color: "#624DE3", text: "Driver en route — ETA 4 min" });
        await animateAlong(routeRef.current.toTarget, 5000); if (cancelRef.current) break;
        setPhase("collecting"); setNotif({ color: "#d97706", text: "On site — collecting waste" }); setRouteCoords([]);
        await wait(1800); if (cancelRef.current) break;
        setBinPcts(p => p.map((v, i) => i === 0 ? 9 : v));
        setPhase("done"); setNotif({ color: "#16a34a", text: "B-01 emptied — collection logged" });
        await wait(2000); if (cancelRef.current) break;
        setPhase("returning"); setNotif(null); setRouteCoords(routeRef.current.toDepot);
        await animateAlong(routeRef.current.toDepot, 3800); if (cancelRef.current) break;
        setRouteCoords([]); setPhase("idle"); setBinPcts(BINS.map(b => b.pct));
        await wait(1500);
      }
    };
    run();
    return () => { cancelRef.current = true; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animateAlong, wait]);

  const NOTIF_COLORS = {
    "#dc2626": { bg: "#fef2f2", border: "#fecaca" },
    "#624DE3": { bg: "#f5f3ff", border: "#ddd6fe" },
    "#d97706": { bg: "#fffbeb", border: "#fde68a" },
    "#16a34a": { bg: "#f0fdf4", border: "#bbf7d0" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ height: 40, display: "flex", alignItems: "center" }}>
        {notif && (() => {
          const c = NOTIF_COLORS[notif.color] || NOTIF_COLORS["#624DE3"];
          return (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 500, color: "#1a1a2e", animation: "gg-fadein 0.3s ease" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: notif.color, flexShrink: 0 }} />
              {notif.text}
            </div>
          );
        })()}
      </div>

      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(98,77,227,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", height: 460, position: "relative" }}>
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, background: "rgba(255,255,255,0.95)", border: "1px solid rgba(98,77,227,0.15)", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", animation: "gg-blink 1.4s ease-in-out infinite" }} />
          Live Demo
        </div>
        <MapContainer center={MAP_CENTER} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" />
          {routeCoords.length > 1 && <Polyline positions={routeCoords} pathOptions={{ color: "#624DE3", weight: 3, opacity: 0.65, dashArray: "8 5" }} />}
          {BINS.map((bin, i) => (
            <Marker key={bin.id} position={bin.pos} icon={binIcons[i]}>
              <Popup>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 13, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, color: "#0f0c1e", marginBottom: 4 }}>{bin.id} — {bin.area}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${binPcts[i]}%`, height: "100%", background: binColor(binPcts[i]), borderRadius: 3 }} />
                    </div>
                    <span style={{ fontWeight: 700, color: binColor(binPcts[i]), fontSize: 13 }}>{binPcts[i]}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>{binPcts[i] > 80 ? "Collection required" : binPcts[i] > 55 ? "Filling up" : "Normal"}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          <Marker position={truckPos} icon={truckIcon} />
        </MapContainer>
      </div>

      <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#6b7280", flexWrap: "wrap" }}>
        {[{ color: "#16a34a", label: "Normal (<55%)" }, { color: "#d97706", label: "Filling (55–80%)" }, { color: "#dc2626", label: "Full (>80%)" }, { color: "#624DE3", label: "Driver" }].map(({ color, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    ["#problem", "Problem"], ["#platform", "Platform"],
    ["#features", "Features"], ["#about", "About"], ["#contact", "Contact"],
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(98,77,227,0.1)",
      boxShadow: scrolled ? "0 1px 16px rgba(98,77,227,0.08)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#624DE3", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(98,77,227,0.3)" }}>
            <Leaf size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 16, color: "#0f0c1e", letterSpacing: "-0.3px" }}>GreenGuardian</span>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 13.5, fontWeight: 500 }} className="gg-navlinks">
          {links.map(([href, label]) => (
            <a key={href} href={href} style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#624DE3"} onMouseLeave={e => e.target.style.color = "#6b7280"}>
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/signin" style={{ fontSize: 13.5, fontWeight: 600, color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "#624DE3"} onMouseLeave={e => e.target.style.color = "#6b7280"}>
            Sign in
          </Link>
          <Link to="/signin" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#624DE3", borderRadius: 9, padding: "9px 20px", fontSize: 13.5, fontWeight: 700, color: "#fff", textDecoration: "none", boxShadow: "0 2px 10px rgba(98,77,227,0.3)", transition: "opacity 0.2s,transform 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}>
            Get Started <ArrowRight size={13} />
          </Link>
          <button onClick={() => setMenuOpen(o => !o)} className="gg-ham"
            style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "none", padding: 4 }}>
            {menuOpen ? <X size={20} /> : <Activity size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div style={{ borderTop: "1px solid rgba(98,77,227,0.1)", padding: "14px 28px", display: "flex", flexDirection: "column", gap: 14, background: "rgba(255,255,255,0.98)" }}>
          {links.map(([href, label]) => (
            <a key={href} href={href} style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <Link to="/signin" style={{ background: "#624DE3", borderRadius: 10, padding: 12, textAlign: "center", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Get Started</Link>
        </div>
      )}
      <style>{`@media(max-width:768px){.gg-navlinks{display:none!important}.gg-ham{display:flex!important}}`}</style>
    </nav>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────────── */
function Hero() {
  const [ref, visible] = useInView(0.05);
  return (
    <section style={{ minHeight: "100vh", paddingTop: 64, background: "linear-gradient(145deg, rgba(98,77,227,0.09) 0%, #ffffff 55%)", display: "flex", alignItems: "center" }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 28px 72px", display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 64, alignItems: "center", width: "100%" }} className="gg-hero-grid">
        {/* Copy */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: "all 0.75s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 999, padding: "5px 14px", marginBottom: 26 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", animation: "gg-blink 1.5s ease-in-out infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", letterSpacing: "0.5px" }}>Smart Waste Management Platform</span>
          </div>

          <h1 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(36px,4.2vw,60px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 20, color: "#0f0c1e" }}>
            Cleaner societies,{" "}
            <span style={{ color: "#624DE3" }}>smarter</span>{" "}collection.
          </h1>

          <p style={{ fontSize: 16.5, color: "#64748b", lineHeight: 1.8, maxWidth: 460, marginBottom: 36 }}>
            GreenGuardian monitors waste bins in real-time, auto-dispatches drivers when bins fill up, manages resident services, and delivers end-to-end analytics — all from one platform.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <Link to="/signin" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#624DE3", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", boxShadow: "0 4px 20px rgba(98,77,227,0.3)", transition: "opacity 0.2s,transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Get Started <ArrowRight size={15} />
            </Link>
            <a href="#platform" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(98,77,227,0.25)", borderRadius: 10, padding: "13px 26px", fontSize: 15, fontWeight: 600, color: "#624DE3", textDecoration: "none", transition: "border-color 0.2s,background 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(98,77,227,0.5)"; e.currentTarget.style.background = "rgba(98,77,227,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(98,77,227,0.25)"; e.currentTarget.style.background = "#fff"; }}>
              See the platform <ChevronDown size={15} />
            </a>
          </div>

          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {[
              { icon: Radio, label: "Real-time monitoring", color: "#16a34a" },
              { icon: Zap, label: "Smart auto-dispatch", color: "#624DE3" },
              { icon: Shield, label: "MFA secured", color: "#d97706" },
              { icon: Smartphone, label: "Mobile apps included", color: "#0891b2" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#6b7280", fontWeight: 500 }}>
                <Icon size={13} color={color} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Live Map */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: "all 0.85s ease 0.2s" }}>
          <LiveMap />
        </div>
      </div>
      <style>{`@media(max-width:900px){.gg-hero-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

/* ─── STATS BAR ──────────────────────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { end: 500, suffix: "+", label: "Bins Monitored" },
    { end: 98, suffix: "%", label: "Collection Efficiency" },
    { end: 15, suffix: " min", label: "Avg Response Time" },
    { end: 10, suffix: "+", label: "Societies Managed" },
    { end: 24, suffix: "/7", label: "Live Uptime" },
  ];
  return (
    <div style={{ background: "#f7f6fe", borderTop: "1px solid rgba(98,77,227,0.08)", borderBottom: "1px solid rgba(98,77,227,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 32, textAlign: "center" }}>
        {stats.map(s => (
          <Reveal key={s.label}>
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 36, fontWeight: 800, lineHeight: 1.1, color: "#624DE3" }}>
              <Counter end={s.end} suffix={s.suffix} />
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6, fontWeight: 500 }}>{s.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ─── PROBLEM ────────────────────────────────────────────────────────────── */
function ProblemSection() {
  const [ref, visible] = useInView();
  const problems = [
    { icon: Trash2, title: "Bins overflow before anyone notices", desc: "Collection crews follow fixed schedules, not actual fill data. Bins overflow between visits causing hygiene issues, complaints, and reputational damage to the society.", color: "#dc2626" },
    { icon: Clock, title: "Manual dispatch wastes hours daily", desc: "Supervisors assign tasks via phone calls. No visibility into driver location, active workload, or task progress — leading to missed bins, duplication, and zero accountability.", color: "#d97706" },
    { icon: BarChart2, title: "No data, no improvement", desc: "Without operational analytics, management can't identify chronic problem areas, measure driver performance, or prove service quality to residents. Every decision is reactive.", color: "#7c3aed" },
  ];
  return (
    <section id="problem" style={{ padding: "96px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
        <Pill color="#dc2626">The Problem</Pill>
        <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(26px,3.2vw,42px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, color: "#0f0c1e", marginBottom: 14 }}>
          Waste management is broken<br />at the last mile.
        </h2>
        <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
          Residential societies face the same operational failures every day — and the cost is borne by residents in overflowing bins and degraded service quality.
        </p>
      </Reveal>
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        {problems.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={p.title} style={{
              background: "#fff", border: `1px solid ${p.color}1a`,
              borderRadius: 16, padding: "28px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color}0d`, border: `1px solid ${p.color}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon size={22} color={p.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f0c1e", marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{p.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────────────────── */
function HowItWorks() {
  const [ref, visible] = useInView();
  const steps = [
    { n: "01", icon: ScanLine, title: "Sensor detects fill level", desc: "IoT sensors on every bin report fill percentages to the cloud dashboard continuously, in real-time." },
    { n: "02", icon: Bell, title: "Threshold alert triggered", desc: "When a bin exceeds the configured threshold, an instant alert is raised on the admin dashboard and mobile." },
    { n: "03", icon: Truck, title: "Driver auto-dispatched", desc: "System scores nearby drivers by distance and active workload, assigns the best match automatically." },
    { n: "04", icon: CheckCircle2, title: "Collection confirmed", desc: "Driver marks complete from the app. Bin resets, collection logged with timestamp and GPS coordinates." },
  ];
  return (
    <div style={{ background: "#f7f6fe", borderTop: "1px solid rgba(98,77,227,0.07)", borderBottom: "1px solid rgba(98,77,227,0.07)", padding: "96px 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 60 }}>
          <Pill>The Workflow</Pill>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(26px,3.2vw,42px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, color: "#0f0c1e", marginBottom: 12 }}>
            From full bin to clean street —<br /><span style={{ color: "#624DE3" }}>fully automated.</span>
          </h2>
        </Reveal>
        <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} style={{
                background: "#fff", border: "1px solid rgba(98,77,227,0.1)", borderRadius: 16, padding: "28px 22px", textAlign: "center", position: "relative",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
              }}>
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#c4b5fd", marginBottom: 16 }}>{s.n}</span>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(98,77,227,0.08)", border: "1px solid rgba(98,77,227,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Icon size={22} color="#624DE3" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f0c1e", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{s.desc}</p>
                {i < 3 && <div style={{ position: "absolute", top: "50%", right: -10, transform: "translateY(-50%)", color: "#c4b5fd" }}><ArrowRight size={16} /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── PLATFORM (3 APPS) ──────────────────────────────────────────────────── */
function PlatformSection() {
  return (
    <section id="platform" style={{ padding: "96px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 72 }}>
        <Pill>The Platform</Pill>
        <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(26px,3.2vw,42px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, color: "#0f0c1e", marginBottom: 14 }}>
          Three apps, one ecosystem.
        </h2>
        <p style={{ fontSize: 16, color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
          GreenGuardian ships as a complete suite — a web dashboard for admins, and native mobile apps for drivers and residents.
        </p>
      </Reveal>

      {/* Admin Dashboard */}
      <Reveal style={{ marginBottom: 72 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="gg-app-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(98,77,227,0.08)", border: "1px solid rgba(98,77,227,0.18)", borderRadius: 999, padding: "5px 14px", marginBottom: 22 }}>
              <LayoutDashboard size={12} color="#624DE3" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#624DE3", letterSpacing: "0.8px", textTransform: "uppercase" }}>Admin Web Dashboard</span>
            </div>
            <h3 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(20px,2.5vw,30px)", fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.15, color: "#0f0c1e", marginBottom: 14 }}>
              Full operational control from one screen.
            </h3>
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.8, marginBottom: 24 }}>
              An interactive map shows every bin's fill level and every driver's live GPS position. Assign tasks, manage staff, track payments, and respond to alerts — all in real-time.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: MapPin, text: "Live Leaflet map — bin fill levels + driver GPS" },
                { icon: Truck, text: "Manual and auto task assignment" },
                { icon: Users, text: "Staff management with performance metrics" },
                { icon: Bell, text: "Configurable alerts with escalation rules" },
                { icon: Brain, text: "AI sentiment analysis via Google Gemini" },
                { icon: CreditCard, text: "Stripe payment dues management" },
                { icon: BarChart3, text: "Analytics + Excel export" },
                { icon: MessageSquare, text: "In-app messaging with residents" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(98,77,227,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={12} color="#624DE3" />
                  </div>
                  <span style={{ fontSize: 13.5, color: "#6b7280" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Dashboard mockup card */}
          <div style={{ background: "#fff", border: "1px solid rgba(98,77,227,0.12)", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 32px rgba(98,77,227,0.08), 0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ background: "#f7f6fe", borderBottom: "1px solid rgba(98,77,227,0.08)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 7 }}>
              {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
              <span style={{ fontSize: 10.5, color: "#9ca3af", marginLeft: 6 }}>GreenGuardian — Admin Dashboard</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid rgba(98,77,227,0.07)" }}>
              {[{ label: "Total Bins", value: "24", color: "#624DE3" }, { label: "Needs Collection", value: "3", color: "#dc2626" }, { label: "Active Drivers", value: "5", color: "#16a34a" }, { label: "Tasks Today", value: "12", color: "#d97706" }].map(s => (
                <div key={s.label} style={{ padding: "14px 10px", textAlign: "center", borderRight: "1px solid rgba(98,77,227,0.07)" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "Montserrat,sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Bin Status</div>
              {[{ id: "B-01", area: "Gulberg III", pct: 94 }, { id: "B-06", area: "Hussain Chowk", pct: 82 }, { id: "B-02", area: "MM Alam Rd", pct: 67 }, { id: "B-04", area: "Main Blvd", pct: 48 }].map(b => {
                const c = b.pct > 80 ? "#dc2626" : b.pct > 55 ? "#d97706" : "#16a34a";
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: "#374151", flex: 1, fontWeight: 500 }}>{b.id} · {b.area}</span>
                    <div style={{ width: 72, height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${b.pct}%`, height: "100%", background: c, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: c, width: 30, textAlign: "right" }}>{b.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      <div style={{ borderTop: "1px solid rgba(98,77,227,0.08)", marginBottom: 72 }} />

      {/* Resident + Driver */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }} className="gg-apps-row">
        {/* Resident App */}
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.18)", borderRadius: 999, padding: "5px 14px", marginBottom: 22 }}>
            <Smartphone size={12} color="#16a34a" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", letterSpacing: "0.8px", textTransform: "uppercase" }}>Resident Mobile App</span>
          </div>
          <h3 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(18px,2vw,26px)", fontWeight: 800, letterSpacing: -0.8, color: "#0f0c1e", marginBottom: 12 }}>Residents stay informed and in control.</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, marginBottom: 24 }}>
            Every household gets a direct channel to the society's waste operations. Book services, pay dues, raise complaints, and track collection schedules.
          </p>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* <Phone>
              <div style={{ padding: "0 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div><div style={{ fontSize: 9.5, color: "#9ca3af" }}>Good morning,</div><div style={{ fontSize: 13, fontWeight: 700, color: "#0f0c1e" }}>Ali Hassan</div></div>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#624DE3", display: "flex", alignItems: "center", justifyContent: "center" }}><Bell size={12} color="#fff" /></div>
                </div>
                <div style={{ background: "rgba(98,77,227,0.07)", border: "1px solid rgba(98,77,227,0.12)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 9.5, color: "#624DE3", fontWeight: 700, marginBottom: 3 }}>Next Collection</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f0c1e" }}>Wednesday, 8:00 AM</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>Block C — Zone 3</div>
                </div>
                {[
                  { icon: CreditCard, label: "Pay Dues", badge: "PKR 2,500", badgeColor: "#dc2626" },
                  { icon: Calendar, label: "Book Service", badge: "Available", badgeColor: "#16a34a" },
                  { icon: MessageSquare, label: "Feedback", badge: null },
                  { icon: FileText, label: "My Requests", badge: "1 active", badgeColor: "#d97706" },
                ].map(({ icon: Icon, label, badge, badgeColor }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderBottom: "1px solid rgba(98,77,227,0.06)" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(98,77,227,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={11} color="#624DE3" /></div>
                    <span style={{ fontSize: 11.5, color: "#374151", flex: 1, fontWeight: 500 }}>{label}</span>
                    {badge && <span style={{ fontSize: 9, fontWeight: 700, color: badgeColor, background: `${badgeColor}0f`, borderRadius: 4, padding: "2px 6px" }}>{badge}</span>}
                  </div>
                ))}
              </div>
            </Phone> */}
            <div style={{ flex: 1 }}>
              {["View real-time collection schedule","Pay monthly dues via Stripe","Book bulk waste or special pickup","Submit service complaints","Track complaint resolution status","Rate and review collection quality"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 11 }}>
                  <CheckCircle2 size={13} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Driver App */}
        <Reveal delay={0.12}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(98,77,227,0.07)", border: "1px solid rgba(98,77,227,0.18)", borderRadius: 999, padding: "5px 14px", marginBottom: 22 }}>
            <Truck size={12} color="#624DE3" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#624DE3", letterSpacing: "0.8px", textTransform: "uppercase" }}>Driver Mobile App</span>
          </div>
          <h3 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(18px,2vw,26px)", fontWeight: 800, letterSpacing: -0.8, color: "#0f0c1e", marginBottom: 12 }}>Drivers get tasks instantly, on the go.</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, marginBottom: 24 }}>
            Tasks arrive automatically. Drivers navigate to bins, confirm collection on-site, and their live location is shared with the admin in real-time.
          </p>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* <Phone>
              <div style={{ padding: "0 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f0c1e" }}>Active Task</div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.08)", borderRadius: 5, padding: "2px 8px" }}>ASSIGNED</span>
                </div>
                <div style={{ background: "rgba(98,77,227,0.07)", border: "1px solid rgba(98,77,227,0.15)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#624DE3", marginBottom: 5 }}>Bin B-01 — Full (94%)</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>Gulberg III, Liberty Chowk</div>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div style={{ fontSize: 11, color: "#374151" }}><span style={{ color: "#624DE3", fontWeight: 700 }}>0.8 km</span></div>
                    <div style={{ fontSize: 11, color: "#374151" }}><span style={{ color: "#624DE3", fontWeight: 700 }}>4 min</span> ETA</div>
                  </div>
                </div>
                <div style={{ height: 80, background: "rgba(98,77,227,0.04)", borderRadius: 10, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(98,77,227,0.1)", position: "relative" }}>
                  <MapPin size={18} color="#624DE3" />
                  <span style={{ position: "absolute", bottom: 8, right: 10, fontSize: 9, color: "#9ca3af" }}>Live Map</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#624DE3", borderRadius: 10, padding: "10px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>Navigate</div>
                  <div style={{ background: "#f7f6fe", border: "1px solid rgba(98,77,227,0.15)", borderRadius: 10, padding: "10px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#624DE3" }}>Details</div>
                </div>
              </div>
            </Phone> */}
            <div style={{ flex: 1 }}>
              {["Receive task notifications automatically","One-tap navigation to bin","Live GPS shared with admin","Mark collection complete on-site","View daily task history","Biometric login support"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 11 }}>
                  <CheckCircle2 size={13} color="#624DE3" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`@media(max-width:900px){.gg-app-grid,.gg-apps-row{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

/* ─── SERVICE BOOKING ────────────────────────────────────────────────────── */
function ServiceBooking() {
  const services = [
    { icon: Package, title: "Bulk Waste Pickup", desc: "Schedule removal of large items — furniture, appliances, renovation debris — on a chosen date.", color: "#d97706" },
    { icon: Wrench, title: "Special Area Cleaning", desc: "Book a dedicated cleaning crew for areas outside standard routes — parking, rooftops, common areas.", color: "#16a34a" },
    { icon: FileText, title: "Document Disposal", desc: "Secure collection and disposal of sensitive documents with a confirmation receipt on completion.", color: "#624DE3" },
    { icon: UserCheck, title: "Live Booking Tracking", desc: "Every booking has a real-time status — Scheduled, En Route, In Progress, Completed — visible in the app.", color: "#0891b2" },
  ];
  return (
    <div style={{ background: "#f7f6fe", borderTop: "1px solid rgba(98,77,227,0.07)", borderBottom: "1px solid rgba(98,77,227,0.07)", padding: "96px 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 56, alignItems: "center" }} className="gg-booking-grid">
          <Reveal>
            <Pill color="#d97706">Service Booking</Pill>
            <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(24px,2.8vw,36px)", fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.15, color: "#0f0c1e", marginBottom: 14 }}>
              On-demand services,<br />booked in seconds.
            </h2>
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.8, marginBottom: 28 }}>
              Beyond regular collection, residents request specialized services directly from the app. Each booking is tracked end-to-end, with Stripe-powered online payment.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Book in-app","Pay via Stripe","Track live status"].map(t => (
                <div key={t} style={{ background: "#fff", border: "1px solid rgba(98,77,227,0.15)", borderRadius: 9, padding: "9px 16px", fontSize: 13, color: "#624DE3", fontWeight: 600 }}>{t}</div>
              ))}
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.07}>
                  <div style={{ background: "#fff", border: "1px solid rgba(98,77,227,0.1)", borderRadius: 14, padding: "22px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}0d`, border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <Icon size={18} color={s.color} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f0c1e", marginBottom: 7 }}>{s.title}</div>
                    <div style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.65 }}>{s.desc}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.gg-booking-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* ─── FEATURES ───────────────────────────────────────────────────────────── */
function FeaturesSection() {
  const [ref, visible] = useInView();
  const features = [
    { icon: Radio, title: "Real-time Bin Monitoring", desc: "Sensor data streams fill levels to the dashboard continuously. Every bin, every minute, with color-coded status.", color: "#16a34a" },
    { icon: MapPin, title: "Live Driver Tracking", desc: "Admin map shows exact driver GPS positions with task overlays and ETAs.", color: "#624DE3" },
    { icon: Zap, title: "Smart Auto-Assignment", desc: "Proximity × workload scoring picks the optimal driver automatically — no manual calls.", color: "#d97706" },
    { icon: Brain, title: "AI Sentiment Analysis", desc: "Google Gemini processes resident feedback to extract trends, flag issues, and score service quality.", color: "#7c3aed" },
    { icon: CreditCard, title: "Stripe Payments", desc: "Monthly dues billed via Stripe. Webhooks keep payment records in sync in real-time.", color: "#0891b2" },
    { icon: Building2, title: "Multi-Society Management", desc: "Super-admin oversees all societies from one dashboard with per-society isolation.", color: "#624DE3" },
    { icon: Shield, title: "MFA & Role Security", desc: "TOTP two-factor auth. Roles: super_admin, admin, sub_admin, driver, resident — each scoped precisely.", color: "#dc2626" },
    { icon: TrendingUp, title: "Analytics & Exports", desc: "Collection frequency, driver performance, and payment reports — exportable to Excel.", color: "#16a34a" },
    { icon: Bell, title: "Configurable Alerts", desc: "Per-bin fill thresholds, escalation rules, and notification preferences for web and mobile.", color: "#d97706" },
  ];
  return (
    <section id="features" style={{ padding: "96px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
        <Pill>Platform Features</Pill>
        <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(26px,3.2vw,42px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, color: "#0f0c1e", marginBottom: 12 }}>
          Everything a modern waste operation needs.
        </h2>
        <p style={{ fontSize: 16, color: "#64748b", maxWidth: 480, margin: "0 auto" }}>
          One integrated platform covering monitoring, dispatch, payments, analytics, and communication.
        </p>
      </Reveal>
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="gg-feat-grid">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={f.title} style={{
              background: "#fff", border: "1px solid rgba(98,77,227,0.1)", borderRadius: 16, padding: "24px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              transition: "transform 0.2s ease,border-color 0.2s ease,box-shadow 0.2s ease",
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: `${i * 0.055}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(98,77,227,0.25)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(98,77,227,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(98,77,227,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 11, background: `${f.color}0d`, border: `1px solid ${f.color}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#0f0c1e", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
      <style>{`@media(max-width:900px){.gg-feat-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:600px){.gg-feat-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

/* ─── ABOUT ──────────────────────────────────────────────────────────────── */
function AboutSection() {
  return (
    <div id="about" style={{ background: "#f7f6fe", borderTop: "1px solid rgba(98,77,227,0.07)", borderBottom: "1px solid rgba(98,77,227,0.07)", padding: "96px 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="gg-about-grid">
        <Reveal>
          <Pill color="#16a34a">Who We Are</Pill>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(24px,2.8vw,36px)", fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.15, color: "#0f0c1e", marginBottom: 18 }}>
            A team solving a real urban problem.
          </h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.85, marginBottom: 18 }}>
            GreenGuardian is a Final Year Project built by a team of Computer Science students to modernize waste collection in Pakistan's residential societies.
          </p>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.85, marginBottom: 28 }}>
            We identified the gap between how waste management is done today — manually, reactively, with zero data — and how it could be done with the right technology. GreenGuardian is our answer: a production-grade, end-to-end platform that works.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { icon: LayoutDashboard, label: "Full-stack web platform", color: "#624DE3" },
              { icon: Smartphone, label: "Two native mobile apps", color: "#16a34a" },
              { icon: Brain, label: "AI-powered analytics", color: "#7c3aed" },
              { icon: Shield, label: "Production-grade security", color: "#d97706" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, background: "#fff", border: "1px solid rgba(98,77,227,0.1)", borderRadius: 10, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: 12.5, color: "#374151", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: Zap, label: "Tech Stack", items: ["React 19 + Vite (web)", "React Native + Expo (mobile)", "Node.js + Express (API)", "PostgreSQL + Knex.js", "Socket.IO real-time events", "Stripe + Google Gemini AI"], color: "#624DE3" },
              { icon: Star, label: "Key Differentiators", items: ["End-to-end automation", "Three integrated apps", "AI sentiment analysis", "Real-time GPS tracking", "Stripe-powered payments", "Multi-society architecture"], color: "#16a34a" },
            ].map(({ icon: Icon, label, items, color }) => (
              <div key={label} style={{ background: "#fff", border: "1px solid rgba(98,77,227,0.1)", borderRadius: 14, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}0d`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={color} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f0c1e" }}>{label}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {items.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#6b7280" }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <style>{`@media(max-width:900px){.gg-about-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* ─── CONTACT ────────────────────────────────────────────────────────────── */
function ContactSection() {
  return (
    <section id="contact" style={{ padding: "96px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }} className="gg-contact-grid">
        <Reveal>
          <Pill color="#0891b2">Contact</Pill>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(24px,2.8vw,36px)", fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.15, color: "#0f0c1e", marginBottom: 14 }}>Get in touch.</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.8, marginBottom: 28 }}>
            Interested in GreenGuardian for your society or have questions about the platform? Reach out — we'd love to connect.
          </p>
          {[{ icon: Mail, label: "Email", value: "hassanamir0506@gmail.com", color: "#624DE3" }, { icon: MapPin, label: "Location", value: "Islamabad, Pakistan", color: "#16a34a" }].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}0d`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.5px", marginBottom: 2 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={0.12}>
          <div style={{ background: "#fff", border: "1px solid rgba(98,77,227,0.12)", borderRadius: 18, padding: 30, boxShadow: "0 4px 20px rgba(98,77,227,0.07)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f0c1e", marginBottom: 22 }}>Send a message</h3>
            {[{ label: "Name", placeholder: "Your full name", type: "text" }, { label: "Email", placeholder: "your@email.com", type: "email" }].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} style={{ width: "100%", background: "#f9f8ff", border: "1.5px solid rgba(98,77,227,0.12)", borderRadius: 9, padding: "10px 13px", fontSize: 14, color: "#0f0c1e", outline: "none", boxSizing: "border-box", fontFamily: "Inter,sans-serif", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "rgba(98,77,227,0.45)"}
                  onBlur={e => e.target.style.borderColor = "rgba(98,77,227,0.12)"} />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Message</label>
              <textarea placeholder="Tell us about your society or your question..." rows={4} style={{ width: "100%", background: "#f9f8ff", border: "1.5px solid rgba(98,77,227,0.12)", borderRadius: 9, padding: "10px 13px", fontSize: 14, color: "#0f0c1e", outline: "none", resize: "vertical", fontFamily: "Inter,sans-serif", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "rgba(98,77,227,0.45)"}
                onBlur={e => e.target.style.borderColor = "rgba(98,77,227,0.12)"} />
            </div>
            <button style={{ width: "100%", background: "#624DE3", border: "none", borderRadius: 9, padding: 13, fontSize: 14.5, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "opacity 0.2s,transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Send Message
            </button>
          </div>
        </Reveal>
      </div>
      <style>{`@media(max-width:900px){.gg-contact-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <div style={{ padding: "0 28px 96px", maxWidth: 900, margin: "0 auto" }}>
      <Reveal>
        <div style={{ background: "linear-gradient(135deg, #624DE3 0%, #4f3ec8 100%)", borderRadius: 28, padding: "80px 48px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 24px 64px rgba(98,77,227,0.35)" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "35%", left: "8%", width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ width: 62, height: 62, borderRadius: 20, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 26px", border: "1px solid rgba(255,255,255,0.22)" }}>
            <Leaf size={28} color="#fff" />
          </div>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontSize: "clamp(26px,3.2vw,42px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, color: "#ffffff", marginBottom: 16 }}>
            Ready to transform your society's<br />waste management?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", maxWidth: 440, margin: "0 auto 38px", lineHeight: 1.85 }}>
            Sign in to the GreenGuardian dashboard and start managing waste collection intelligently — today.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signin" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#ffffff", borderRadius: 12, padding: "15px 36px", fontSize: 15.5, fontWeight: 700, color: "#624DE3", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", transition: "opacity 0.2s,transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}>
              Sign In to Dashboard <ArrowRight size={16} />
            </Link>
            <a href="#problem" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 12, padding: "15px 28px", fontSize: 15.5, fontWeight: 600, color: "#fff", textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}>
              Learn more
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(98,77,227,0.08)", padding: "32px 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "#624DE3", display: "flex", alignItems: "center", justifyContent: "center" }}><Leaf size={12} color="#fff" /></div>
          <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 14, color: "#6b7280" }}>GreenGuardian</span>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13 }}>
          {[["#problem","Problem"],["#platform","Platform"],["#features","Features"],["#about","About"],["#contact","Contact"]].map(([href, label]) => (
            <a key={href} href={href} style={{ color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#6b7280"} onMouseLeave={e => e.target.style.color = "#9ca3af"}>
              {label}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>© 2025 GreenGuardian · Final Year Project</p>
      </div>
    </footer>
  );
}

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes gg-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  @keyframes gg-fadein { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes gg-pulse-ring { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.5);opacity:0} }
  html { scroll-behavior: smooth; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #ffffff; }
  .leaflet-container { font-family: Inter, sans-serif; }
  .leaflet-popup-content-wrapper {
    background: #ffffff !important;
    border: 1px solid rgba(98,77,227,0.15) !important;
    border-radius: 10px !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
    color: #0f0c1e !important;
    padding: 14px 16px !important;
  }
  .leaflet-popup-content { margin: 0 !important; }
  .leaflet-popup-tip-container .leaflet-popup-tip { background: #ffffff !important; }
  .leaflet-popup-close-button { color: #9ca3af !important; top: 10px !important; right: 10px !important; }
  input::placeholder, textarea::placeholder { color: #c4b5fd; }
`;

/* ─── MAIN EXPORT ────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ background: "#ffffff", color: "#0f0c1e", minHeight: "100vh", fontFamily: "Inter,sans-serif", overflowX: "hidden" }}>
        <Navbar />
        <Hero />
        <StatsBar />
        <ProblemSection />
        <HowItWorks />
        <PlatformSection />
        <ServiceBooking />
        <FeaturesSection />
        <AboutSection />
        <ContactSection />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
