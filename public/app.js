/**
 * VenueCrowd Minimal Engine
 */
const CONFIG = {
  KEY: "REPLACE_WITH_YOUR_KEY",
  ENDPOINTS: { crowd: '/api/crowd', assist: '/api/assistant', route: '/api/route', admin: '/api/admin/density' }
};

let map, markers = [];

async function init() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.KEY}&callback=initMap`;
  document.head.appendChild(script);
  setInterval(sync, 30000);
}

window.initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), { center: { lat: -37.8198, lng: 144.9834 }, zoom: 17, disableDefaultUI: true });
  sync();
};

async function sync() {
  const zones = await (await fetch(CONFIG.ENDPOINTS.crowd)).json();
  const list = document.getElementById('crowd-list');
  list.innerHTML = '';
  markers.forEach(m => m.setMap(null));
  markers = [];

  zones.forEach(z => {
    const card = document.createElement('div');
    card.className = 'zone-card';
    card.innerHTML = `<span>${z.name}</span><span class="density-tag ${z.density > 80 ? 'high' : 'low'}">${z.density}%</span>`;
    card.onclick = () => map.panTo(marker.getPosition());
    list.appendChild(card);

    const marker = new google.maps.Marker({
      position: { lat: -37.8198 + (Math.random() - 0.5) * 0.005, lng: 144.9834 + (Math.random() - 0.5) * 0.005 },
      map, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: z.density > 80 ? 'red' : 'green', fillOpacity: 0.6, strokeWeight: 0 }
    });
    markers.push(marker);
  });
}

window.askAssistant = async () => {
  const q = document.getElementById('ai-query').value;
  const res = await (await fetch(`${CONFIG.ENDPOINTS.assist}?q=${q}`)).json();
  document.getElementById('ai-response').innerHTML = res.analysis || "Try again.";
  document.getElementById('ai-response').style.display = 'block';
};

window.getSmartRoute = async () => {
  const f = document.getElementById('start-node').value, t = document.getElementById('end-node').value;
  const res = await (await fetch(`${CONFIG.ENDPOINTS.route}?from=${f}&to=${t}`)).json();
  document.getElementById('route-text').innerHTML = `Path: ${res.path.join(' -> ')} (${res.benefit})`;
  document.getElementById('route-panel').style.display = 'block';
};

window.onload = init;
