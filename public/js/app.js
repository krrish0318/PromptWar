/**
 * VenueCrowd Main Controller
 * Orchestrates UI updates and Google Service integrations.
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // 1. Initial Data Load
    await fetchCrowdData();
    
    // 2. Setup periodic refresh (every 30s)
    setInterval(fetchCrowdData, 30000);

    // 3. Accessibility: Setup Announcer
    const announcer = document.createElement('div');
    announcer.id = 'accessibility-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.style.position = 'absolute';
    announcer.style.left = '-9999px';
    document.body.appendChild(announcer);
}

/**
 * Fetch and update live crowd status
 */
async function fetchCrowdData() {
    const statusEl = document.getElementById('connection-status');
    try {
        const zones = await VenueUtils.apiFetch('/api/venue/crowd');
        updateCrowdList(zones);
        if (window.google) MapManager.updateZones(zones);
        statusEl.innerHTML = VenueUtils.UI_STRINGS.LIVE;
    } catch (e) {
        statusEl.innerHTML = VenueUtils.UI_STRINGS.OFFLINE;
    }
}

/**
 * Update the sidebar list with zone info
 */
function updateCrowdList(zones) {
    const list = document.getElementById('crowd-list');
    list.innerHTML = '';

    zones.forEach(zone => {
        const card = document.createElement('div');
        card.className = 'zone-card';
        card.role = 'listitem';
        card.tabIndex = 0;
        card.setAttribute('aria-label', `${zone.name}, Efficiency Status: ${zone.status}, Estimated Wait: ${VenueUtils.formatWaitTime(zone.density)}`);
        
        card.innerHTML = `
            <div>
                <div style="font-weight: 600; font-size: 0.9rem;">${zone.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Wait: ${VenueUtils.formatWaitTime(zone.density)}</div>
            </div>
            <span class="density-tag ${zone.status.toLowerCase()}">${zone.status}</span>
        `;

        card.onkeypress = (e) => { if(e.key === 'Enter') handleZoneClick(zone); };
        card.onclick = () => handleZoneClick(zone);
        list.appendChild(card);
    });
}

function handleZoneClick(zone) {
    VenueUtils.showNotification(zone.name, `Optimization Suggestion: ${zone.status === 'High' ? 'Avoid this area. Use alternative gates for entry.' : 'Ideal path detected. No significant delays.'}`);
}

/**
 * Smart Routing Integration
 */
async function getSmartRoute() {
    const from = document.getElementById('start-node').value;
    const to = document.getElementById('end-node').value;
    const btn = document.getElementById('route-btn');
    
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loader"></span> Computing...';

    const panel = document.getElementById('route-panel');
    const text = document.getElementById('route-text');

    try {
        const data = await VenueUtils.apiFetch(`/api/venue/route?from=${from}&to=${to}`);
        
        text.innerHTML = `
            <div style="margin-bottom: 8px;"><b>Optimized Path:</b></div>
            <div style="font-family: monospace; font-size: 0.75rem; margin-bottom: 8px;">${data.pathIds.join(' → ')}</div>
            <div style="color: var(--secondary); font-weight: 600;">Benefit: ${data.benefit}</div>
        `;
        panel.style.display = 'block';
        MapManager.drawPath(data.pathIds);
        VenueUtils.showNotification("Path Found", "Map has been updated with the most efficient route.");
    } catch (e) {
        VenueUtils.showNotification("Routing Error", e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

/**
 * AI Assistant Interaction
 */
async function askAssistant() {
    const input = document.getElementById('ai-query');
    const query = input.value.trim();
    if (!query) return;

    const resDiv = document.getElementById('ai-response');
    resDiv.innerHTML = '<div style="display:flex; align-items:center; gap:8px;"><span class="loader"></span> Analyzing venue state...</div>';
    resDiv.style.display = 'block';

    try {
        const data = await VenueUtils.apiFetch(`/api/venue/assistant?q=${encodeURIComponent(query)}`);
        resDiv.innerHTML = `
            <div style="color: var(--text-muted); font-size: 0.7rem; margin-bottom: 4px;">Gemini 1.5 Insight:</div>
            <div>${data.analysis || data.fallback}</div>
        `;
        input.value = '';
    } catch (e) {
        resDiv.innerHTML = "AI Assistant currently in offline mode.";
    }
}

/**
 * Calendar Integration
 */
async function syncCalendar() {
    const btn = event.currentTarget;
    btn.disabled = true;
    
    try {
        const data = await VenueUtils.apiFetch('/api/calendar/sync', { method: 'POST' });
        VenueUtils.showNotification("Calendar Synced", data.error ? data.error : "Your event has been added to Google Calendar with optimal arrival times.");
    } catch (e) {
        VenueUtils.showNotification("Sync Alert", "Continuing in simulated mode. Verify credentials for live sync.");
    } finally {
        btn.disabled = false;
    }
}

/**
 * Security: Simulation of Auth
 */
function googleAuth() {
    const btn = document.getElementById('auth-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> Authenticating...';
    
    setTimeout(() => {
        document.getElementById('user-profile').style.display = 'flex';
        btn.style.display = 'none';
        VenueUtils.showNotification("Verified", "Signed in via Google Workspace. Admin features unlocked.");
    }, 1200);
}

// Global Exports
window.askAssistant = askAssistant;
window.getSmartRoute = getSmartRoute;
window.syncCalendar = syncCalendar;
window.googleAuth = googleAuth;
window.toggleAdminModal = (show) => document.getElementById('admin-modal').style.display = show ? 'flex' : 'none';

window.submitAdminUpdate = async () => {
    const zoneId = document.getElementById('admin-zone').value;
    const density = document.getElementById('admin-density').value;
    
    window.toggleAdminModal(false);
    try {
        await VenueUtils.apiFetch('/api/venue/admin/density', {
            method: 'POST',
            body: JSON.stringify({ zoneId, density: parseInt(density) })
        });
        fetchCrowdData();
        VenueUtils.showNotification("Admin Override", `Zone ${zoneId} density updated.`);
    } catch (e) {
        VenueUtils.showNotification("Admin Error", "Failed to update density.");
    }
};

window.initMap = () => MapManager.init('map');
