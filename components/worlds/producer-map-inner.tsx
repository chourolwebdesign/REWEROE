"use client";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { CircleMarker as LeafletCircleMarker, LatLngBoundsExpression } from "leaflet";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface MapProducer { slug: string; name: string; region: string; distanceKm: number; coords: [number, number] }
export interface MapStoreMarker { name: string; coords: [number, number]; label: string; note: string }

type Palette = { red: string; ink: string; paper: string };

/* Colour scheme as an external store — the palette is re-read when the OS flips (§4.31). */
const query = () => window.matchMedia("(prefers-color-scheme: dark)");
const subscribe = (cb: () => void) => { const mq = query(); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); };
const getScheme = () => (query().matches ? "dark" : "light");

/** Token colours from the stylesheet — never hex literals. Brand red fails 3:1 on the inverted dark tile, so dark uses the signal red. */
function readPalette(dark: boolean): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return { red: v(dark ? "--red-text" : "--red-brand"), ink: v("--ink"), paper: v("--paper") };
}

/** Loaded with `ssr: false`, so the DOM is always available in render. */
function usePalette(): Palette {
  const scheme = useSyncExternalStore(subscribe, getScheme, () => "light");
  return useMemo(() => readPalette(scheme === "dark"), [scheme]);
}

/** ± radius around a point as a lat/lng box (1° lat ≈ 111 km; lng shrinks with cos(lat)). */
function radiusBounds([lat, lng]: [number, number], km: number): LatLngBoundsExpression {
  const dLat = km / 111;
  const dLng = km / (111 * Math.cos((lat * Math.PI) / 180));
  return [[lat - dLat, lng - dLng], [lat + dLat, lng + dLng]];
}

/** Flies to the active producer; back to the full radius when the selection is cleared. */
function Focus({ active, producers, home }: { active: string | null; producers: MapProducer[]; home: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    const p = active ? producers.find((x) => x.slug === active) : null;
    if (p) map.flyTo(p.coords, 10, { duration: 0.9 });
    else map.flyToBounds(home, { padding: [16, 16], duration: 0.9 });
  }, [active, producers, home, map]);
  return null;
}

interface Props {
  store: MapStoreMarker;
  producers: MapProducer[];
  radiusKm: number;
  active: string | null;
  onSelect: (slug: string | null) => void;
}

/**
 * Greyscale newsprint map of the regional producers (§4.31 theme from globals): the red store marker is the only
 * colour, producers are ink rings (filled when active), the regional radius is a dashed ink circle.
 */
export default function ProducerMapInner({ store, producers, radiusKm, active, onSelect }: Props) {
  const c = usePalette();
  const home = useMemo(() => radiusBounds(store.coords, radiusKm), [store.coords, radiusKm]);
  const markers = useRef(new Map<string, LeafletCircleMarker>());

  useEffect(() => {
    if (active) markers.current.get(active)?.openPopup();
  }, [active]);

  return (
    <MapContainer bounds={home} boundsOptions={{ padding: [16, 16] }} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Circle center={store.coords} radius={radiusKm * 1000} pathOptions={{ color: c.ink, weight: 1, dashArray: "4 6", fillColor: c.ink, fillOpacity: 0.03 }} interactive={false} />
      {producers.map((p) => {
        const isActive = active === p.slug;
        return (
          <CircleMarker
            key={p.slug}
            center={p.coords}
            radius={isActive ? 9 : 7}
            pathOptions={{ color: c.ink, weight: 2, fillColor: isActive ? c.ink : c.paper, fillOpacity: 1 }}
            ref={(el) => { if (el) markers.current.set(p.slug, el); else markers.current.delete(p.slug); }}
            eventHandlers={{ click: () => onSelect(p.slug), popupclose: () => { if (active === p.slug) onSelect(null); } }}
          >
            <Popup><strong>{p.name}</strong><br />{p.region} · {p.distanceKm} km</Popup>
          </CircleMarker>
        );
      })}
      <CircleMarker center={store.coords} radius={9} pathOptions={{ color: c.paper, weight: 2, fillColor: c.red, fillOpacity: 1 }}>
        <Popup><strong>{store.name}</strong><br />{store.label} · {store.note}</Popup>
      </CircleMarker>
      <Focus active={active} producers={producers} home={home} />
    </MapContainer>
  );
}
