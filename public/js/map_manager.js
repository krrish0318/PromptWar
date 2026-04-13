/**
 * Google Maps Orchestrator
 * Handles rendering, markers, and routing visualizations.
 */

class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.polylines = [];
        this.infoWindow = null;
        this.venueCenter = { lat: -37.8198, lng: 144.9834 };
    }

    init(containerId) {
        if (!window.google) {
            console.error("Google Maps not loaded");
            return;
        }

        this.map = new google.maps.Map(document.getElementById(containerId), {
            center: this.venueCenter,
            zoom: 17,
            disableDefaultUI: true,
            zoomControl: true,
            styles: this.getDarkStyles(),
            mapId: "VENUE_CROWD_MAIN" // For advanced marker features
        });

        this.infoWindow = new google.maps.InfoWindow();
    }

    updateZones(zones) {
        this.clearMarkers();
        
        zones.forEach(zone => {
            const statusColor = this.getStatusColor(zone.status);
            
            // Marker with custom circle symbol to represent density
            const marker = new google.maps.Marker({
                position: { 
                    lat: this.venueCenter.lat + (Math.random() * 0.001 - 0.0005), 
                    lng: this.venueCenter.lng + (Math.random() * 0.002 - 0.001) 
                },
                map: this.map,
                title: zone.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8 + (zone.density / 8),
                    fillColor: statusColor,
                    fillOpacity: 0.6,
                    strokeWeight: 2,
                    strokeColor: "#ffffff"
                }
            });

            marker.addListener('click', () => {
                this.infoWindow.setContent(`
                    <div style="color: #0f172a; padding: 10px;">
                        <h4 style="margin: 0">${zone.name}</h4>
                        <p style="margin: 5px 0">Density: <b>${zone.density}%</b></p>
                        <p style="margin: 0">Wait: <b>${VenueUtils.formatWaitTime(zone.density)}</b></p>
                    </div>
                `);
                this.infoWindow.open(this.map, marker);
            });

            this.markers.push(marker);
        });
    }

    drawPath(pathIds) {
        this.clearPolylines();

        // This would normally use DirectionsService, but we'll simulate for the challenge
        // By connecting our markers or mock coordinates
        const pathCoords = pathIds.map(id => {
            // Simulated coordinates for demo
            return { 
                lat: this.venueCenter.lat + (Math.random() * 0.002 - 0.001), 
                lng: this.venueCenter.lng + (Math.random() * 0.003 - 0.0015) 
            };
        });

        const polyline = new google.maps.Polyline({
            path: pathCoords,
            geodesic: true,
            strokeColor: "#6366f1",
            strokeOpacity: 0.8,
            strokeWeight: 5,
            icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                offset: '100%',
                repeat: '100px'
            }]
        });

        polyline.setMap(this.map);
        this.polylines.push(polyline);
        
        // Auto-zoom to path
        const bounds = new google.maps.LatLngBounds();
        pathCoords.forEach(c => bounds.extend(c));
        this.map.fitBounds(bounds, 50);
    }

    clearMarkers() {
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
    }

    clearPolylines() {
        this.polylines.forEach(p => p.setMap(null));
        this.polylines = [];
    }

    getStatusColor(status) {
        switch(status) {
            case 'High': return "#ef4444";
            case 'Medium': return "#f59e0b";
            default: return "#10b981";
        }
    }

    getDarkStyles() {
        return [
            { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] }
        ];
    }
}

window.MapManager = new MapManager();
