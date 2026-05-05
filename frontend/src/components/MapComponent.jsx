import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

/* Fix default marker icons (bundlers break Leaflet asset paths) */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const TUNISIA_CENTER = [34.0, 9.0];
const DEFAULT_ZOOM   = 6;
const FOCUS_ZOOM     = 13;

export const AGENCY_LOCATIONS = [
  {
    id: "tunis",
    city: "Tunis",
    name: "BNA Assurance – Siège Social",
    address: "Avenue Mohamed V, Tunis 1001",
    phone: "+216 71 831 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "contact@bna-assurances.tn",
    position: [36.8065, 10.1815],
    main: true
  },
  {
    id: "sfax",
    city: "Sfax",
    name: "BNA Assurance Sfax",
    address: "Rue Habib Bourguiba, Sfax 3000",
    phone: "+216 74 221 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "sfax@bna-assurances.tn",
    position: [34.7406, 10.7603]
  },
  {
    id: "sousse",
    city: "Sousse",
    name: "BNA Assurance Sousse",
    address: "Avenue Habib Bourguiba, Sousse 4000",
    phone: "+216 73 225 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "sousse@bna-assurances.tn",
    position: [35.8256, 10.6370]
  },
  {
    id: "nabeul",
    city: "Nabeul",
    name: "BNA Assurance Nabeul",
    address: "Avenue Habib Bourguiba, Nabeul 8000",
    phone: "+216 72 286 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "nabeul@bna-assurances.tn",
    position: [36.4561, 10.7376]
  },
  {
    id: "bizerte",
    city: "Bizerte",
    name: "BNA Assurance Bizerte",
    address: "Rue de la République, Bizerte 7000",
    phone: "+216 72 431 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "bizerte@bna-assurances.tn",
    position: [37.2744, 9.8739]
  },
  {
    id: "gabes",
    city: "Gabès",
    name: "BNA Assurance Gabès",
    address: "Avenue Farhat Hached, Gabès 6000",
    phone: "+216 75 272 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "gabes@bna-assurances.tn",
    position: [33.8881, 10.0982]
  },
  {
    id: "kairouan",
    city: "Kairouan",
    name: "BNA Assurance Kairouan",
    address: "Avenue Zama El Balawi, Kairouan 3100",
    phone: "+216 77 231 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "kairouan@bna-assurances.tn",
    position: [35.6711, 10.1003]
  },
  {
    id: "monastir",
    city: "Monastir",
    name: "BNA Assurance Monastir",
    address: "Avenue Habib Bourguiba, Monastir 5000",
    phone: "+216 73 461 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "monastir@bna-assurances.tn",
    position: [35.7643, 10.8113]
  },
  {
    id: "gafsa",
    city: "Gafsa",
    name: "BNA Assurance Gafsa",
    address: "Avenue Habib Bourguiba, Gafsa 2100",
    phone: "+216 76 221 000",
    hours: "Lun – Ven  08h00 – 17h00",
    email: "gafsa@bna-assurances.tn",
    position: [34.4311, 8.7757]
  }
];

/** Accent-insensitive, case-insensitive partial match */
function norm(s) {
  return String(s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
function matchAgencies(query, agencies) {
  const q = norm(query.trim());
  if (!q) return [];
  return agencies.filter((a) =>
    norm(a.city).includes(q) || norm(a.name).includes(q) || a.id.includes(q)
  );
}

/** Flies the map to a focused agency and opens its popup */
function MapFocusController({ focusedId, agencies, markerRefs }) {
  const map = useMap();
  const initialSkip = useRef(true);

  useEffect(() => {
    if (!focusedId) {
      if (initialSkip.current) { initialSkip.current = false; return; }
      map.flyTo(TUNISIA_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
      return;
    }
    initialSkip.current = false;
    const agency = agencies.find((a) => a.id === focusedId);
    if (!agency) return;
    map.flyTo(agency.position, FOCUS_ZOOM, { duration: 1.35 });
    const t = window.setTimeout(() => {
      const m = markerRefs.current[focusedId];
      if (m?.openPopup) m.openPopup();
    }, 550);
    return () => window.clearTimeout(t);
  }, [focusedId, agencies, map, markerRefs]);

  return null;
}

/**
 * MapComponent — can be used standalone (with built-in search) or
 * in controlled mode by passing `focusedId` + `onSelect` props.
 */
export default function MapComponent({ focusedId: externalFocusedId, onSelect }) {
  const isControlled = onSelect != null;

  /* Internal state — only used in standalone mode */
  const [internalFocusedId, setInternalFocusedId] = useState(null);
  const [search, setSearch]                         = useState("");
  const [showSuggestions, setShowSuggestions]       = useState(false);

  const focusedId    = isControlled ? externalFocusedId : internalFocusedId;
  const setFocusedId = isControlled ? onSelect : setInternalFocusedId;

  const markerRefs = useRef({});
  const wrapRef    = useRef(null);

  const suggestions = useMemo(() => matchAgencies(search, AGENCY_LOCATIONS), [search]);

  const selectAgency = useCallback((agency) => {
    setFocusedId(agency.id);
    setSearch(agency.city);
    setShowSuggestions(false);
  }, [setFocusedId]);

  const clearFocus = useCallback(() => {
    setFocusedId(null);
    setSearch("");
    setShowSuggestions(false);
    Object.values(markerRefs.current).forEach((m) => m?.closePopup?.());
  }, [setFocusedId]);

  useEffect(() => {
    if (isControlled) return;
    const onDoc = (ev) => {
      if (wrapRef.current && !wrapRef.current.contains(ev.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [isControlled]);

  return (
    <div className="relative h-[min(560px,72vh)] min-h-[420px] w-full overflow-hidden rounded-2xl shadow-lg shadow-slate-300/40 ring-1 ring-slate-200/80">

      {/* Floating search — only in standalone (uncontrolled) mode */}
      {!isControlled && (
        <div
          ref={wrapRef}
          className="absolute left-3 top-3 z-[1000] w-[min(100%-1.5rem,320px)]"
        >
          <div className="relative rounded-xl border border-slate-200/90 bg-white/95 shadow-md backdrop-blur-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions.length) { e.preventDefault(); selectAgency(suggestions[0]); }
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              placeholder="Rechercher une ville…"
              className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a67e]/40"
              autoComplete="off"
            />
            {(search || focusedId) && (
              <button type="button" onClick={clearFocus}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                <X className="h-4 w-4" />
              </button>
            )}
            {showSuggestions && search.trim() && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-[1001] mt-1 max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {suggestions.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => selectAgency(a)}
                      className="w-full px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-[#effaf5] transition">
                      <span className="font-semibold">{a.city}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{a.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showSuggestions && search.trim() && suggestions.length === 0 && (
              <div className="absolute left-0 right-0 top-full z-[1001] mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-lg">
                Aucune agence trouvée.
              </div>
            )}
          </div>
        </div>
      )}

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
          const isDimmed  = Boolean(focusedId && !isFocused);
          return (
            <Marker
              key={agency.id}
              position={agency.position}
              ref={(inst) => {
                if (inst) markerRefs.current[agency.id] = inst;
                else delete markerRefs.current[agency.id];
              }}
              opacity={isDimmed ? 0.35 : 1}
              zIndexOffset={isFocused ? 1000 : isDimmed ? 0 : 1}
              eventHandlers={{
                click: () => setFocusedId(agency.id)
              }}
            >
              <Popup>
                <div className="min-w-[200px] py-1 space-y-1">
                  <p className="font-bold text-[#1a365d]">{agency.name}</p>
                  {agency.main && (
                    <p className="text-xs font-bold text-[#00a67e] uppercase tracking-wide">Siège social</p>
                  )}
                  <p className="text-xs text-slate-500">{agency.address}</p>
                  <p className="text-xs text-slate-600">{agency.phone}</p>
                  <p className="text-xs text-slate-500">{agency.hours}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        .leaflet-container { font-family: inherit; background: #e8eef4; }
      `}</style>
    </div>
  );
}
