// main.js

// initialize map
const map = L.map('map').setView([30.0444, 31.2357], 7);

// add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let heatLayer;

// function to fetch AQI data from server
async function fetchAQI(lat, lon) {
  try {
    const res = await fetch(`http://localhost:5000/current?lat=${lat}&lon=${lon}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching AQI:', err);
    return null;
  }
}

// function to update info panel
function updateInfoPanel(lat, lon, aqiData) {
  const panel = document.getElementById('info-content');
  if (!aqiData || !aqiData.list) {
    panel.innerHTML = `<p>Could not fetch AQI data for ${lat}, ${lon}</p>`;
    return;
  }

  const aqi = aqiData.list[0].main.aqi;
  const components = aqiData.list[0].components;

  panel.innerHTML = `
    <h3>AQI for ${lat.toFixed(4)}, ${lon.toFixed(4)}</h3>
    <p><strong>Index:</strong> ${aqi}</p>
    <p><strong>CO:</strong> ${components.co} µg/m³</p>
    <p><strong>NO:</strong> ${components.no} µg/m³</p>
    <p><strong>NO2:</strong> ${components.no2} µg/m³</p>
    <p><strong>O3:</strong> ${components.o3} µg/m³</p>
    <p><strong>SO2:</strong> ${components.so2} µg/m³</p>
    <p><strong>PM2.5:</strong> ${components.pm2_5} µg/m³</p>
    <p><strong>PM10:</strong> ${components.pm10} µg/m³</p>
    <p><strong>NH3:</strong> ${components.nh3} µg/m³</p>
  `;
}

// function to add heatmap
async function loadHeatmap() {
  const points = [
    [30.0444, 31.2357],
    [31.2001, 29.9187],
    [30.0131, 31.2089],
    [31.1899, 29.9187]
  ];

  const heatData = [];

  for (let p of points) {
    const data = await fetchAQI(p[0], p[1]);
    if (data && data.list) {
      const aqi = data.list[0].main.aqi;
      heatData.push([...p, aqi]); // [lat, lon, intensity]
    }
  }

  if (heatLayer) map.removeLayer(heatLayer);

  heatLayer = L.heatLayer(heatData, { radius: 25, blur: 15, maxZoom: 17 }).addTo(map);
}

// map click event
map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  const data = await fetchAQI(lat, lng);
  updateInfoPanel(lat, lng, data);
});

// location button


// initial heatmap load
loadHeatmap();
