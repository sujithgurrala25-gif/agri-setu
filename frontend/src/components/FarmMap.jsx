import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function FarmMap({ origin, points }) {
  const center = origin || { lat: 18.5204, lng: 73.8567 };
  return (
    <div className="h-80 overflow-hidden rounded-[18px]">
      <MapContainer center={[center.lat, center.lng]} zoom={10} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[center.lat, center.lng]} icon={icon}>
          <Popup>You (demo: Pune)</Popup>
        </Marker>
        {(points || [])
          .filter((p) => p.lat && p.lng)
          .map((p) => (
            <Marker key={p.productId || p._id} position={[p.lat, p.lng]} icon={icon}>
              <Popup>
                <strong>{p.farmName || p.name}</strong>
                <br />
                {p.product} · ₹{p.pricePerUnit}/kg
                <br />
                {p.distanceKm} km · {p.quantityAvailable} kg
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
