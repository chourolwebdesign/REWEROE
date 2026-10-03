"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface MapStore { slug: string; name: string; coords: [number, number]; address: string }

function FlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 13, { duration: 1.2 }); }, [center, map]);
  return null;
}

export default function StoreMapInner({ stores, user, active }: { stores: MapStore[]; user: [number, number] | null; active?: string | null }) {
  const center = stores[0]?.coords ?? [50.1256, 8.6085];
  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {stores.map((s) => (
        <CircleMarker key={s.slug} center={s.coords} radius={active === s.slug ? 14 : 11} pathOptions={{ color: "#0E3B2E", weight: 3, fillColor: "#7FBF3F", fillOpacity: 1 }}>
          <Popup><strong>{s.name}</strong><br />{s.address}</Popup>
        </CircleMarker>
      ))}
      {user && <CircleMarker center={user} radius={8} pathOptions={{ color: "#C9A227", weight: 2, fillColor: "#C9A227", fillOpacity: 0.9 }} />}
      <FlyTo center={user} />
    </MapContainer>
  );
}
