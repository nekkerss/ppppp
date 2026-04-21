import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

/* Fix default marker icons (bundlers break Leaflet asset paths) */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const TUNISIA_CENTER = [34.0, 9.0];
const DEFAULT_ZOOM = 6;
const FOCUS_ZOOM = 12;

export const AGENCY_LOCATIONS = [
  {
    id: "tunis",
    city: "Tunis",
    name: "BNA Assurance Tunis",
    description: "Insurance services & customer support center",
    position: [36.8065, 10.1815],
    main: true
  },
  {
    id: "sousse",
    city: "Sousse",
    name: "BNA Assurance Sousse",
    description: "Insurance services & customer support center",
    position: [35.8256, 10.637]
  },
  {
    id: "sfax",
    city: "Sfax",
    name: "BNA Assurance Sfax",
    description: "Insurance services & customer support center",
    position: [34.7406, 10.7603]
  },
  {
    id: "nabeul",
    city: "Nabeul",
    name: "BNA Assurance Nabeul",
    description: "Insurance services & customer support center",
    position: [36.4561, 10.7376]
  },
  {
    id: "bizerte",
    city: "Bizerte",
    name: "BNA Assurance Bizerte",
    description: "Insurance services & customer support center",
    position: [37.2744, 9.8739]
  },
  {
    id: "gabes",
    city: "Gabès",
    name: "BNA Assurance Gabès",
    description: "Insurance services & customer support center",
    position: [33.8881, 10.0982]
  },
  {
    id: "kairouan",
    city: "Kairouan",
    name: "BNA Assurance Kairouan",
    description: "Insurance services & customer support center",
    position: [35.6711, 10.1003]
  }
];

/** Accent-insensitive, case-insensitive partial match */
function norm(s) {
  return String(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function matchAgencies(query, agencies) {
  const q = norm(query.trim());
  if (!q) return [];
  return agencies.filter((a) => {
    const city = norm(a.city);
    const name = norm(a.name);
    const id = a.id.toLowerCase();
    return city.includes(q) || name.includes(q) || id.includes(q);
  });
}

/**
 * Flies map to focused agency and opens its popup.
 */
function MapFocusController({ focusedId, agencies, markerRefs }) {
  const map = useMap();
  const initialSkip = useRef(true);

  useEffect(() => {
    if (!focusedId) {
      if (initialSkip.current) {
        initialSkip.current = false;
        return;
      }
      map.flyTo(TUNISIA_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
      return;
    }
    initialSkip.current = false;

    const agency = agencies.find((a) => a.id === focusedId);
    if (!agency) return;

    map.flyTo(agency.position, FOCUS_ZOOM, { duration: 1.35 });

    const t = window.setTimeout(() => {
      const m = markerRefs.current[focusedId];
      if (m && typeof m.openPopup === "function") {
        m.openPopup();
      }
    }, 550);

    return () => window.clearTimeout(t);
  }, [focusedId, agencies, map, markerRefs]);

  return null;
}

export default function MapComponent() {
  const [search, setSearch] = useState("");
  const [focusedId, setFocusedId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const markerRefs = useRef({});
  const wrapRef = useRef(null);

  const suggestions = useMemo(() => matchAgencies(search, AGENCY_LOCATIONS), [search]);

  const selectAgency = useCallback((agency) => {
    setFocusedId(agency.id);
    setSearch(agency.city);
    setShowSuggestions(false);
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedId(null);
    setSearch("");
    setShowSuggestions(false);
    Object.values(markerRefs.current).forEach((m) => {
      if (m && typeof m.closePopup === "function") m.closePopup();
    });
  }, []);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length >= 1) {
        selectAgency(suggestions[0]);
      }
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const onDoc = (ev) => {
      if (wrapRef.current && !wrapRef.current.contains(ev.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative h-[min(520px,70vh)] min-h-[420px] w-full overflow-hidden rounded-2xl shadow-lg shadow-slate-300/40 ring-1 ring-slate-200/80">
      {/* Floating search — top-left */}
      <div
        ref={wrapRef}
        className="absolute left-3 top-3 z-[1000] w-[min(100%-1.5rem,320px)] transition-all duration-300"
      >
        <div className="relative rounded-xl border border-slate-200/90 bg-white/95 shadow-md shadow-slate-400/15 backdrop-blur-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search city (e.g. Nabeul)…"
            className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
            aria-label="Search agency by city"
            autoComplete="off"
          />
          {(search || focusedId) && (
            <button
              type="button"
              onClick={clearFocus}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showSuggestions && search.trim() && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full z-[1001] mt-1 max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {suggestions.map((a) => (
                <li key={a.id} role="option">
                  <button
                    type="button"
                    className="w-full px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-[#eff6ff]"
                    onClick={() => selectAgency(a)}
                  >
                    <span className="font-semibold">{a.city}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{a.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showSuggestions && search.trim() && suggestions.length === 0 && (
            <div className="absolute left-0 right-0 top-full z-[1001] mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-lg">
              No agency found. Try another spelling.
            </div>
          )}
        </div>
        {focusedId && (
          <p className="mt-2 rounded-lg bg-[#0f2744]/90 px-2.5 py-1.5 text-[11px] font-medium text-white/95 shadow-sm">
            Access point: <span className="text-[#7dd3fc]">{AGENCY_LOCATIONS.find((x) => x.id === focusedId)?.name}</span>
          </p>
        )}
      </div>

      <MapContainer
        center={TUNISIA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="z-0 h-full w-full rounded-2xl [&_.leaflet-control-zoom]:rounded-lg [&_.leaflet-control-zoom]:border-slate-200"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocusController focusedId={focusedId} agencies={AGENCY_LOCATIONS} markerRefs={markerRefs} />

        {AGENCY_LOCATIONS.map((agency) => {
          const isFocused = focusedId === agency.id;
          const isDimmed = Boolean(focusedId && !isFocused);

          return (
            <Marker
              key={agency.id}
              position={agency.position}
              ref={(instance) => {
                if (instance) markerRefs.current[agency.id] = instance;
                else delete markerRefs.current[agency.id];
              }}
              opacity={isDimmed ? 0.4 : 1}
              zIndexOffset={isFocused ? 1000 : isDimmed ? 0 : 1}
              eventHandlers={{
                click: () => {
                  setFocusedId(agency.id);
                  setSearch(agency.city);
                }
              }}
            >
              <Popup>
                <div className="min-w-[200px] py-1">
                  <p className="font-bold text-[#1a365d]">{agency.name}</p>
                  {agency.main && (
                    <p className="mt-0.5 text-xs font-semibold text-[#00a67e]">Main branch</p>
                  )}
                  <p className="mt-2 text-sm leading-snug text-slate-600">{agency.description}</p>
                  <p className="mt-2 text-xs text-slate-400">{agency.city}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        .leaflet-container {
          font-family: inherit;
          background: #e8eef4;
        }
      `}</style>
    </div>
  );
}
