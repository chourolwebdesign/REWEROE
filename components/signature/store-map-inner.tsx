"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface MapStore { slug: string; name: string; coords: [number, number]; address: string }

type Palette = { red: string; ink: string; paper: string };

/* Colour scheme as an external store: the palette is re-read when the OS flips (§4.31). */
const query = () => window.matchMedia("(prefers-color-scheme: dark)");
const subscribe = (cb: () => void) => { const mq = query(); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); };
const getScheme = () => (query().matches ? "dark" : "light");

/** Token colours from the stylesheet — never hex literals. Brand red on the inverted dark tile fails 3:1, so dark uses the signal red. */
function readPalette(dark: boolean): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return { red: v(dark ? "--red-text" : "--red-brand"), ink: v("--ink"), paper: v("--paper") };
}

/** This module is loaded with `ssr: false`, so the DOM is always available in render. */
function usePalette(): Palette {
  const scheme = useSyncExternalStore(subscribe, getScheme, () => "light");
  return useMemo(() => readPalette(scheme === "dark"), [scheme]);
}

function FlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 13, { duration: 1.2 }); }, [center, map]);
  return null;
}

/** Greyscale newsprint map (tile filter lives in globals §1); the red store marker is the only colour. */
export default function StoreMapInner({ stores, user, active }: { stores: MapStore[]; user: [number, number] | null; active?: string | null }) {
  const center = stores[0]?.coords ?? [50.1256, 8.6085];
  const c = usePalette();
  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {stores.map((s) => (
        <CircleMarker key={s.slug} center={s.coords} radius={active === s.slug ? 12 : 9} pathOptions={{ color: c.paper, weight: 2, fillColor: c.red, fillOpacity: 1 }}>
          <Popup><strong>{s.name}</strong><br />{s.address}</Popup>
        </CircleMarker>
      ))}
      {user && <CircleMarker center={user} radius={7} pathOptions={{ color: c.paper, weight: 2, fillColor: c.ink, fillOpacity: 0.95 }} />}
      <FlyTo center={user} />
    </MapContainer>
  );
}
