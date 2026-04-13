/**
 * VenueCrowd Engine Service
 * Consolidates all logic (Navigation, Queue, Gemini AI) for a compact codebase.
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { zones, networkGraph } = require('../data/venueData');

class VenueService {
  constructor() {
    this.genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
    this.zoneMap = new Map(zones.map(z => [z.id, z]));
  }

  // AI Assistant Analysis
  async analyze(query) {
    if (!this.genAI) return { analysis: "Simulation mode active. Gate B is recommended for current traffic." };
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const stats = zones.map(z => `${z.name}: ${z.density}%`).join(', ');
      const result = await model.generateContent(`User: "${query}". Stats: ${stats}. Recommend path avoiding >70% density. Use zone names. Brief.`);
      return { analysis: result.response.text() };
    } catch (e) { return { fallback: "Follow signs to Gate B for low congestion." }; }
  }

  // Dijkstra Pathfinding
  findPath(start, end) {
    const dist = {}, prev = {}, nodes = new Set(Object.keys(networkGraph));
    nodes.forEach(n => dist[n] = Infinity);
    dist[start] = 0;

    while (nodes.size) {
      const u = [...nodes].reduce((a, b) => dist[a] < dist[b] ? a : b);
      if (dist[u] === Infinity || u === end) break;
      nodes.delete(u);
      (networkGraph[u] || []).forEach(v => {
        const cost = dist[u] + (1 + (this.zoneMap.get(v)?.density || 0) / 10);
        if (cost < dist[v]) { dist[v] = cost; prev[v] = u; }
      });
    }

    const path = [];
    for (let c = end; c; c = prev[c]) path.unshift(c);
    if (path[0] !== start) return null;

    return { 
      path, 
      cost: parseFloat(dist[end].toFixed(2)),
      benefit: dist[end] > path.length * 1.5 ? "Avoiding high density zones." : "Direct path."
    };
  }

  // Wait time predictions
  getQueues() {
    return zones.map(z => ({
      id: z.id,
      name: z.name,
      wait: Math.round(z.baseWait + (z.density / 10) * 2),
      status: z.density > 80 ? 'Heavy' : (z.density > 40 ? 'Moderate' : 'Low')
    }));
  }
}

module.exports = new VenueService();
