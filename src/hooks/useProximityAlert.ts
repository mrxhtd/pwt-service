import { useEffect, useRef, useState } from 'react';
import type { Client } from '../types';

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useProximityAlert(clients: Client[], radiusMeters = 200) {
  const [nearbyClient, setNearbyClient] = useState<Client | null>(null);
  const dismissedRef = useRef<Set<string>>(new Set());

  const geoClients = clients.filter((c) => c.lat != null && c.lng != null);

  useEffect(() => {
    if (geoClients.length === 0 || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        for (const c of geoClients) {
          if (dismissedRef.current.has(c.id)) continue;
          const dist = haversineMeters(latitude, longitude, c.lat!, c.lng!);
          if (dist <= radiusMeters) {
            setNearbyClient(c);
            return;
          }
        }
        setNearbyClient(null);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [geoClients.length, radiusMeters]);

  const dismiss = () => {
    if (nearbyClient) dismissedRef.current.add(nearbyClient.id);
    setNearbyClient(null);
  };

  return { nearbyClient, dismiss };
}
