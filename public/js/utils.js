/**
 * VenueCrowd Utilities & API Client
 * Centralized logic for shared frontend operations.
 */

const UI_STRINGS = {
    CONNECTING: "Connecting to Venue Engine...",
    LIVE: "🟢 System Online",
    OFFLINE: "🔴 System Offline",
    ERROR: "An unexpected error occurred."
};

/**
 * showNotification: Accessible toast system
 */
function showNotification(title, message, type = 'info') {
    const notif = document.getElementById('notification');
    const titleEl = document.getElementById('notif-title');
    const msgEl = document.getElementById('notif-msg');

    titleEl.innerText = title;
    msgEl.innerText = message;
    
    // Set color based on type if needed (extensible)
    notif.classList.add('show');
    
    // Accessibility: Announcement for Screen Readers
    const announcer = document.getElementById('accessibility-announcer');
    if (announcer) {
        announcer.innerText = `${title}: ${message}`;
    }

    setTimeout(() => {
        notif.classList.remove('show');
    }, 6000);
}

/**
 * apiFetch: Standardized wrapper for API calls with basic error handling
 */
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || UI_STRINGS.ERROR);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Error] ${endpoint}:`, error);
        throw error;
    }
}

/**
 * formatWaitTime: Converts density to estimated minutes
 */
function formatWaitTime(density) {
    if (density < 30) return "< 5 mins";
    if (density < 60) return "5-10 mins";
    if (density < 85) return "10-20 mins";
    return "20+ mins";
}

window.VenueUtils = {
    showNotification,
    apiFetch,
    formatWaitTime,
    UI_STRINGS
};
